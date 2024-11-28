---
title: 'Federated Queries'
sidebar_label: 'Federated Queries'
description: 'Learn how to use federated queries in Spice.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Spice provides a powerful federated query feature that allows you to join and combine data from multiple data sources and perform complex queries. This feature enables you to leverage the full potential of your data by aggregating and analyzing information wherever it is stored.

Spice supports federated query across databases (PostgreSQL, MySQL, etc.), data warehouses (Databricks, Snowflake, BigQuery, etc.), and data lakes (S3, MinIO, etc.). See [Data Connectors](/components/data-connectors/index.md) for the full list of supported sources.

### Getting Started

To get started with federated queries using Spice, follow these steps:

**Step 1.** Install Spice by following the [installation instructions](/getting-started/index.md).

**Step 2.** Clone the [Spice Quickstarts repo](https://github.com/spiceai/quickstarts) and navigate to the `federation` directory.

```bash
git clone https://github.com/spiceai/quickstarts.git
cd quickstarts/federation
```

**Step 3.** Start PostgreSQL with Docker Compose & login to the demo Dremio.

```bash
make
spice login dremio -u demo -p demo1234
```

**Step 4.** Create a new Spice app called `demo`.

```bash
# Create Spice app "demo"
spice init demo

# Change to demo directory.
cd demo
```

**Step 5.** Add the `spiceai/fed-demo` Spicepod.

```bash
# Change to demo directory.
cd demo

spice add spiceai/fed-demo
```

Note in the Spice runtime output several datasets are loaded.

**Step 6.** Start the Spice runtime.

```bash
spice run
```

**Step 7.** Show available tables and query them, regardless of source.

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

**Step 8.** Join tables across remote sources and locally accelerated source

```sql
-- Query across S3, PostgreSQL, and Dremio
WITH order_numbers AS (
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
FROM dremio_source_accelerated
WHERE passenger_count IN (
  SELECT DISTINCT order_number % 10 AS num_of_passenger
  FROM order_numbers
)
GROUP BY passenger_count;

+---------------------------------------------+-----------------+
| avg(dremio_source_accelerated.total_amount) | passenger_count |
+---------------------------------------------+-----------------+
| 17.441359661495113                          | 3               |
| 22.401176470588233                          | 6               |
| 21.122631578947367                          | 5               |
| 17.219515789473697                          | 4               |
| 17.71422249944938                           | 2               |
| 15.394881909237206                          | 1               |
| 23.2                                        | 0               |
+---------------------------------------------+-----------------+

Time: 0.557610333 seconds. 7 rows.
```

**Step 9.** Join tables across locally accelerated sources and query

```sql
-- Query across S3 accelerated, PostgreSQL, and Dremio accelerated
WITH order_numbers AS (
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

Time: 0.045805958 seconds. 7 rows.
```

**Step 10.** Clean up the Postgres container.

```bash
make clean
```

### Acceleration

While the query in step 8 successfully returned results from federated remote data sources, the performance was suboptimal due to data transfer overhead.

To improve query performance, step 9 demonstrates the same query executed against locally materialized and accelerated datasets using [Data Accelerators](/components/data-accelerators/index.md), resulting in significant performance gains.

:::warning[Limitations]

- **Query Performance:** Without acceleration, federated queries will be slower than local queries due to network latency and data transfer.
- **Query Capabilities:** Not all SQL features and data types are supported across all data sources. More complex data type queries may not work as expected.

:::
