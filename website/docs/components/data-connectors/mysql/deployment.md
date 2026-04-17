---
title: 'MySQL Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the MySQL data connector in production: authentication, connection pooling, TLS, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - mysql
  - observability
---

Production operating guide for the MySQL data connector covering authentication, connection pool sizing, TLS, metrics, and observability.

## Authentication & Secrets

The MySQL connector supports username/password authentication and connects over TCP. Credentials are supplied via the following parameters:

| Parameter          | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `mysql_host`       | MySQL server hostname.                                               |
| `mysql_tcp_port`   | TCP port (default `3306`).                                           |
| `mysql_db`         | Database name.                                                       |
| `mysql_user`       | Database user.                                                       |
| `mysql_pass`       | Password. Use `${secrets:...}` to resolve from a configured secret store. |
| `mysql_connection_string` | Alternative to the individual parameters.                      |

Passwords must be sourced from a secret store in production. See [Secret Stores](../../secret-stores/) for configuration options (environment variables, file, Kubernetes, AWS Secrets Manager, HashiCorp Vault).

### TLS

TLS is controlled via `mysql_sslmode`:

| Value         | Behavior                                                         |
| ------------- | ---------------------------------------------------------------- |
| `disabled`    | No TLS.                                                          |
| `preferred`   | Try TLS, fall back to plaintext. Not recommended for production. |
| `required`    | Require TLS; do **not** verify the server certificate.           |
| `verify_ca`   | Require TLS and verify the CA chain.                             |

For production, use `verify_ca` with `mysql_sslrootcert` pointing to the CA bundle. The default is `required`, which encrypts the connection but does not validate the server's identity.

## Resilience Controls

### Connection Pool Sizing

The connector uses a per-dataset connection pool with the following defaults:

| Parameter                   | Default | Description                                    |
| --------------------------- | ------- | ---------------------------------------------- |
| `connection_pool_min_idle`  | `1`     | Minimum idle connections held by the pool.     |
| `connection_pool_size`      | `5`     | Maximum connections the pool will open.        |

Invalid values (non-integers) are logged as a warning and silently replaced with the defaults. Size the pool to match the concurrent query and refresh load for the dataset; the upper bound should respect the MySQL server's `max_connections` budget shared across all Spice datasets and external clients.

### Retry Behavior

Transient query failures are not automatically retried at the connector layer. Dataset refresh retries are controlled by the acceleration refresh policy (see [Data Refresh](../../../features/data-acceleration/data-refresh)). Connection failures surface to the caller and to the connection pool metrics below.

## Capacity & Sizing

- **Network**: MySQL traffic is TCP. Plan for the sum of `connection_pool_size` across all Spice datasets targeting the same MySQL instance when sizing database `max_connections`.
- **Memory**: Each pooled connection holds a small amount of client-side state. Result sets stream in batches; memory footprint for federated reads is bounded by DataFusion's record batch size (8192 rows default).
- **Throughput**: For full-table materialization (acceleration refresh), query latency scales with the source table size and the presence of indexes on the refresh partitioning/ordering columns.

## Metrics

The MySQL connector exposes observable metrics for its connection pool. Enable them in the dataset's `metrics` section. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

| Metric Name                         | Type            | Description                                                                                        |
| ----------------------------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| `connection_count`                  | ObservableGauge | Active connections to the database server.                                                         |
| `connections_in_pool`               | ObservableGauge | Idle connections sitting in the pool.                                                              |
| `active_wait_requests`              | ObservableGauge | Requests waiting for a connection (saturation signal).                                             |
| `create_failed`                     | Counter         | Connections that failed to be created.                                                             |
| `discarded_excess_idle_connection`  | Counter         | Connections closed because the pool already had enough idle connections.                           |
| `discarded_unestablished_connection`| Counter         | Connections closed because they could not be established.                                          |
| `dirty_connection_return`           | Counter         | Connections returned to the pool in a dirty state (open transactions, pending queries, etc.).      |

Metric instruments are exposed with the prefix `dataset_mysql_`. Each instrument carries a `name` attribute set to the dataset name.

Key signals to alert on:

- `active_wait_requests > 0` sustained → pool is saturated, increase `connection_pool_size` or the server's `max_connections`.
- `create_failed` increasing → credentials, network, or server availability problem.
- `dirty_connection_return` increasing → a query is not cleaning up its transaction state; investigate long-running or aborted queries.

## Task History

MySQL operations participate in Spice [task history](../../../reference/task_history) via the shared SQL data-connector spans. Queries executed against MySQL are captured as child spans of the enclosing `sql_query` or `accelerated_table_refresh` task.

## Known Limitations

- Only TCP connections are supported. Unix socket connections are not exposed through Spice configuration.
- TLS with full hostname verification (`verify_identity`) is not a documented option; use `verify_ca` with a trusted CA bundle.
- Large text/blob columns are fetched in their entirety per row; consider selecting only the columns you need when federating.
- `mysql_sslmode: preferred` silently downgrades to plaintext on TLS negotiation failure and is not recommended for production.

## Troubleshooting

| Symptom                                                   | Likely cause                                              | Resolution                                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Access denied for user`                                  | Incorrect credentials or user lacks `SELECT` on the DB.   | Verify credentials; confirm the user has read access on the required tables.                          |
| `Too many connections`                                    | Sum of Spice pool sizes + other clients exceeds server `max_connections`. | Reduce `connection_pool_size` or raise the server limit.                                             |
| Sustained `active_wait_requests > 0`                      | Pool saturation.                                          | Increase `connection_pool_size`; reduce concurrent dataset refreshes.                                |
| `SSL connection error`                                    | Certificate mismatch with `mysql_sslmode: verify_ca`.     | Verify `mysql_sslrootcert` matches the server's issuing CA. Use `openssl s_client -connect` to inspect. |
| Silent plaintext connection                               | `mysql_sslmode: preferred` falling back.                  | Switch to `required` or `verify_ca`.                                                                 |
