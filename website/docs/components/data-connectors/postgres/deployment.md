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
| `allow`       | Try non-TLS first, retry with TLS if the server requires it. |
| `prefer`      | Try TLS, fall back to plaintext. Not recommended for production. |
| `require`     | Require TLS; no server certificate verification.            |
| `verify-ca`   | Require TLS and verify the CA chain.                        |
| `verify-full` | Require TLS, verify CA chain, and verify server hostname.   |

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

The PostgreSQL connector exposes observable metrics for its replication pipeline. Enable them in the dataset's `metrics` section. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

| Metric Name                                  | Type            | Description                                                       |
| -------------------------------------------- | --------------- | ----------------------------------------------------------------- |
| `replication_lag_ms`                         | ObservableGauge | Replication lag in milliseconds.                                  |
| `replication_lag_bytes`                      | ObservableGauge | Replication lag in bytes.                                         |
| `replication_confirmed_flush_lsn`            | ObservableGauge | Confirmed flush LSN position.                                     |
| `replication_server_wal_end_lsn`             | ObservableGauge | Server WAL end LSN position.                                      |
| `replication_transactions_total`             | ObservableCounter | Total transactions received via replication.                    |
| `replication_inserts_total`                  | ObservableCounter | Total insert operations received.                               |
| `replication_updates_total`                  | ObservableCounter | Total update operations received.                               |
| `replication_deletes_total`                  | ObservableCounter | Total delete operations received.                               |
| `replication_truncates_total`                | ObservableCounter | Total truncate operations received.                             |
| `replication_bootstrap_rows_total`           | ObservableCounter | Total rows fetched during initial bootstrap.                    |
| `replication_bootstrap_complete`             | ObservableGauge | Bootstrap completion status.                                      |
| `replication_decode_errors_total`            | ObservableCounter | Total WAL decode errors.                                        |
| `replication_schema_mismatch_errors_total`   | ObservableCounter | Total schema mismatch errors during replication.                |
| `replication_recv_errors_total`              | ObservableCounter | Total receive errors during replication.                        |
| `replication_reconnects_total`               | ObservableCounter | Total reconnection attempts.                                    |

Metric instruments are exposed with the prefix `dataset_postgres_`. Each instrument carries a `name` attribute set to the dataset name.

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
