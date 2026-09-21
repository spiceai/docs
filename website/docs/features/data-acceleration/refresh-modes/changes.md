---
title: 'Changes Refresh Mode'
sidebar_label: 'Changes'
description: 'Apply incremental inserts, updates, and deletes via Change Data Capture.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

The `changes` refresh mode applies incremental inserts, updates, and deletes from a [Change Data Capture (CDC)](../../cdc) source. Unlike `append`, `changes` mode reflects modifications and deletions in the acceleration, keeping it consistent with sources where rows mutate over time.

Use `changes` when:

- The source supports CDC (e.g., a database with a transaction log).
- Rows in the source are updated or deleted, not just inserted.
- The acceleration must reflect the current state of the source row-for-row.

## Configuration

`refresh_mode: changes` requires a CDC-capable data connector. Spice supports CDC via [PostgreSQL Logical Replication](../../cdc/postgres-replication), [MySQL Binlog Replication](../../cdc/mysql-replication), [MongoDB Change Streams](../../cdc/mongodb-streams), [DynamoDB Streams](../../cdc/dynamodb-streams), and [Debezium](../../cdc/debezium) (over Kafka). See [Supported Data Connectors](../../cdc#supported-data-connectors) for details.

:::note

[Apache Kafka](../../../components/data-connectors/kafka) is a real-time streaming source but is append-only — it uses [`refresh_mode: append`](./append), not `changes`.

:::

Any accelerator engine that supports writes can be a `changes` sink — `arrow`, `duckdb`, `sqlite`, and `cayenne`. [Spice Cayenne](../../../components/data-accelerators/cayenne) is recommended for large-scale CDC (incremental materialized views, in-memory CDC tier, and replication-lag/freshness SLOs).

```yaml
datasets:
  - from: debezium:cdc.public.customer_orders
    name: customer_orders
    acceleration:
      enabled: true
      refresh_mode: changes
      engine: duckdb
      mode: file
```

The Debezium connector streams change events from a Kafka topic produced by Debezium. Each event is applied to the acceleration in order, preserving inserts, updates, and deletes from the source.

## Behavior

- The acceleration is bootstrapped from the source snapshot, then continuously updated from the change stream.
- `refresh_check_interval`, `refresh_cron`, on-demand refresh, `refresh_data_window`, and `retention_period` do not apply — updates are driven by the change stream rather than periodic polling.
- [`refresh_sql`](../data-refresh#refresh-sql) can only modify selected columns in `changes` mode and cannot apply row filters.

## Native CDC

Use `refresh_mode: changes` when an interval [`full`](./full) or [`append`](./append) refresh is not fresh enough and the source can emit row-level changes. For PostgreSQL and MySQL, the native connectors are the path to use: [PostgreSQL logical replication](../../cdc/postgres-replication) and [MySQL binlog replication](../../cdc/mysql-replication). [Debezium](../../cdc/debezium) (with or without Kafka) remains the path for databases without a native Spice CDC connector, and for deployments that already run that pipeline.

Point the dataset at a replica when that replica still exposes the log the connector reads — Postgres logical decoding (`wal_level=logical`), or the MySQL binary log — so the log read stays off the primary.

[Spice Cayenne](../../../components/data-accelerators/cayenne#change-data-capture-refresh_mode-changes) is the accelerator for high-throughput CDC. `arrow`, `duckdb`, and `sqlite` can apply a change stream; they are a better fit when the table is small. An append-only acceleration still needs an application tombstone (a `deleted` or `deleted_at` column, filtered in a view) when the source does not emit deletes. `changes` applies source deletes into the accelerator.

Schema changes on the source are not applied silently. See [`on_schema_change`](../../../reference/spicepod/datasets#on_schema_change), [MySQL schema changes](../../cdc/mysql-replication#schema-changes), and [PostgreSQL CDC limitations](../../cdc/postgres-replication#limitations).

## Related Topics

- [Change Data Capture](../../cdc)
- [Debezium Data Connector](../../../components/data-connectors/debezium)
