---
title: 'Query Federation'
sidebar_label: 'Query Federation'
description: 'Learn how to use federated SQL queries in Spice.ai Open Source'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Spice supports query federation, enabling you to join, combine, and query data using SQL from multiple sources, including databases (PostgreSQL, MySQL), data warehouses (Databricks, Snowflake, BigQuery), and data lakes (S3, MinIO).

![Spice.ai Open Source Query Federation](/img/features/query-federation.png)

For a full list of supported sources, see [Data Connectors](../../components/data-connectors/index).

## Getting Started

To start using federated queries in Spice, follow these steps:

**Step 1.** Install Spice by following the [installation instructions](../getting-started/index.mdx).

**Step 2.** Clone the Spice Cookbook repository and navigate to the `federation` directory.

```bash
git clone https://github.com/spiceai/cookbook.git
cd cookbook/federation
```

**Step 3.** Login to the demo Dremio.

```bash
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
FROM s3_source LIMIT 10;

-- Query S3 (Parquet) accelerated
SELECT *
FROM s3_source_accelerated LIMIT 10;

-- Query Dremio
SELECT *
FROM dremio_source LIMIT 10;

-- Query Dremio accelerated
SELECT *
FROM dremio_source_accelerated LIMIT 10;
```

**Step 8.** Join tables across remote sources and locally accelerated source

```sql
-- Query across S3 and Dremio
WITH all_sales AS (
   SELECT sales FROM s3_source
   UNION ALL
   select fare_amount+tip_amount as sales from dremio_source
)
SELECT SUM(sales) as total_sales,
       COUNT(*) AS total_transactions,
       MAX(sales) AS max_sale,
       AVG(sales) AS avg_sale
FROM all_sales;

+--------------------+--------------------+----------+--------------------+
| total_sales        | total_transactions | max_sale | avg_sale           |
+--------------------+--------------------+----------+--------------------+
| 11501140.079999998 | 102823             | 14082.8  | 111.85376890384445 |
+--------------------+--------------------+----------+--------------------+

Time: 1.079320792 seconds. 1 rows.
```

**Step 9.** Join tables across locally accelerated sources and query

```sql
-- Query across S3 accelerated and Dremio accelerated
WITH all_sales AS (
   SELECT sales FROM s3_source_accelerated
   UNION ALL
   select fare_amount+tip_amount as sales from dremio_source_accelerated
)
SELECT SUM(sales) as total_sales,
       COUNT(*) AS total_transactions,
       MAX(sales) AS max_sale,
       AVG(sales) AS avg_sale
FROM all_sales;

+-------------+--------------------+----------+--------------------+
| total_sales | total_transactions | max_sale | avg_sale           |
+-------------+--------------------+----------+--------------------+
| 11501140.08 | 102823             | 14082.8  | 111.85376890384447 |
+-------------+--------------------+----------+--------------------+

Time: 0.011524375 seconds. 1 rows.
```

### Acceleration

While the query in step 8 successfully returned results from federated remote data sources, the performance was suboptimal due to data transfer overhead.

To improve query performance, step 9 demonstrates the same query executed against locally materialized and accelerated datasets using [Data Accelerators](../../components/data-accelerators/index), resulting in significant performance gains.

:::warning[Limitations]

- **Query Performance:** Without acceleration, federated queries will be slower than local queries due to network latency and data transfer.
- **Query Capabilities:** Not all SQL features and data types are supported across all data sources. More complex data type queries may not work as expected.

:::
