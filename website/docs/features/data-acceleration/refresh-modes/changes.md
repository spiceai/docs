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

Iceberg delete files are not a CDC stream. `refresh_mode: changes` does not apply Iceberg v2 position or equality delete files to an acceleration — those files are applied on federated scans and on [`refresh_mode: full`](./full) only. See [Delete files on federated reads](../../../components/data-connectors/iceberg#delete-files-on-federated-reads).

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

## Related Topics

- [Change Data Capture](../../cdc)
- [Debezium Data Connector](../../../components/data-connectors/debezium)
