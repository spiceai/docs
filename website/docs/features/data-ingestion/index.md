---
title: 'Data Ingestion'
sidebar_label: 'Data Ingestion'
description: 'Learn how to ingest data in Spice.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
---

Data can be ingested by the Spice runtime for replication to a Data Connector, such as PostgreSQL or the Spice.ai Cloud platform.

By default, the runtime exposes an [OpenTelemetry](https://opentelemetry.io) (OTEL) endpoint at grpc://127.0.0.1:50052 for data ingestion.

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
    mode: read_write
    replication:
      enabled: true
    acceleration:
      enabled: true
```

Start telegraf with the following config:

```
[[inputs.smart]]
  attributes = true
[[outputs.opentelemetry]]
  service_address = "localhost:50052"
[agent]
  interval = "1s"
  flush_interval = "1s"
```

SMART data will be available in the `smart_attribute_raw_value` dataset in Spice.ai OSS and replicated to the `coolorg.smart.drive_stats` dataset in Spice.ai Cloud.

:::warning[Limitations]

- Only Spice.ai replication is supported for now.

:::
