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
- Install docker in your local environment.
- Run a local postgresql container with the following command:
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -d -p 15432:5432 postgres
```
- Using Spice to seed a remote parquet file into the postgres instance
  - Create a new empty folder
  - `spice init`
  - edit `spicepod.yaml` and add the following content
  ```yaml
  datasets:
    - from: s3://spiceai-demo-datasets/cleaned_sales_data.parquet
      name: cleaned_sales_data
      acceleration:
        engine: postgres
        params:
          pg_host: localhost
          pg_port: '15432'
          pg_db: postgres
          pg_user: postgres
          pg_pass: postgres
  ```
  - `spice run`, this will load the data into postgres
  - `PGPASSWORD=postgres psql -h localhost -U postgres -p 15432  postgres -c "select count(1) from cleaned_sales_data"`

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

**Step 5.** Join tables across sources and query.

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
```

### Acceleration

In this example, data was queried from several remote sources. To improve query performance, locally materialize and accelerate the datasets using [Data Accelerators](/data-accelerators/index.md).
