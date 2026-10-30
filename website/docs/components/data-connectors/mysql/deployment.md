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
| `preferred`   | Use TLS but skip certificate and hostname verification (accepts invalid or self-signed certs). The connection is still encrypted and does not fall back to plaintext — it fails if the server lacks TLS support. Not recommended for production. |
| `required`    | Require TLS and verify the server certificate against system root CAs. |

For production, use `required` (the default). To verify against a specific CA rather than the system trust store, also set `mysql_sslrootcert` to the CA bundle path.

## Resilience Controls

### Connection Pool Sizing

The connector uses a per-dataset connection pool with the following defaults:

| Parameter                       | Default | Description                                                  |
| ------------------------------- | ------- | ------------------------------------------------------------ |
| `mysql_pool_min`                | `1`     | Minimum idle connections held by the pool.                   |
| `mysql_pool_max`                | `5`     | Maximum connections the pool will open.                      |
| `mysql_connection_max_lifetime` | `5m`    | How long a connection is used before it is closed and replaced. |

A dataset with `refresh_mode: changes` uses its pool only for schema checks at startup, so its pool defaults to a minimum of `0` and a maximum of `2` for any bound that is not set.

A pool keeps an idle connection above `mysql_pool_min` open for 30 seconds after its last use, and checks for idle connections to close every 10 seconds. This stops queries that follow each other closely from opening a new connection on every other query: the MySQL client resets a connection when it returns to the pool, and a query that starts during the reset opens another connection. A `mysql_connection_string` that sets `inactive_connection_ttl` or `ttl_check_interval` keeps its own value, which must be a whole number of seconds. A `refresh_mode: changes` pool closes each idle connection above its minimum once it is returned. In v2.4.1 and earlier, idle connections above the minimum were closed as soon as they were returned.

Each setting resolves in the same order whether the server is given as individual parameters or as `mysql_connection_string`: the Spicepod parameter, then the connection string's query setting (`pool_min`, `pool_max`, or `abs_conn_ttl` in seconds, with `abs_conn_ttl_jitter`), then the default. A setting given in both places with different values fails the dataset with an error that names both. When a minimum is set above the default maximum and no maximum is set, the maximum is raised to the minimum.

Invalid values fail the dataset at load with an error that names the parameter: a pool size that is not a whole number, a `mysql_pool_max` of `0`, a `mysql_pool_min` greater than `mysql_pool_max`, and a lifetime outside `1s` to `365d` (other than `0s`). Size the pool to match the concurrent query and refresh load for the dataset; the upper bound should respect the MySQL server's `max_connections` budget shared across all Spice datasets and external clients.

:::note

In v2.4.0 and earlier, a pool size that was not a whole number logged a warning and fell back to the `mysql_async` default for that bound, `10` for the minimum or `100` for the maximum, and both bounds became `10` and `100` when that left the minimum above the maximum. A `mysql_connection_string` ignored `mysql_pool_min` and `mysql_pool_max` and used its own `pool_min` and `pool_max` settings or the same `10` and `100` defaults, and connections had no maximum lifetime. Datasets that relied on any of these now use the values above, or fail at load until the value is corrected.

:::

#### Connection Lifetime

`mysql_connection_max_lifetime` sets how long a pooled connection is used before it is closed and replaced, as a duration such as `10m`. `0s` keeps connections open indefinitely. When the lifetime comes from `mysql_connection_max_lifetime` or the default, each connection's lifetime is extended by a random amount, so connections opened together are not replaced together: up to a fifth of the lifetime, or up to `abs_conn_ttl_jitter` seconds when the connection string sets it. A lifetime set only by the connection string's `abs_conn_ttl` uses its `abs_conn_ttl_jitter` as given, and with no `abs_conn_ttl_jitter` it adds none. A connection is not closed while a query is using it.

Replacing a connection resolves the host again. With a load-balanced hostname, such as an [Amazon Aurora reader endpoint](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.Endpoints.html#Aurora.Endpoints.Reader), this spreads a long-running Spice instance across the servers behind it instead of keeping every connection on the servers it first reached. The [MySQL catalog](../../catalogs/mysql) accepts the same parameter.

#### Connection Log

Each pool logs the server its new connections reach, as the server reports itself, including the instance name on Aurora MySQL:

```text
MySQL dataset 'orders' opened connection 1234 to 'reader.example.internal:3306', which reached server 'ip-10-0-1-23:3306' (Aurora instance 'orders-reader-2').
```

The line is logged at `INFO` the first time in 10 minutes that a pool reaches a server, and at `DEBUG` otherwise, so a pool that opens a connection per query does not log a line per query.

### Retry Behavior

Transient query failures are not automatically retried at the connector layer. Dataset refresh retries are controlled by the acceleration refresh policy (see [Data Refresh](../../../features/data-acceleration/data-refresh)). Connection failures surface to the caller and to the connection pool metrics below.

## Capacity & Sizing

- **Network**: MySQL traffic is TCP. Plan for the sum of `mysql_pool_max` across all Spice datasets targeting the same MySQL instance when sizing database `max_connections`.
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
| `discarded_superfluous_connection`  | Counter         | Connections closed because the pool already had enough idle connections.                           |
| `discarded_unestablished_connection`| Counter         | Connections closed because they could not be established.                                          |
| `dirty_connection_return`           | Counter         | Connections returned to the pool in a dirty state (open transactions, pending queries, etc.).      |
| `discarded_expired_connection`      | Counter         | Connections discarded because they were expired by pool constraints (i.e. TTL expired).            |
| `resetting_connection`              | Counter         | Connections that were reset.                                                                       |
| `discarded_error_during_cleanup`    | Counter         | Connections discarded because they returned an error during cleanup.                               |
| `connection_returned_to_pool`       | Counter         | Connections returned to the pool.                                                                  |

Metric instruments are exposed with the prefix `dataset_mysql_`. Each instrument carries a `name` attribute set to the dataset name.

Key signals to alert on:

- `active_wait_requests > 0` sustained → pool is saturated, increase `mysql_pool_max` or the server's `max_connections`.
- `create_failed` increasing → credentials, network, or server availability problem.
- `dirty_connection_return` increasing → a query is not cleaning up its transaction state; investigate long-running or aborted queries.

## Task History

MySQL operations participate in Spice [task history](../../../reference/task_history) via the shared SQL data-connector spans. Queries executed against MySQL are captured as child spans of the enclosing `sql_query` or `acceleration_refresh` task.

## Known Limitations

- Only TCP connections are supported. Unix socket connections are not exposed through Spice configuration.
- Only `disabled`, `preferred`, and `required` SSL modes are exposed. The `required` mode verifies the server certificate and domain name (equivalent to `verify_identity`); `preferred` encrypts the connection but skips certificate and hostname verification.
- Large text/blob columns are fetched in their entirety per row; consider selecting only the columns you need when federating.
- `mysql_sslmode: preferred` encrypts the connection but skips certificate and hostname verification (accepting invalid or self-signed certificates), so it does not protect against man-in-the-middle attacks and is not recommended for production. It does not fall back to plaintext — connecting to a server without TLS support fails.

## Troubleshooting

| Symptom                                                   | Likely cause                                              | Resolution                                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `Access denied for user`                                  | Incorrect credentials or user lacks `SELECT` on the DB.   | Verify credentials; confirm the user has read access on the required tables.                          |
| `Too many connections`                                    | Sum of Spice pool sizes + other clients exceeds server `max_connections`. | Reduce `mysql_pool_max` or raise the server limit.                                             |
| Sustained `active_wait_requests > 0`                      | Pool saturation.                                          | Increase `mysql_pool_max`; reduce concurrent dataset refreshes.                                |
| `SSL connection error`                                    | Certificate mismatch or TLS negotiation failure.          | Verify `mysql_sslrootcert` matches the server's issuing CA. Use `openssl s_client -connect` to inspect. |
| Connection accepted despite an invalid or self-signed server certificate | `mysql_sslmode: preferred` skips certificate and hostname verification. | Switch to `required` (optionally with `mysql_sslrootcert`) to enforce verification.                  |
