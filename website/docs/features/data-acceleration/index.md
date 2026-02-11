---
title: 'Data Acceleration'
sidebar_label: 'Data Acceleration'
description: 'Learn how to use local data acceleration in Spice.'
sidebar_position: 2
pagination_prev: null
---

Datasets and views can be locally accelerated by the Spice runtime, pulling data from any [Data Connector](../components/data-connectors) and storing it locally in a [Data Accelerator](../components/data-accelerators) for faster access. The data can be kept up-to-date in real-time or on a refresh schedule, ensuring deployments maintain the latest data locally for querying.

![Spice.ai Open Source Query Federation with Acceleration](/img/features/data-acceleration.png)

```mermaid
flowchart LR
    Sources["PostgreSQL / S3 / Databricks / ..."]
    Sources -->|"Data Connector"| Spice["Spice Runtime"]
    Spice -->|"Materialize"| Acc["Accelerator (Arrow / DuckDB / Cayenne / SQLite)"]
    Acc -->|"Refresh (interval / CDC / API)"| Sources
    App["Application"] -->|"SQL / Flight SQL"| Acc
    Acc -->|"Fast results"| App
```

## Benefits

Local data acceleration stores data alongside the application, providing faster query times by eliminating network latency. This is especially beneficial for large query results, as data transfer over the network is avoided. Depending on the [Acceleration Engine](../components/data-accelerators) used, data can also be stored in-memory, further reducing query times. [Indexes](./indexes) can be applied to speed up certain queries.

Locally accelerated datasets can also have [primary key constraints](./constraints) applied. This feature allows specifying actions when a constraint is violated, such as dropping the violating row or upserting it into the accelerated table.

[Acceleration snapshots](./snapshots) (preview) help file-mode accelerations become ready in seconds by bootstrapping from managed snapshots stored in object storage such as Amazon S3.

## Example Use Case

Consider a high-volume e-trading frontend application backed by an AWS RDS database containing a table of trades. To retrieve all trades over the last 24 hours, the application would need to query the remote database and transfer the data over the network. By accelerating the trades table locally using the [AWS RDS Data Connector](https://github.com/spiceai/cookbook/tree/trunk/mysql/rds-aurora#readme), the data is brought to the application, saving round trip time and data transfer time.

## Considerations

Data Storage: Ensure local storage has enough capacity for the accelerated data. The required storage type (Disk or RAM) and amount depend on the dataset size and the acceleration engine used.

Data Security: Assess data sensitivity and secure network connections between the edge and data connector when replicating data. Secure any external Data Accelerator connected to the Spice runtime with encryption, access controls, and secure protocols.

## Example

### Locally Accelerating taxi_trips

- Start Spice with the following dataset:

```yaml
datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10s
```

- The dataset `taxi_trips` is accelerated locally by the Spice runtime. The data refreshes every 10 seconds.

- Query times can be compared against the Spice platform:

```bash
curl \
--url 'https://data.spiceai.io/v1/sql?api_key=[API_KEY]' \
--data 'select * from taxi_trips'
```

The locally accelerated dataset can then be queried locally:

```bash
spice sql
select * from taxi_trips;
```

Example output:

```
+---------------+--------------+------------------+
| trip_distance | total_amount | tpep_pickup_time |
+---------------+--------------+------------------+
| 1.2           | 9.80         | 2023-01-15 08:32 |
| 3.4           | 18.50        | 2023-01-15 09:10 |
+---------------+--------------+------------------+
Time: 0.012s. 2 rows.
```

Locally accelerated datasets provide significantly faster query times compared to remote sources.

[Learn more about Data Accelerators](../components/data-accelerators) for faster access.
