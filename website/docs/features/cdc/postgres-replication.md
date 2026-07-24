---
title: 'PostgreSQL Logical Replication (Native CDC)'
sidebar_label: 'PostgreSQL Logical Replication'
description: 'Stream INSERT, UPDATE, and DELETE events from PostgreSQL directly into a Spice-accelerated dataset using native logical replication.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Stream every `INSERT`, `UPDATE`, and `DELETE` from a PostgreSQL table directly into a Spice-accelerated dataset over Postgres' native logical replication protocol.

This is the recommended way to keep a Spice accelerator ([DuckDB](../../components/data-accelerators/duckdb), [SQLite](../../components/data-accelerators/sqlite), [PostgreSQL](../../components/data-accelerators/postgres), Cayenne, Arrow) continuously in sync with a PostgreSQL source.

## How it works

```
┌────────────────┐   WAL (pgoutput)   ┌───────────────────┐   ChangeBatch   ┌───────────────┐
│   PostgreSQL   │──────────────────▶│    Spice runtime  │────────────────▶│  Accelerator  │
│  wal_level=    │   replication     │  (postgres        │    (INSERT/     │  DuckDB /     │
│  logical       │   slot            │   connector)      │     UPDATE /    │  SQLite /     │
│                │                   │                   │     DELETE)     │  Postgres /   │
└────────────────┘                   └───────────────────┘                 │  Cayenne      │
                                                                           └───────────────┘
```

On first start the connector:

1. Creates a **publication** (default name `spice_<dataset>_<hash>_pub`) containing the source table.
2. Creates a **replication slot** (default `spice_<dataset>_<dataset-hash>_<instance-hash>`). The `<instance-hash>` gives each Spice replica its own slot.
3. Runs a **REPEATABLE READ snapshot** of the source table so the accelerator starts with all existing rows.
4. Starts streaming WAL changes from the slot. Each committed transaction is delivered as a `ChangeBatch` (grouped `INSERT`/`UPDATE`/`DELETE`) and applied to the accelerator.

On subsequent restarts the connector detects the existing slot and **resumes from Postgres' stored `confirmed_flush_lsn`**.

## Prerequisites

### 1. Enable logical replication on the source Postgres

This requires a server restart.

```conf
# postgresql.conf
wal_level = logical
max_replication_slots = 10   # at least one per Spice replica per dataset
max_wal_senders = 10
```

Verify:

```sql
SHOW wal_level;        -- must be 'logical'
SHOW max_replication_slots;
```

On managed Postgres services:

| Service              | How to enable                                                                       |
|----------------------|-------------------------------------------------------------------------------------|
| AWS RDS              | Set `rds.logical_replication = 1` in the parameter group and restart.               |
| Aurora PostgreSQL    | Set `rds.logical_replication = 1`; wait for DB reboot.                              |
| GCP Cloud SQL        | Flag: `cloudsql.logical_decoding = on`.                                             |
| Azure Database       | Under **Replication**, set *Replication support* to `LOGICAL`.                      |
| Supabase / Neon      | Logical replication is enabled by default.                                          |

### 2. The source table must have a replica identity

Spice needs the primary key columns in every `UPDATE`/`DELETE` event, so one of the following must be true:

- The table has a **primary key** (default — nothing to do).
- Or the table has `REPLICA IDENTITY FULL`:

  ```sql
  ALTER TABLE public.users REPLICA IDENTITY FULL;
  ```

Tables with `REPLICA IDENTITY NOTHING` are rejected at startup.

### 3. The Postgres role needs these privileges

```sql
GRANT CONNECT ON DATABASE mydb TO spice;
GRANT USAGE ON SCHEMA public TO spice;
GRANT SELECT ON public.users TO spice;
ALTER ROLE spice WITH REPLICATION;            -- or be a superuser
-- If you let Spice create the publication (default):
GRANT CREATE ON DATABASE mydb TO spice;
```

## Minimal configuration

```yaml
datasets:
  - from: postgres:public.users
    name: users
    params:
      pg_host: pg.internal
      pg_port: '5432'
      pg_user: spice
      pg_pass: ${secrets:pg_pass}
      pg_db: myapp
      pg_sslmode: verify-full      # or: disable | prefer | require | verify-ca
      pg_sslrootcert: /etc/ssl/pg-ca.pem   # optional; omit to use system root CAs
    acceleration:
      enabled: true
      engine: duckdb           # or: sqlite | postgres | cayenne | arrow
      refresh_mode: changes    # <-- triggers WAL streaming
      primary_key: id
      on_conflict:
        id: upsert             # required for UPDATE to become an upsert
```

Start the runtime. Spice will:

- Auto-create publication `spice_users_<dataset-hash>_pub`.
- Auto-create replication slot `spice_users_<dataset-hash>_<instance-hash>`.
- Snapshot `public.users` into the DuckDB accelerator.
- Stream every subsequent change as it commits on Postgres.

:::tip Use a persistent accelerator
Pair with `mode: file` on DuckDB/SQLite (or the PostgreSQL accelerator) so restarts resume from the last acknowledged LSN instead of re-snapshotting.
:::

## Full configuration reference

All replication-specific parameters live under `params:` on the dataset and start with `pg_`:

| Parameter                            | Default                                          | Description                                                                                                                                                                                            |
|--------------------------------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `pg_replication_slot`                | `spice_<dataset>_<dataset-hash>_<instance-hash>` | Name of the replication slot to create/reuse. Datasets on the same connection that name the same slot **share** it — one slot, one publication, one replication connection — see [Sharing one slot across datasets](#sharing-one-slot-across-datasets). Each Spice replica must still use its own unique slot.                                          |
| `pg_publication`                     | `spice_<dataset>_<dataset-hash>_pub`             | Publication name. Defaults to `<slot>_pub` when `pg_replication_slot` is set explicitly (so datasets sharing a slot agree on it). Shared across replicas. Auto-created if missing.                                                                  |
| `pg_replication_initial_snapshot`    | `auto`                                           | When `refresh_mode: changes` first loads existing rows: `auto` (default) snapshots a freshly-created slot and resumes an existing one without a snapshot (a non-persistent accelerator still re-snapshots on every start); `disabled` streams WAL changes only; `always` snapshots on every start, including slot resume. The legacy booleans `true`/`false` are deprecated and map to `auto`/`disabled`. |
| `pg_replication_ready_lag`           | `2s`                                             | For `refresh_mode: changes`, the dataset is marked Ready once its replication lag (now minus the newest applied commit's source time) falls below this. It stays not-ready while snapshotting or draining a backlog on resume, so it never serves stale data.  |
| `pg_replication_temporary_slot`      | `false`                                          | If `true`, the slot is dropped when Spice disconnects. Every restart re-bootstraps.                                                                                                                    |
| `pg_replication_status_interval`     | `10s`                                            | How often `StandbyStatusUpdate` (LSN acknowledgement) is sent back to Postgres. Lower values free WAL faster; higher values reduce network chatter. Accepts any duration string (`500ms`, `30s`, `2m`). |
| `pg_replication_bootstrap_batch_size` | `8192`                                          | Rows per emitted batch during the initial-snapshot bootstrap. Larger batches reduce per-batch overhead at the cost of more memory per batch. Maximum: `1048576`.                                       |
| `pg_replication_member_channel_capacity` | `1024`                                       | Shared-slot only: envelopes buffered per member table before the shared replication pump back-pressures. Too small a value lets one member's transient stall block the whole slot (head-of-line blocking). Maximum: `1048576`. |

All existing `pg_host`, `pg_port`, `pg_user`, `pg_pass`, `pg_db`, `pg_sslmode`, `pg_connection_string` parameters continue to apply — see the [PostgreSQL Data Connector](../../components/data-connectors/postgres) reference.

### `pg_sslmode` for WAL streaming

`verify-full` is the recommended production default.

| `pg_sslmode`       | Replication transport | Cert chain verified | Hostname verified |
|--------------------|-----------------------|:-------------------:|:-----------------:|
| `disable`          | plaintext             | —                   | —                 |
| `prefer` (default) | plaintext             | —                   | —                 |
| `require`          | TLS                   | ❌                  | ❌                |
| `verify-ca`        | TLS                   | ✅                  | ❌                |
| `verify-full`      | TLS                   | ✅                  | ✅                |

:::info
`prefer` behaves as plaintext on the replication transport because the replication client does not expose a safe "try TLS, fall back to plaintext" path. Set `require`, `verify-ca`, or `verify-full` to force TLS on the WAL stream.
:::

### Accelerator engines

| Engine     | `INSERT` |           `UPDATE`           | `DELETE` | Notes                                                                                                                                                                                                  |
|------------|:--------:|:----------------------------:|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `duckdb`   |    ✅    | ✅ (upsert)                  |    ✅    | Recommended for most workloads.                                                                                                                                                                        |
| `sqlite`   |    ✅    | ✅ (upsert)                  |    ✅    | Great for small/medium datasets.                                                                                                                                                                       |
| `postgres` |    ✅    | ✅ (upsert)                  |    ✅    | Use when the accelerator is another Postgres.                                                                                                                                                          |
| `cayenne`  |    ✅    | ✅ (upsert)                  |    ✅    | S3-backed Vortex format, good for read-heavy analytics.                                                                                                                                                |
| `arrow`    |    ✅    | ✅ (upsert with primary key) |    ✅    | Arrow's in-memory engine uses a hash index for primary-key upserts. Without a primary key, `UPDATE`s are appended as new rows. `DELETE` and `TRUNCATE` are applied via Arrow's `DeletionTableProvider`. |

For Arrow workloads that need true upsert semantics (so `UPDATE`s replace existing rows instead of duplicating them), configure a `primary_key`. DuckDB, SQLite, PostgreSQL, and Cayenne also support upsert behavior.

## Sharing one slot across datasets

By default each changes-mode dataset gets its own replication slot and publication. On the source database that costs one logical slot **and** one walsender decoder over the full WAL stream per dataset, so mirroring many tables can exhaust `max_replication_slots` and multiply decode work.

When several datasets on the **same connection** name the same `pg_replication_slot`, Spice multiplexes them onto **one slot, one publication, and one replication connection**, routing decoded changes to each dataset's accelerator by `(schema, table)`. Sharing is implicit — name the same slot and the datasets share it:

```yaml
datasets:
  - from: postgres:public.users
    name: users
    params: &repl
      pg_host: db.internal
      pg_db: app
      pg_user: spice
      pg_pass: ${secrets:pg_pass}
      pg_replication_slot: spice_app_cdc   # same slot ⇒ shared
    acceleration:
      enabled: true
      engine: duckdb
      refresh_mode: changes
      primary_key: id
      on_conflict:
        id: upsert
  - from: postgres:public.orders
    name: orders
    params: *repl                          # same connection + slot ⇒ shares the slot above
    acceleration:
      enabled: true
      engine: duckdb
      refresh_mode: changes
      primary_key: id
      on_conflict:
        id: upsert
```

Notes:

- A slot named by only one dataset behaves exactly as before (a single member).
- Datasets without an explicit `pg_replication_slot` keep their dedicated per-dataset slot and publication.
- Members of a shared slot must agree on the publication. The default becomes `<slot>_pub`; an explicit `pg_publication` still wins and is validated for consistency across members.
- Each source table can back **at most one dataset per shared slot**. Pointing two datasets at the same `(schema, table)` through one slot is rejected — give the second dataset a different `pg_replication_slot` (or remove the param for a dedicated slot).
- Sharing is per Spice instance. Across replicas, each replica must still use its own unique slot — see [Multi-replica deployments](#multi-replica-deployments).

## Multi-replica deployments

Every Spice replica must have its own replication slot. Spice hashes the replica's identity into the default slot name:

| Source                          | Used for                                                       |
|---------------------------------|----------------------------------------------------------------|
| `SPICE_INSTANCE_ID` env         | Preferred — set it explicitly per replica.                     |
| `HOSTNAME` / `COMPUTERNAME` env | Fallback — works on Kubernetes where each pod has a distinct hostname. |

### Example: Kubernetes StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: spice
spec:
  replicas: 3
  serviceName: spice
  template:
    spec:
      containers:
        - name: spice
          env:
            - name: SPICE_INSTANCE_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name   # spice-0, spice-1, spice-2
```

### Example: explicit slot names

```yaml
# Replica A
params:
  pg_replication_slot: spice_users_a

# Replica B
params:
  pg_replication_slot: spice_users_b
```

Each Spice replica can use a different `pg_replication_slot` while sharing a publication (`pg_publication`).

## Operations

### Monitoring replication lag

```sql
SELECT
  slot_name,
  active,
  confirmed_flush_lsn,
  pg_wal_lsn_diff(pg_current_wal_lsn(), confirmed_flush_lsn) AS lag_bytes
FROM pg_replication_slots
WHERE slot_name LIKE 'spice_%';
```

### Decommissioning a replica

:::danger Drop unused slots
A permanent replication slot **holds on to WAL** until dropped. If you retire a Spice replica without cleaning up its slot, Postgres will keep accumulating WAL indefinitely and can run out of disk.
:::

After removing a Spice replica, drop its slot:

```sql
SELECT pg_drop_replication_slot('spice_users_<old-instance-hash>');
```

### Rebuilding an accelerator from scratch

Delete the accelerator's local storage (DuckDB file, SQLite file, etc.) and drop the replication slot. On next start, Spice will create a fresh slot, snapshot the table, and resume streaming.

### Resilience

- **Network blips / Postgres restarts**: transient — retried with exponential backoff (500 ms → 30 s, ±20 % jitter). The slot's server-side state is the source of truth, so reconnects resume from the last acknowledged LSN — no data loss.
- **Auth failures, missing slot, schema mismatch**: fatal — surfaced as a stream-level error so operators can fix the configuration.
- **Watch `dataset_postgres_replication_reconnects_total`** to detect flaky networks.

## Metrics

Spice emits OpenTelemetry metrics for every replicated Postgres dataset. Metric names follow the pattern `dataset_postgres_replication_<metric>` with a `name=<dataset>` attribute.

Core freshness signals (auto-registered):

| Metric                                     | Type    | Description                                                                                           |
|--------------------------------------------|---------|-------------------------------------------------------------------------------------------------------|
| `dataset_postgres_replication_lag_ms`      | Gauge   | `now() − commit_time(latest ingested txn)`. Primary CDC freshness signal.                             |
| `dataset_postgres_replication_lag_bytes`   | Gauge   | `server_wal_end_lsn − confirmed_flush_lsn`. Unacknowledged WAL held by Spice's slot.                  |
| `dataset_postgres_replication_transactions_total` | Counter | Committed transactions applied.                                                                 |
| `dataset_postgres_replication_inserts_total` / `dataset_postgres_replication_updates_total` / `dataset_postgres_replication_deletes_total` | Counter | Row-level events from WAL.                                      |
| `dataset_postgres_replication_reconnects_total` | Counter | Number of times the stream reconnected after a transient failure.                            |

## Troubleshooting

| Symptom                                                                      | Cause and fix                                                                                                                     |
|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Error: *`Table public.X has REPLICA IDENTITY NOTHING`*                       | Run `ALTER TABLE public.X REPLICA IDENTITY FULL;` (or add a primary key).                                                         |
| Error: *`replication slot "..." already exists`* on startup                  | Another Spice replica is using the same slot name. Set `pg_replication_slot` uniquely, or ensure `SPICE_INSTANCE_ID` differs.     |
| Error mentioning *permission denied for database* during setup               | The role needs `CREATE` on the database, or pre-create the publication/slot yourself.                                             |
| `pg_replication_slots.active` is `true` but the accelerator isn't updating   | Check Spice logs for schema-mismatch errors. The replication task holds the slot even after failure — restart after fixing.       |
| `wal` on the source disk growing forever                                     | An abandoned slot. Drop it with `pg_drop_replication_slot`.                                                                       |
| `UPDATE`s on Arrow-engine dataset don't replace rows                         | Configure a `primary_key` so Arrow can use its hash index for upserts, or switch to `duckdb`, `sqlite`, `postgres`, or `cayenne`. |
| Huge `TEXT`/`JSONB` columns show as `NULL` after `UPDATE`                    | Unchanged TOASTed columns are omitted by pgoutput. Run `ALTER TABLE ... REPLICA IDENTITY FULL;` if you need them in every event.  |

## Limitations

- **One table per dataset.** Each Spice dataset replicates exactly one source table; each dataset gets its own slot and publication.
- **No DDL replication.** Schema changes on the source are not propagated automatically. Add new columns as nullable on the source first, update the Spice dataset, then reload the Spicepod.
- **Arrow engine** supports `on_conflict` upserts when a `primary_key` is configured. Without a primary key, `UPDATE`s appear as additional inserts rather than replacing existing rows. `DELETE` and `TRUNCATE` are applied either way.

## Comparison with Debezium + Kafka

| Aspect                   | Debezium + Kafka                                | Native WAL streaming (this feature)   |
|--------------------------|-------------------------------------------------|---------------------------------------|
| External services        | Kafka + Schema Registry + Debezium + Connect    | None — Spice connects to Postgres directly |
| Deployment footprint     | JVM stack + ZooKeeper/KRaft                     | Zero extra pods                       |
| Setup complexity         | Multiple topics, connector configs, ACLs        | One connector config                  |
| Operational model        | Consumer groups, topic retention                | One replication slot per replica      |
| Schema registry required | Yes (Avro/Protobuf)                             | No — schema derived from Postgres catalog |
| Latency                  | Kafka-bound (~100 ms+)                          | Commit-driven, typically &lt;100 ms   |

For greenfield Postgres → Spice CDC, prefer native WAL streaming. If Kafka is already deployed for other reasons, the [Debezium](../../components/data-connectors/debezium) path continues to work.

## See also

- [Change Data Capture overview](./index.md)
- [PostgreSQL Data Connector](../../components/data-connectors/postgres)
- [PostgreSQL: Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
