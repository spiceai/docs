---
title: 'Data Acceleration'
sidebar_label: 'Data Acceleration'
description: 'Learn how to use local data acceleration in Spice.'
sidebar_position: 2
pagination_prev: null
---

Datasets and views can be locally accelerated by the Spice runtime, pulling data from any [Data Connector](../components/data-connectors) and storing it locally in a [Data Accelerator](../components/data-accelerators) for faster access. The data can be kept up-to-date in real-time or on a refresh schedule, ensuring deployments maintain the latest data locally for querying.

![Spice.ai Open Source Query Federation with Acceleration](/img/features/data-acceleration.png)

## Benefits

Local data acceleration stores data alongside the application, providing faster query times by eliminating network latency. This is especially beneficial for large query results, as data transfer over the network is avoided. Depending on the [Acceleration Engine](../components/data-accelerators) used, data can also be stored in-memory, further reducing query times. [Indexes](data-acceleration/indexes) can be applied to speed up certain queries.

Locally accelerated datasets can also have [primary key constraints](data-acceleration/constraints) applied. This feature supports specifying actions when a constraint is violated, such as dropping the violating row or upserting it into the accelerated table.

[Acceleration snapshots](data-acceleration/snapshots) (preview) help file-mode accelerations become ready in seconds by bootstrapping from managed snapshots stored in object storage such as Amazon S3.

## Example Use Case

Consider a high-volume e-trading frontend application backed by an AWS RDS database containing a table of trades. To retrieve all trades over the last 24 hours, the application would need to query the remote database and transfer the data over the network. By accelerating the trades table locally using the [AWS RDS Data Connector](https://github.com/spiceai/cookbook/tree/trunk/mysql/rds-aurora#readme), the data is brought to the application, saving round trip time and data transfer time.

## Considerations

**Storage Capacity**: Accelerated datasets consume local storage. In-memory engines (Arrow) require sufficient RAM; file-based engines (DuckDB, SQLite, Cayenne) require sufficient disk space. As a guideline, allocate at least 1.5x the source dataset size to account for indexing and temporary refresh overhead. Check current usage by querying `runtime.metrics`.

**Data Security**: Accelerating a dataset copies data from the source to the local runtime. Assess whether the data sensitivity is appropriate for the deployment environment. Secure network connections between the runtime and data source using TLS (`pg_sslmode: verify-full` for PostgreSQL, `s3_auth: iam_role` for S3). Encrypt data at rest when using file-based accelerators in production.

**Refresh Latency**: The `refresh_check_interval` controls how frequently the runtime checks for new data. Shorter intervals increase load on the source database. For real-time requirements, use [Change Data Capture (CDC)](../cdc/index.md) instead of polling.

**Engine Selection**: Choose the acceleration engine based on workload characteristics:

| Engine     | Best For                                           | Mode               |
| ---------- | -------------------------------------------------- | ------------------ |
| `arrow`    | Read-heavy analytics, in-memory speed              | `memory`           |
| `duckdb`   | Complex analytical queries, file-based persistence | `memory` or `file` |
| `sqlite`   | OLTP-style point lookups, concurrent reads/writes  | `file`             |
| `postgres` | When a full SQL database is needed as accelerator  | External           |
| `cayenne`  | Large datasets (1TB+), high-performance columnar   | `file`             |

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
