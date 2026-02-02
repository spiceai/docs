---
title: 'Query Federation'
sidebar_label: 'Query Federation'
description: 'Learn how to use federated SQL queries in Spice.ai Open Source'
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - query
  - sql
  - features
---

import DocCardList from '@theme/DocCardList';

Spice provides a high-performance SQL query engine built on Apache DataFusion, supporting query federation across multiple data sources including databases (PostgreSQL, MySQL), data warehouses (Databricks, Snowflake, BigQuery), and data lakes (S3, MinIO).

![Spice.ai Open Source Query Federation](/img/features/query-federation.png)

For a full list of supported sources, see [Data Connectors](../components/data-connectors).

## Query Methods

Spice supports multiple ways to execute queries:

- **SQL Queries**: Execute standard SQL queries against datasets using the HTTP API, Arrow Flight SQL, JDBC, ODBC, or ADBC.
- **Parameterized Queries**: Execute prepared statements with parameter binding for improved security and performance.
- **Federated Queries**: Join and query data across multiple sources in a single SQL statement.

## API Endpoints

| Protocol         | Endpoint                 | Description                            |
| ---------------- | ------------------------ | -------------------------------------- |
| HTTP             | `/v1/sql`                | Execute SQL queries over HTTP          |
| Arrow Flight SQL | `grpc://localhost:50051` | High-performance Arrow-native queries  |
| JDBC/ODBC        | Flight SQL compatible    | Connect from BI tools and applications |
| ADBC             | Flight SQL driver        | Arrow Database Connectivity            |

### HTTP API

Execute a query using the HTTP API:

```bash
curl -X POST http://localhost:8090/v1/sql \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM my_table LIMIT 10"}'
```

### Arrow Flight SQL

Connect using Arrow Flight SQL for high-performance data transfer:

```python
import adbc_driver_flightsql.dbapi

conn = adbc_driver_flightsql.dbapi.connect('grpc://localhost:50051')
cursor = conn.cursor()
cursor.execute("SELECT * FROM my_table LIMIT 10")
result = cursor.fetch_arrow_table()
```

### SQL REPL

Use the Spice CLI for interactive queries:

```bash
spice sql
```

```sql
SELECT * FROM my_table LIMIT 10;
```

## Query Features

<DocCardList />

## Federated Query Example

To start using federated queries in Spice, follow these steps:

**Step 1.** Install Spice by following the [installation instructions](../getting-started).

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

The query in step 8 returns results from federated remote data sources, but performance is affected by network latency and data transfer overhead.

Step 9 demonstrates the same query executed against locally materialized datasets using [Data Accelerators](../components/data-accelerators). By storing data locally, queries avoid network round-trips and achieve significantly faster response times.

:::warning[Limitations]

- **Query Performance:** Without acceleration, federated queries will be slower than local queries due to network latency and data transfer.
- **Query Capabilities:** Not all SQL features and data types are supported across all data sources. More complex data type queries may not work as expected.

:::

## Related Topics

- [Distributed Query](distributed-query) - Scale queries across multiple nodes
- [Results Caching](caching) - Cache query results for improved performance
- [Arrow Flight SQL API](../api/arrow-flight-sql) - High-performance query protocol
- [ADBC](../api/adbc) - Arrow Database Connectivity
