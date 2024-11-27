---
title: 'Data Ingestion'
sidebar_label: 'Data Ingestion'
description: 'Learn how to ingest data in Spice.'
sidebar_position: 8
pagination_prev: null
pagination_next: null
---

Data can be ingested by the Spice runtime for replication to a Data Connector, like PostgreSQL or the Spice.ai Cloud platform.

By default, the runtime exposes an [OpenTelemety](https://opentelemetry.io) (OTEL) endpoint at grpc://127.0.0.1:50052 for data ingestion.

OTEL metrics will be inserted into datasets with matching names (metric name = dataset name) and optionally replicated to the dataset source.

## Benefits

Spice.ai OSS incorporates built-in data ingestion support, enabling the collection of the latest data from edge nodes for use in subsequent queries. This capability avoids the need for additional ETL pipelines, while also enhancing the speed of the feedback loop.

As an example, consider CPU usage anomaly detection. When CPU metrics are sent to the Spice OpenTelemetry endpoint, the loaded machine learning model can utilize the most recent observations for inferencing and provide recommendations to the edge node. This process occurs rapidly on the edge itself, within milliseconds and without generating network traffic.

Additional, Spice will replicate the data periodically to the data connector for further usage.

## Considerations

Data Quality: Leverage Spice SQL capabilities to transform and cleanse ingested edge data, ensuring high-quality inputs.

Data Security: Assess data sensitivity and secure network connections between edge and data connector when replicating data for further usage. Implement encryption, access controls, and secure protocols.

## Example

### [Disk SMART](https://en.wikipedia.org/wiki/Self-Monitoring,_Analysis_and_Reporting_Technology)

- Start Spice with the following dataset:

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

- Start telegraf with the following config:

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
