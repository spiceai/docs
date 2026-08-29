---
title: 'PostgreSQL Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the PostgreSQL data connector in production: authentication, connection pooling, TLS, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - postgres
  - observability
---

Production operating guide for the PostgreSQL data connector covering authentication, connection pool sizing, TLS, metrics, and observability.

## Authentication & Secrets

The connector uses the native PostgreSQL wire protocol with username/password authentication.

| Parameter          | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| `pg_host`          | PostgreSQL server hostname.                                                  |
| `pg_port`          | TCP port (default `5432`).                                                   |
| `pg_db`            | Database name.                                                               |
| `pg_user`          | Database user.                                                               |
| `pg_pass`          | Password. Use `${secrets:...}` to resolve from a configured secret store.    |
| `pg_connection_string` | Alternative to the individual parameters.                                |

Passwords must be sourced from a secret store in production. See [Secret Stores](../../secret-stores/) for configuration options (environment variables, file, Kubernetes, AWS Secrets Manager, HashiCorp Vault).

### TLS

TLS is controlled via `pg_sslmode`:

| Value         | Behavior                                                    |
| ------------- | ----------------------------------------------------------- |
| `disable`     | No TLS.                                                     |
| `prefer`      | Try TLS, fall back to plaintext. Not recommended for production. |
| `require`     | Require TLS; no server certificate verification.            |
| `verify-ca`   | Require TLS and verify the CA chain.                        |
| `verify-full` | (default) Require TLS, verify CA chain, and verify server hostname. |

For production, use `verify-full` with `pg_sslrootcert` pointing to the CA bundle file path.

## Resilience Controls

### Connection Pool Sizing

The connector maintains a per-dataset connection pool:

| Parameter                       | Default | Description                                          |
| ------------------------------- | ------- | ---------------------------------------------------- |
| `pg_connection_pool_min_idle`   | `1`     | Minimum idle connections held by the pool.            |
| `connection_pool_size`          | `5`     | Maximum connections the pool will open.               |

When `pg_connection_pool_min_idle` exceeds `connection_pool_size`, the pool silently caps idle connections at the pool size.

Size the pool to match concurrent query and refresh load for the dataset. The server's `max_connections` (default 100) is a shared budget across Spice datasets, other clients, and server-side background workers — plan accordingly, or front Postgres with PgBouncer.

### Application Name

The connector automatically sets `application_name` to the Spice.ai version string, which surfaces in `pg_stat_activity.application_name`. This value is not configurable.

### Retry Behavior

Transient query failures are not automatically retried at the connector layer. Dataset refresh retries are controlled by the acceleration refresh policy (see [Data Refresh](../../../features/data-acceleration/data-refresh)).

## Capacity & Sizing

- **Network**: Postgres traffic is TCP. Sum `connection_pool_size` across all Spice datasets sharing the server when sizing `max_connections`.
- **Memory**: Result sets are streamed in record batches; memory footprint for federated reads is bounded by DataFusion's batch size (8192 rows default).
- **Connection setup cost**: TLS handshake and authentication add latency to cold connections. `connection_pool_min_idle` keeps a warm pool to absorb burst traffic.

## Metrics

The PostgreSQL connector exposes observable metrics for its replication pipeline. Every metric below is auto-registered — no configuration is required to export it — **except** `replication_truncates_total` and `replication_bootstrap_rows_total`, which are opt-in and must be listed in the dataset's `metrics` section. To turn an auto-registered metric off for a dataset, set `enabled: false` there. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

| Metric Name                                     | Type              | Description                                                                                                                       |
| ----------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `replication_lag_ms`                            | ObservableGauge   | Milliseconds between now and the Postgres commit timestamp of the most recently replicated transaction. Primary freshness signal.  |
| `replication_lag_bytes`                         | ObservableGauge   | WAL bytes between the server's latest reported position and the last confirmed flush LSN.                                          |
| `replication_confirmed_flush_lsn`               | ObservableGauge   | Most recent LSN acknowledged to Postgres. Matches `pg_replication_slots.confirmed_flush_lsn`.                                      |
| `replication_server_wal_end_lsn`                | ObservableGauge   | Most recent WAL end LSN reported by the Postgres server.                                                                           |
| `replication_reader_input_wait_micros_total`    | ObservableCounter | Microseconds the reader spent blocked awaiting the next source event. High relative to the processing counter ⇒ source-bound.       |
| `replication_reader_processing_micros_total`    | ObservableCounter | Microseconds the reader spent decoding WAL and building change batches.                                                            |
| `replication_transactions_total`                | ObservableCounter | Transactions committed and applied to the accelerator.                                                                             |
| `replication_inserts_total`                     | ObservableCounter | `INSERT` operations received from WAL.                                                                                             |
| `replication_updates_total`                     | ObservableCounter | `UPDATE` operations received from WAL.                                                                                             |
| `replication_deletes_total`                     | ObservableCounter | `DELETE` operations received from WAL.                                                                                             |
| `replication_truncates_total`                   | ObservableCounter | `TRUNCATE` operations received from WAL and applied. **Opt-in.**                                                                   |
| `replication_bootstrap_rows_total`              | ObservableCounter | Rows loaded during the initial-snapshot bootstrap. **Opt-in.**                                                                     |
| `replication_bootstrap_rows_expected`           | ObservableGauge   | Estimated bootstrap row count from schema inference. Absent when no estimate exists; `0` means a known-empty source table.          |
| `replication_bootstrap_complete`                | ObservableGauge   | `1` once the initial snapshot finished (or was skipped on resume); `0` while it is still running.                                   |
| `replication_decode_errors_total`               | ObservableCounter | pgoutput decoding errors encountered while parsing WAL events.                                                                     |
| `replication_acceleration_rebuilt`              | ObservableGauge   | `1` while the acceleration was rebuilt from the source on its last attach instead of resuming from the position it had recorded. A `cause` attribute says why. A dataset that resumed reports **no series at all** — not `0` — so alert on presence, not on value. |
| `replication_schema_mismatch_errors_total`      | ObservableCounter | Errors where the source relation no longer matches the declared accelerator schema.                                                |
| `replication_recv_errors_total`                 | ObservableCounter | Transport-level errors while receiving from the replication connection.                                                            |
| `replication_reconnects_total`                  | ObservableCounter | Times the stream reconnected after a transient failure. Non-zero with no user-visible error just means it recovered.                |
| `replication_disconnected_ms_total`             | ObservableCounter | Cumulative milliseconds the stream was disconnected across all reconnects, including backoff.                                       |
| `replication_member_send_stalled_seconds_total` | ObservableCounter | Seconds the shared-slot pump spent blocked delivering changes into this dataset's channel. Shared slots only.                       |
| `replication_member_send_wait_micros_total`     | ObservableCounter | Microseconds the shared-slot pump spent awaiting this dataset's delivery channel. Dedicated-slot datasets export `0`.                |
| `replication_member_attached`                   | ObservableGauge   | `1` while this dataset is an attached member of its shared slot, `0` once detached. Shared slots only.                              |
| `replication_member_envelopes_delivered_total`   | ObservableCounter | Change envelopes delivered to this dataset as distinct units of work. `replication_transactions_total` divided by this is the coalescing factor the apply loop sees. Shared slots only. |
| `replication_member_envelope_eager_merges_total` | ObservableCounter | Committed transactions folded into an envelope the shared-slot pump was still holding back, before delivery. Shared slots only.       |
| `replication_member_envelope_mailbox_merges_total` | ObservableCounter | Committed transactions folded into an envelope already sitting unclaimed in this dataset's delivery buffer — the back-pressure-driven half of coalescing. Shared slots only. |
| `replication_member_mailbox_coalesce_limited_total` | ObservableCounter | Times a committed transaction could not be folded into the unclaimed buffer tail because a configured bound refused it. `0` means the bounds never bind. Shared slots only. |

Metric instruments are exposed with the prefix `dataset_postgres_`. Each instrument carries a `name` attribute set to the dataset name; `replication_member_attached` also carries a `slot` attribute for grouping shared-slot members, and `replication_acceleration_rebuilt` a `cause` attribute taking one of `rewound_source`, `foreign_source`, `unreadable`, `acknowledged_past`, `retention_lost`, or `no_record` — see [Postgres CDC](../../../features/cdc/postgres-replication#unplanned-rebuilds) for what each one means.

## Task History

PostgreSQL operations participate in Spice [task history](../../../reference/task_history) via the shared SQL data-connector spans. Queries executed against Postgres are captured as child spans of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- Only TCP connections are supported. Unix sockets are not exposed through Spice configuration.
- `pg_sslmode: prefer` silently downgrades to plaintext and is not recommended for production.
- `LISTEN/NOTIFY` is not exposed. CDC is supported natively via logical replication (WAL streaming) — see the [replication parameters](index.md#replication-parameters) in the connector docs.
- Server-side cursors are used for federated reads; long-running queries hold a backend for their duration.

## Troubleshooting

| Symptom                                      | Likely cause                                                         | Resolution                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `FATAL: password authentication failed`      | Incorrect credentials.                                               | Verify credentials via the secret store; test with `psql` using the same credentials.              |
| `FATAL: too many clients already`            | Pool size + other clients exceeds server `max_connections`.          | Reduce `connection_pool_size` or raise `max_connections` / front the server with PgBouncer.        |
| Idle connections never exceed `connection_pool_size` despite a higher `pg_connection_pool_min_idle` | The pool silently caps `min_idle` at the pool size. | Set `pg_connection_pool_min_idle` to `connection_pool_size` or lower for clarity.                   |
| Sustained `active_wait_requests > 0`         | Pool saturation.                                                     | Increase `connection_pool_size` or reduce concurrent refreshes.                                    |
| `certificate verify failed`                  | `pg_sslmode: verify-ca` / `verify-full` with wrong CA or hostname.   | Verify `pg_sslrootcert` matches the server's issuing CA; with `verify-full` ensure hostname matches SAN. |
| Sessions lingering with the default app name | Multiple Spice instances share the same version-based name.          | The `application_name` is auto-set to the Spice.ai version and is not currently configurable.      |
