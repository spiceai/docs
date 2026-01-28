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

1. **SQL Statements** – Write data directly to [write-capable connectors](../../tags/write) using standard SQL syntax.
2. **OpenTelemetry (OTEL) Ingestion** – Stream OTEL metrics for real-time processing and acceleration.

Data ingestion is useful for scenarios such as collecting metrics from edge devices, writing application events for later analysis, or populating datasets from external sources.

## SQL Statements

Spice supports writing data to **compatible data connectors** using standard SQL `INSERT INTO` syntax.

### Write-Capable Connectors

Data connectors that support write operations are tagged as [write](../../tags/write):

- **[Apache Iceberg](../../components/data-connectors/iceberg)** - Write to Iceberg tables via data connector or [catalog connector](../../components/catalogs/iceberg)
- **[AWS Glue](../../components/data-connectors/glue)** - Write to Glue Data Catalog tables via data connector or [catalog connector](../../components/catalogs/glue)

### Configuration for Write Operations

To enable write operations, configure your dataset or catalog with [read_write access](../../reference/spicepod/datasets#access):

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

For more details on the `INSERT` statement syntax, see the [SQL INSERT documentation](../../reference/sql/dml#insert).

## OpenTelemetry Data Ingestion

By default, the runtime exposes an [OpenTelemetry](https://opentelemetry.io) (OTEL) endpoint at grpc://127.0.0.1:50051 for the OTEL data ingestion.

OTEL metrics will be inserted into datasets with matching names (metric name = dataset name) and optionally replicated to the dataset source.

## Benefits

Spice.ai OSS includes built-in data ingestion support, allowing the collection of the latest data from edge nodes for use in subsequent queries. This feature eliminates the need for additional ETL pipelines and enhances the speed of the feedback loop.

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

- Write Support: Only selected [write-capable connectors and catalogs](../../tags/write) support write operations.
- Only Spice.ai replication is supported for OpenTelemetry ingestion

:::
