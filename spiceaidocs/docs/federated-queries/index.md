---
title: 'Federated Queries'
sidebar_label: 'Federated Queries'
description: 'Learn how to use federated queries in Spice.'
sidebar_position: 2
---

Spice provides a powerful federated query feature that allows you to join and combine data from multiple data sources and perform complex queries. This feature enables you to leverage the full potential of your data by aggregating and analyzing information wherever it is stored.

Spice supports federated query across databases (PostgreSQL, MySQL, etc.), data warehouses (Databricks, Snowflake, BigQuery, etc.), and data lakes (S3, MinIO, etc.). See [Data Connectors](/data-connectors/index.md) for the full list of supported sources.

### Getting Started

#### Pre-requisites

- Install Spice by following the [installation instructions](/getting-started/index.md).
- Run thought the [federation quickstart guide](https://github.com/spiceai/quickstarts/blob/trunk/federation/README.md) for required docker and local postgres setup.

#### Steps
To get started with federated queries using Spice, follow these steps:

**Step 1.** Create a new Spice app called `demo`.

```bash
# Create Spice app "demo"
spice init demo

# Change to demo directory.
cd demo
```

**Step 2.** Start the Spice runtime.

```bash
spice run
```

**Step 3.** Open a new terminal and add the `spiceai/fed-demo` Spicepod.

```bash
spice add spiceai/fed-demo
```

Note in the Spice runtime output several datasets are loaded.

**Step 4.** Show available tables and query them, regardless of source.

```bash
# Start the Spice SQL REPL.
spice sql
```

Show the available tables:

```sql
show tables;
```

Execute the queries:

```sql
-- Query S3 (Parquet)
SELECT *
FROM s3_source LIMIT 10

-- Query S3 (Parquet) accelerated
SELECT *
FROM s3_source_accelerated LIMIT 10

-- Query PostgreSQL
SELECT *
FROM pg_source LIMIT 10

-- Query Dremio
SELECT *
FROM dremio_source LIMIT 10

-- Query Dremio accelerated
SELECT *
FROM dremio_source_accelerated LIMIT 10
```

**Step 5.** Join tables across remote sources and query

```sql
-- Query across S3, PostgreSQL, and Dremio
sql> WITH order_numbers AS (
  SELECT DISTINCT order_number
  FROM s3_source
  WHERE order_number IN (
    SELECT order_number
    FROM pg_source
  )
)
SELECT
  AVG(total_amount),
  passenger_count
FROM dremio_source
WHERE passenger_count IN (
  SELECT DISTINCT order_number % 10 AS num_of_passenger
  FROM order_numbers
)
GROUP BY passenger_count;
+---------------------------------+-----------------+
| AVG(dremio_source.total_amount) | passenger_count |
+---------------------------------+-----------------+
| 17.219515789473693              | 4               |
| 22.401176470588233              | 6               |
| 21.12263157894737               | 5               |
| 17.441359661495103              | 3               |
| 23.2                            | 0               |
| 17.714222499449477              | 2               |
| 15.394881909237105              | 1               |
+---------------------------------+-----------------+

Query took: 3.345525166 seconds. 7/7 rows displayed.
```

**Step 6.** Join tables across locally accelerated sources and query

```sql
-- Query across S3 accelerated, PostgreSQL, and Dremio accelerated
sql> WITH order_numbers AS (
  SELECT DISTINCT order_number
  FROM s3_source_accelerated
  WHERE order_number IN (
    SELECT order_number
    FROM pg_source
  )
)
SELECT
  AVG(total_amount),
  passenger_count
FROM dremio_source_accelerated
WHERE passenger_count IN (
  SELECT DISTINCT order_number % 10 AS num_of_passenger
  FROM order_numbers
)
GROUP BY passenger_count;
+---------------------------------------------+-----------------+
| AVG(dremio_source_accelerated.total_amount) | passenger_count |
+---------------------------------------------+-----------------+
| 21.12263157894737                           | 5               |
| 17.219515789473693                          | 4               |
| 22.401176470588233                          | 6               |
| 17.441359661495113                          | 3               |
| 23.2                                        | 0               |
| 17.714222499449434                          | 2               |
| 15.394881909237196                          | 1               |
+---------------------------------------------+-----------------+

Query took: 0.045805958 seconds. 7/7 rows displayed.
```

### Acceleration

While the query in step 5 successfully returned results from federated remote data sources, the performance was suboptimal due to data transfer overhead.

To improve query performance, step 6 demonstrates the same query executed against locally materialized and accelerated datasets using [Data Accelerators](/data-accelerators/index.md), resulting in significant performance gains.

### Limitations

- **Query Optimization:** Filter/Join/Aggregation pushdown is not supported, potentially leading to suboptimal query plan.
- **Query Performance:** Without acceleration, federated queries will be slower than local queries due to network latency and data transfer.
- **Query Capabilities:** Not all SQL features and data types are supported across all data sources. More complex data type queries may not work as expected.
