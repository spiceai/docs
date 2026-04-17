---
title: 'PostgreSQL Data Accelerator Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the PostgreSQL data accelerator in production: authentication, connection pooling, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-accelerators
  - postgres
  - observability
---

Production operating guide for the PostgreSQL data accelerator — materializing source data into a dedicated PostgreSQL database or schema for durable, SQL-native acceleration.

## Authentication & Secrets

The accelerator uses the same Postgres wire-protocol authentication as the [PostgreSQL data connector](../../data-connectors/postgres/deployment#authentication--secrets).

| Parameter             | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `pg_host`             | Postgres server hostname.                                                  |
| `pg_port`             | TCP port (default `5432`).                                                 |
| `pg_db`               | Database name used for acceleration storage.                               |
| `pg_user`             | Postgres user. Must have `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `SELECT` on the target schema. |
| `pg_pass`             | Password. Use `${secrets:...}` to resolve from a configured secret store.  |
| `pg_sslmode`          | TLS mode: `disable` / `prefer` / `require` / `verify-ca` / `verify-full`.  |
| `pg_sslrootcert`      | CA bundle path for `verify-ca` / `verify-full`.                            |

For production, use `pg_sslmode: verify-full` and source passwords from a [secret store](../../secret-stores/). The accelerator sets `application_name` on each connection to the Spice.ai version, which surfaces in `pg_stat_activity` for attribution.

### Permissions

The accelerator creates and writes tables in the configured database. Grant the role the minimum privileges on the target schema: `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `SELECT`, and `TRUNCATE`. For refresh modes that use `CREATE OR REPLACE`, the role must also be able to `DROP` its own tables.

## Resilience & Durability

### Connection Pool

| Parameter                 | Default | Description                                                             |
| ------------------------- | ------- | ----------------------------------------------------------------------- |
| `connection_pool_min`     | `5`     | Minimum idle connections held by the pool.                              |
| `connection_pool_size`    | `10`    | Maximum connections the pool will open.                                 |

`connection_pool_min <= connection_pool_size` is enforced at startup; mismatched values are rejected as configuration errors.

### Durability

Durability is delegated to the PostgreSQL server. Configure Postgres WAL, `synchronous_commit`, and backup policy according to the RPO/RTO requirements of your deployment. For multi-AZ durability, use a Postgres HA setup (Patroni, RDS Multi-AZ, Cloud SQL HA, etc.) — Spice does not replicate across Postgres instances.

## Capacity & Sizing

- **Server sizing**: Size the Postgres server for the sum of all accelerated datasets' working-set size plus WAL overhead. Plan for the peak during refresh, which may double-buffer rows in `UPDATE`-heavy paths.
- **Connection budget**: `connection_pool_size` across all Spice datasets + all other Postgres clients must not exceed the server's `max_connections`. Use PgBouncer in front of a shared Postgres if many datasets share the server.
- **Index management**: Create indexes via SQL on the accelerated tables for query performance. The accelerator does not automatically infer indexes.
- **Partitioning**: `partition_by` is **not supported** by the PostgreSQL accelerator and is rejected at configuration validation. Use native Postgres table partitioning managed out-of-band if required.

## Metrics

Generic acceleration metrics are available with the `dataset_acceleration_` prefix. The accelerator does not currently register Postgres-specific dataset-level OpenTelemetry instruments.

Monitor via:

- Spice acceleration metrics (`dataset_acceleration_refresh_duration_ms`, `dataset_acceleration_refresh_errors_total`).
- Postgres server metrics: `pg_stat_activity`, `pg_stat_bgwriter`, `pg_stat_user_tables`, `pg_stat_statements`.
- Infrastructure metrics on the Postgres host (CPU, I/O wait, WAL throughput).

See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

## Task History

PostgreSQL accelerator operations participate in [task history](../../../reference/task_history) through the shared acceleration spans (`accelerated_table_refresh`, `sql_query`).

## Known Limitations

- **`partition_by` is rejected**: Use native Postgres partitioning if required.
- **No cross-instance replication via Spice**: Durability and HA are the Postgres server's responsibility.
- **Schema migrations on refresh**: When the source schema changes, the accelerator re-creates the table — existing indexes and foreign keys on the accelerated table are dropped and must be reapplied.
- **Write amplification**: `UPSERT`-style refresh modes generate dead tuples; monitor and tune `autovacuum` accordingly.

## Troubleshooting

| Symptom                                                    | Likely cause                                                          | Resolution                                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `connection_pool_min must be <= connection_pool_size` at startup | Misconfiguration.                                                | Correct the values so `min <= size`.                                                                |
| `FATAL: too many clients already`                          | Sum of pool sizes + other clients exceeds `max_connections`.          | Reduce `connection_pool_size`, raise `max_connections`, or front with PgBouncer.                   |
| Refresh fails with `permission denied for table`           | Role lacks write/drop privileges on the target schema.                | Grant `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `SELECT`, `TRUNCATE`, `DROP` on the schema.          |
| Indexes disappear after refresh                            | Accelerator re-created the table.                                     | Reapply indexes post-refresh, or use a refresh mode that preserves the table structure.            |
| Bloat / slow queries over time                             | `UPDATE`-heavy refresh without autovacuum tuning.                     | Tune autovacuum thresholds on the accelerated tables; consider scheduled `VACUUM FULL` windows.    |
| `partition_by` rejected at startup                         | Feature not supported.                                                | Remove `partition_by`; use native Postgres partitioning if necessary.                              |
