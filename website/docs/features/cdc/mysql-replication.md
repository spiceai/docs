---
title: 'MySQL Binlog Replication (Native CDC)'
sidebar_label: 'MySQL Binlog Replication'
description: 'Stream INSERT, UPDATE, and DELETE events from MySQL directly into a Spice-accelerated dataset using native binary log (binlog) replication.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Stream every `INSERT`, `UPDATE`, and `DELETE` from a MySQL table directly into a Spice-accelerated dataset by subscribing to the source's binary log (binlog) — the MySQL analog of [PostgreSQL Logical Replication](./postgres-replication.md).

This is the recommended way to keep a Spice accelerator ([DuckDB](../../components/data-accelerators/duckdb), [SQLite](../../components/data-accelerators/sqlite), [PostgreSQL](../../components/data-accelerators/postgres), [Cayenne](../../components/data-accelerators/cayenne), [Turso](../../components/data-accelerators/turso), Arrow) continuously in sync with a MySQL source. No Kafka, no Debezium, no external CDC infrastructure — one `spicepod.yml` entry gives you a locally materialized, continuously updated copy of a MySQL table.

## How it works

```text
┌────────────┐   binlog (ROW events)   ┌──────────────────────────────┐
│   MySQL    │ ──────────────────────► │            spiced            │
│  (source)  │                         │  decode → ChangeBatch →      │
│            │                         │  accelerator upsert/delete   │
└────────────┘                         └──────────────────────────────┘
       ▲                                        │
       └── resume position persisted in the ────┘
           accelerator (spice_sys_mysql_binlog)
```

On first start the connector:

1. **Validates and discovers.** Spice validates the source server settings (see [Prerequisites](#prerequisites)) and reads the table's column layout from `information_schema` (binlog row events are positional — they carry no column names).
2. **Captures the head position.** The current binlog file and offset is captured _before_ the snapshot, so changes racing the snapshot are delivered at least once and converge via the primary-key upsert.
3. **Snapshots.** The table's existing rows stream in over a `START TRANSACTION WITH CONSISTENT SNAPSHOT` read, in batches of `mysql_replication_bootstrap_batch_size`. A truncate barrier is applied first so a re-bootstrap over a persistent accelerator starts clean.
4. **Persists the position.** Once the snapshot is durably applied, the captured head position is written to the accelerator's `spice_sys_mysql_binlog` sidecar table. This is Spice's replacement for a Postgres replication slot — MySQL keeps no per-replica cursor server-side.
5. **Streams.** Spice attaches as a replica (`COM_BINLOG_DUMP`) and turns committed transactions into insert/update/delete/truncate changes. The committed position checkpoints to the sidecar every `mysql_replication_checkpoint_interval`.

On subsequent restarts, if a persisted position exists, the connector resumes from it directly — no snapshot — and marks the dataset ready immediately. Because the position lives inside the accelerator itself, data and cursor share one lifecycle: a non-persistent accelerator (`arrow`, or `mode: memory`) boots with no position and naturally re-snapshots — no special configuration needed.

Delivery is **at-least-once**: a crash between applying a change and checkpointing its position replays up to one checkpoint interval of history, which the primary-key upsert absorbs idempotently. This is the same contract as the [PostgreSQL connector's](./postgres-replication.md) snapshot/WAL boundary.

## Minimal configuration

```yaml
datasets:
  - from: mysql:mydb.orders
    name: orders
    params:
      mysql_host: db.internal
      mysql_tcp_port: '3306'
      mysql_user: replicator
      mysql_pass: ${secrets:mysql_pass}
      mysql_db: mydb
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_mode: changes
      primary_key: id
      on_conflict:
        id: upsert
```

`primary_key` + `on_conflict: upsert` are **required** (except on the append-only `arrow` engine): UPDATE events apply as upserts keyed on the primary key and DELETE events are routed by it. The connector fails fast at startup with an actionable message if either is missing.

All upsert-capable accelerator engines are supported — `duckdb`, `sqlite`, `cayenne`, `postgres`, and `turso` — and each persists the binlog resume position in its `spice_sys_mysql_binlog` sidecar when file-backed. The `arrow` engine works append-only (UPDATEs insert new rows).

## Prerequisites

The following source server settings are required. Spice validates them at startup and fails fast with an actionable message if any is wrong.

| Setting                      | Required value                       | Notes                                                                        |
| ---------------------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `log_bin`                    | `ON`                                 | Default on MySQL 8.0+.                                                        |
| `binlog_format`              | `ROW`                                | Default on MySQL 8.0+. Validated at startup.                                 |
| `binlog_row_image`           | `FULL`                               | Default. Validated at startup; `MINIMAL` images are rejected.               |
| `binlog_row_value_options`   | `''` (empty)                         | Validated at startup; partial JSON row images cannot be applied.            |
| `binlog_expire_logs_seconds` | ≥ longest expected spiced downtime   | See [When the position is purged](#when-the-position-is-purged).             |

The connecting user needs:

```sql
GRANT SELECT ON mydb.orders TO 'replicator'@'%';           -- snapshot + layout discovery
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'replicator'@'%';
```

## Parameters

Configure replication behavior with the following `params` on the MySQL dataset:

| Parameter                                    | Default   | Description                                                                                                                                                                                                                        |
| -------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mysql_replication_server_id`                | derived   | The `server_id` this replica registers with. Must be unique among all replicas attached to the source. The default is derived from the **connection identity** (host, port, user, credentials, TLS) mixed with a per-process nonce, so datasets sharing a connection coalesce onto one binlog connection while two spiced instances don't collide, and derived values stay at or above `100000` to avoid hand-assigned replica ids. Setting distinct explicit values is how to opt a dataset out of [connection sharing](#sharing-one-binlog-connection). |
| `mysql_replication_initial_snapshot`         | `auto`    | When existing rows load: `auto` snapshots when no resumable position exists and resumes without a snapshot when one does; `disabled` streams changes only; `always` re-snapshots on every start, discarding any persisted position. |
| `mysql_replication_checkpoint_interval`      | `10s`     | How often the committed position persists to the sidecar. Bounds crash-replay volume.                                                                                                                                              |
| `mysql_replication_bootstrap_batch_size`     | `8192`    | Rows per emitted snapshot batch. Maximum: `1048576`.                                                                                                                                                                              |
| `mysql_replication_invalid_checkpoint_behavior` | `error`   | What to do when the persisted position cannot be resumed losslessly — it was purged from the source, the source's GTID history diverged from the checkpoint, or the source table's column layout drifted incompatibly with the recorded position: `error`, or `restart` (drop the position and re-snapshot). |
| `mysql_replication_ready_lag`                | `2s`      | For `refresh_mode: changes`, the dataset is marked Ready once its replication lag (now minus the newest applied commit's binlog-header timestamp) falls below this. The dataset stays not-ready while snapshotting or draining a backlog on resume, so it never serves stale data. |

The runtime-level CDC apply tunables (`cdc_prefetch_buffer`, `cdc_max_coalesced_envelopes`, `cdc_max_coalesced_bytes`, `cdc_max_coalesce_age_ms`, `cdc_commit_timeout_ms`) apply to this connector the same way they do to the PostgreSQL one — see [Tuning ingestion](./index.md#tuning-ingestion).

## Resume identity: GTID or file + offset

The connector picks its resume identity from the source. When the source reports `@@GLOBAL.gtid_mode = ON`, Spice resumes with **GTID auto-positioning** and persists the executed GTID set in the `spice_sys_mysql_binlog` sidecar alongside the binlog file and offset. Otherwise it resumes from **file + offset**:

| Source `@@GLOBAL.gtid_mode`                 | Resume identity |
| ------------------------------------------- | --------------- |
| `ON`                                        | GTID auto-positioning |
| `OFF`, `ON_PERMISSIVE`, `OFF_PERMISSIVE`    | File + offset — a mixed topology can still emit anonymous transactions, which GTID auto-positioning cannot resume from. |
| Variable not supported (MariaDB, pre-GTID MySQL) | File + offset |

A GTID cursor survives a source failover: a promoted replica inherits the same global GTIDs, so the persisted set still resolves against the new primary. File + offset positions do not — binlog coordinates are per-server.

## When the source is reset or rebuilt

On a GTID resume, Spice requires the persisted GTID set to be a **subset of the source's current `@@gtid_executed`**. A `RESET MASTER`, a rebuilt server with a fresh `server_uuid`, a different source, or a diverged history reports an executed set that no longer contains the checkpoint — resuming from it would silently serve pre-reset data.

When the check fails, `mysql_replication_invalid_checkpoint_behavior` decides the response, exactly as for a purged position: `error` (the default) stops with an actionable error, and `restart` drops the stale position and re-snapshots. On the file + offset path the equivalent guard is the presence of the persisted binlog file in the source's log index.

## When the position is purged

MySQL expires binary logs on its own schedule (`binlog_expire_logs_seconds`, default 30 days; much shorter on some managed services). If spiced is down long enough for the persisted position's file to be purged, the stream cannot resume losslessly. By default this surfaces as an error naming the fix; set:

```yaml
params:
  mysql_replication_invalid_checkpoint_behavior: restart
```

to instead drop the stale position, truncate the accelerator, and re-snapshot the table automatically.

## Sharing one binlog connection

`COM_BINLOG_DUMP` has no server-side table filter — every subscriber receives the whole server binlog — so a connection per dataset would duplicate the entire stream for no benefit. Sharing is therefore **always on and requires no configuration**: every `refresh_mode: changes` dataset that connects the same way joins a single shared source (one dump connection, one `server_id`), and decoded transactions are routed to each member's accelerator by `(database, table)`.

Sharing is keyed by connection identity — host, port, user, password, TLS settings, and `mysql_replication_server_id`. The database is **not** part of the key, so datasets on the same server but different databases still share one connection. Datasets that connect differently (a different user, or an explicit distinct `mysql_replication_server_id`) get their own connection.

Because MySQL keeps no server-side cursor, each member persists its own committed position in its own `spice_sys_mysql_binlog` sidecar row, and the shared connection resumes from the **minimum** committed position across members; members already ahead of it suppress the replay. A member taking its initial snapshot is held out of routing with its floor pinned at the position it joined at, so a long snapshot never back-pressures the others.

:::warning[A stalled member can force the group to re-bootstrap]

Unlike a PostgreSQL replication slot, a held binlog position pins nothing server-side. If a member detaches — a schema change classified as DDL is member-fatal, detaching that one dataset while the group keeps running — its held floor holds back only the shared resume position. Should the source then purge binlogs past that point (`binlog_expire_logs_seconds`), the whole group must re-bootstrap.

A detach logs an `ERROR` and flips that dataset's `dataset_mysql_replication_member_attached` gauge to `0`, which identifies exactly which dataset is holding the group back. Recovery is bounded per member by `mysql_replication_invalid_checkpoint_behavior` on the next resume. A slow-but-live member is handled by back-pressure and is never detached.

:::

## When the source layout changes

Binlog row events are positional — each event carries column values in source-ordinal order, not by name — so the connector tracks the source table's column layout and refuses to apply events it can't line up against that layout. Compatible changes are adopted automatically: an additive `ALTER TABLE` is picked up from `information_schema` at the schema-change boundary and the stream continues without interruption — subject to the cross-check in [Layout adopted under lag](#layout-adopted-under-lag).

An **incompatible** change — one where the recorded position would replay row images against a layout that no longer matches (for example resuming after the source table's shape drifted while spiced was down, in a way the stream cannot reconcile with the events it still needs to replay) — cannot be applied without risking silent column misalignment. Rather than corrupt the accelerator, the connector stops and leaves the last known-good position in place. As with a purged position, `mysql_replication_invalid_checkpoint_behavior` controls the response: `error` (the default) surfaces an actionable error, and `restart` drops the position and re-snapshots the table from the current layout.

### Layout adopted under lag

A layout re-read from `information_schema` describes the source table **as it is now**, which under replication lag can already be a *later* DDL than the events still in flight. If the source applies a second `ALTER TABLE` with the same column count — a reorder (`MODIFY ... FIRST` / `AFTER`) or a rename swap — before Spice reaches the first one, the adopted layout maps ordinals the in-flight row images do not use. Column counts still agree, every name still resolves, and values still convert, so nothing would fail on its own.

To catch this, every routed change is cross-checked against the column types the binlog's own `TableMap` event carries — the one description of the row image that travels *with* it. A disagreement is member-fatal: that dataset detaches with an error naming the column and its ordinal, and the rest of the shared binlog group keeps running. Recover by letting replication catch up before the next schema change, then re-bootstrapping the detached dataset with `mysql_replication_invalid_checkpoint_behavior: restart`.

The comparison is deliberately coarse, because a false positive would break a healthy stream. It compares only type *classes*, and skips types whose wire encoding is ambiguous — `DATETIME`/`TIMESTAMP`/`TIME`, `TEXT`/`BLOB`, and `REAL` are not compared at all, and `CHAR`/`VARCHAR`/`BINARY`/`VARBINARY`/`ENUM`/`SET` are treated as a single class. What it does detect decisively is a reorder that moves columns of genuinely different types across each other (for example `INT` ↔ `VARCHAR`, `INT` ↔ `BIGINT`, or `DECIMAL` ↔ `INT`). Each detection increments `replication_schema_mismatch_errors_total`.

## Semantics and type notes

- **TRUNCATE TABLE** on the source applies as a truncate on the accelerator.
- **Primary-key updates** (`UPDATE ... SET id = ...`) apply as a delete of the old key plus an upsert of the new row, so no orphan rows linger.
- **TIMESTAMP columns** replicate as UTC (that is how the binlog stores them), and the snapshot pins its session to UTC to match. Set `mysql_time_zone: '+00:00'` (the default) so federated reads agree.
- **Zero dates** (`0000-00-00`) coerce to `NULL`, matching the read connector's default `mysql_zero_date_behavior: null`.
- **ENUM / SET** columns resolve to their label strings using the definition in `information_schema`.
- **UNSIGNED integers** map to the same signed Arrow types the read connector uses; values above the signed maximum fail loudly rather than wrap.
- **Negative `TIME` values** and spatial/geometry types are not supported — exclude such columns from the dataset schema.

## Schema changes

On `ALTER TABLE` against the replicated table, Spice re-fetches the table's layout from `information_schema` and keeps streaming as long as every dataset column still exists on the source — the same tolerance the PostgreSQL connector's block mode has:

- **Columns added on the source** are not replicated (a warning names them); add them to the dataset schema and restart to capture them.
- **Dropping or renaming a dataset column** (or `RENAME TABLE` / `DROP TABLE`) stops the stream with an actionable error.
- **Retyping a dataset column** keeps streaming while values remain convertible to the dataset's Arrow type; an unconvertible value stops the stream with a decode error.

If the stream stopped across a DDL boundary with an un-checkpointed tail, the restart may be unable to decode pre-DDL events — re-bootstrap with `mysql_replication_invalid_checkpoint_behavior: restart`. Quiescing writes to the table around DDL avoids that case entirely.

Issuing a second `ALTER TABLE` before replication has caught up on the first can also detach the dataset — see [Layout adopted under lag](#layout-adopted-under-lag).

## Metrics

Exposed under `dataset_mysql_*` alongside the connection-pool [component metrics](../observability/component_metrics):

| Metric                                                                                                   | Meaning                                                                                                                        |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `replication_gtid_enabled`                                                                                | `1` while the stream positions by GTID auto-positioning, `0` for binlog file + offset — see [Resume identity](#resume-identity-gtid-or-file--offset). |
| `replication_lag_ms`                                                                                      | Now minus the newest applied source commit timestamp (1s granularity).                                                       |
| `replication_lag_bytes`                                                                                   | Binlog bytes between the source head and the resume position. Reported only while both are in the same binlog file; absent otherwise. |
| `replication_source_head_file` / `replication_source_head_pos`                                            | The source server's binlog head, polled every checkpoint interval.                                                            |
| `replication_committed_binlog_file` / `replication_committed_binlog_pos`                                  | The checkpointed resume position.                                                                                             |
| `replication_transactions_total`                                                                          | Source transactions observed.                                                                                                 |
| `replication_inserts_total` / `replication_updates_total` / `replication_deletes_total` / `replication_truncates_total` | Row events applied.                                                                                            |
| `replication_bootstrap_rows_total` / `replication_bootstrap_rows_expected` / `replication_bootstrap_complete` | Snapshot progress.                                                                                                       |
| `replication_decode_errors_total`                                                                         | Binlog decode failures.                                                                                                       |
| `replication_schema_mismatch_errors_total`                                                                | Mid-stream DDL detections.                                                                                                    |
| `replication_recv_errors_total` / `replication_reconnects_total`                                          | Transport health.                                                                                                             |
| `replication_checkpoint_persists_total` / `replication_checkpoint_persist_errors_total`                   | Sidecar checkpoint writes.                                                                                                    |
| `replication_member_attached`                                                                             | `1` while the dataset is an attached member of its shared binlog group, `0` once detached — see [Sharing one binlog connection](#sharing-one-binlog-connection). |

## Limitations

- **Failover only survives on a GTID source.** With `gtid_mode = ON` the persisted GTID set resolves against a promoted replica; on a file + offset source, resume positions do not survive a failover to a different primary (see [Resume identity](#resume-identity-gtid-or-file--offset)).
- **One table per dataset.** Every dataset replicates a single source table, though datasets that connect the same way share one binlog connection — see [Sharing one binlog connection](#sharing-one-binlog-connection).
- **Schema evolution is block-mode only** — compatible `ALTER TABLE` is tolerated (see [Schema changes](#schema-changes)), but `on_schema_change` policies that _adopt_ new columns (`append_new_columns` / `sync_all_columns`) are not yet wired to this connector.
- **XA (two-phase) transactions are not supported.** An XA transaction that touches the replicated table stops the stream with an error; XA activity on other tables logs a warning and is ignored.
- Not supported source types: geometry/spatial, vectors, negative `TIME`.
