---
title: 'Data Ingestion'
sidebar_label: 'Data Ingestion'
description: 'Learn how to ingest data in Spice.'
sidebar_position: 6
pagination_prev: null
pagination_next: null
tags:
  - features
  - write
---

Data can be ingested into the Spice runtime using the following methods:

1. **Acceleration Refresh Modes** – Pull data from a source connector into a local accelerator using one of the standard [refresh modes](../data-acceleration/refresh-modes/index.md) (`full`, `append`, `changes`, `snapshot`, `caching`). This is the most common ingestion path for keeping a local accelerator in sync with an upstream system.
2. **SQL Statements** – Write data directly to [write-capable connectors](../tags/write) using standard SQL `INSERT` (and, where supported, `UPDATE`/`DELETE`) syntax.
3. **OpenTelemetry (OTEL) Ingestion** – Stream OTEL metrics for real-time processing and acceleration.

Data ingestion is useful for scenarios such as keeping a local accelerator continuously in sync with an upstream database, collecting metrics from edge devices, writing application events for later analysis, or populating datasets from external sources.

## Ingestion via Acceleration Refresh Modes

When a dataset is configured with `acceleration.enabled: true`, Spice ingests rows from the source connector into a local engine (Arrow, DuckDB, SQLite, PostgreSQL, or Cayenne). The `refresh_mode` controls how that ingestion happens.

| Refresh Mode                                                            | What it ingests                                                                                                                                                                              | Typical source                                                                                |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`full`](../data-acceleration/refresh-modes/full.md)                    | Replaces the accelerator's contents with a fresh read of the source on every refresh.                                                                                                        | Slowly-changing reference tables; small lookup datasets.                                      |
| [`append`](../data-acceleration/refresh-modes/append.md)                | Inserts only rows newer than the highest seen `time_column` value on each refresh.                                                                                                           | Time-series, event/log data, append-only tables.                                              |
| [`changes`](../data-acceleration/refresh-modes/changes.md)              | Streams row-level inserts, updates, and deletes from a source [CDC feed](../cdc/index.md) (PostgreSQL logical replication, DynamoDB Streams, MongoDB Change Streams, Debezium, Kafka, etc.). | Operational databases where you need near real-time mirror of the source.                     |
| [`snapshot`](../data-acceleration/refresh-modes/snapshot.md)            | Loads exclusively from an external snapshot store; no source reads.                                                                                                                          | Read-only replicas bootstrapped from a centralized snapshot, e.g. for fan-out reader fleets.  |
| [`caching`](../data-acceleration/refresh-modes/caching.md)              | Read-through caches per-request HTTP/HTTPS responses with a TTL.                                                                                                                             | API search results or other request-keyed content fetched lazily.                             |

For cross-cutting refresh behavior — refresh intervals, on-demand refresh, retries, retention, and zero-results handling — see [Data Refresh](../data-acceleration/data-refresh.md).

### Example: continuous CDC ingestion into an accelerator

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
    acceleration:
      enabled: true
      engine: duckdb
      mode: file        # Persistence so resume across restarts is cheap
      refresh_mode: changes
```

This uses [PostgreSQL Logical Replication](../cdc/postgres-replication.md) to ingest every `INSERT`, `UPDATE`, and `DELETE` from `public.users` into a local DuckDB accelerator with low latency.

## SQL Statements

Spice supports writing data to **compatible data connectors** using standard SQL `INSERT INTO` syntax.

### Write-Capable Connectors

Data connectors that support write operations are tagged as [write](../tags/write):

- **[Apache Iceberg](../components/data-connectors/iceberg)** - Write to Iceberg tables via data connector or [catalog connector](../components/catalogs/iceberg)
- **[AWS Glue](../components/data-connectors/glue)** - Write to Glue Data Catalog tables via data connector or [catalog connector](../components/catalogs/glue)

### Configuration for Write Operations

To enable write operations, configure your dataset or catalog with [read_write access](../reference/spicepod/datasets#access):

```yaml
datasets:
  - from: glue:my_catalog.my_schema.my_table
    name: my_table
    access: read_write
    params:
      # ... connector-specific parameters
```

### Example SQL

```sql
INSERT INTO my_table (column1, column2)
VALUES ('value1', 'value2');


INSERT INTO my_table (column1, column2)
SELECT source_column1, source_column2
FROM source_table
WHERE condition = 'filter';
```

For more details on the `INSERT` statement syntax, see the [SQL INSERT documentation](../reference/sql/dml#insert).

## OpenTelemetry Data Ingestion

By default, the runtime exposes an [OpenTelemetry](https://opentelemetry.io) (OTEL) endpoint at grpc://127.0.0.1:50051 for the OTEL data ingestion.

OTEL metrics will be inserted into datasets with matching names (metric name = dataset name) and optionally replicated to the dataset source.

## Benefits

Spice.ai OSS includes built-in data ingestion support for collecting the latest data from edge nodes for use in subsequent queries. This feature eliminates the need for additional ETL pipelines and improves the speed of the feedback loop.

For example, consider CPU usage anomaly detection. When CPU metrics are sent to the Spice OpenTelemetry endpoint, the loaded machine learning model can use the most recent observations for inferencing and provide recommendations to the edge node. This process occurs quickly on the edge itself, within milliseconds, and without generating network traffic.

Additionally, Spice will periodically replicate the data to the data connector for further use.

## Considerations

Data Quality: Use Spice SQL capabilities to transform and cleanse ingested edge data, ensuring high-quality inputs.

Data Security: Evaluate data sensitivity and secure network connections between the edge and data connector when replicating data for further use. Implement encryption, access controls, and secure protocols.

## Example

### [Disk SMART](https://en.wikipedia.org/wiki/Self-Monitoring,_Analysis_and_Reporting_Technology)

Start Spice with the following dataset:

```yaml
datasets:
  - from: spice.ai/coolorg/smart/datasets/drive_stats
    name: smart_attribute_raw_value
    access: read_write
    replication:
      enabled: true
    acceleration:
      enabled: true
```

Start telegraf with the following config:

```toml
[[inputs.smart]]
  attributes = true
[[outputs.opentelemetry]]
  service_address = "localhost:50051"
[agent]
  interval = "1s"
  flush_interval = "1s"
```

SMART data will be available in the `smart_attribute_raw_value` dataset in Spice.ai OSS and replicated to the `coolorg.smart.drive_stats` dataset in Spice.ai Cloud.

## Limitations

:::warning[Current Limitations]

- Write Support: Only selected [write-capable connectors and catalogs](../tags/write) support write operations.
- Only Spice.ai replication is supported for OpenTelemetry ingestion

:::
