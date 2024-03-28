---
title: 'Federated Queries'
sidebar_label: 'Federated Queries'
description: 'Learn how to use federated queries in Spice.'
sidebar_position: 2
---

Spice provides a powerful federated query feature that allows you to join and combine data from multiple data sources and perform complex queries. This feature enables you to leverage the full potential of your data by aggregating and analyzing information whereever it is stored.

Spice supports federated query across databases (PostgreSQL, MySQL, etc.), data warehouses (Databricks, Snowflake, BigQuery, etc.), and data lakes (S3, MinIO, etc.). See [Data Connectors](/data-connectors/index.md) for the full list of supported sources.

### Getting Started

To get started with federated queries using Spice, follow these steps:

**Step 1.** Install Spice by following the [installation instructions](/getting-started/index.md).

**Step 2.** Create a new Spice app called `demo`.

```bash
# Create Spice app "demo"
spice init demo

# Change to demo directory.
cd demo
```

**Step 3.** Start the Spice runtime.

```bash
spice run
```

**Step 4.** Open a new terminal and add the `lukekim/demo` Spicepod.

```bash
spice add lukekim/demo
```

Note in the Spice runtime output several datasets are loaded.

**Step 5.** Show available tables and query them, regardless of source.

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
FROM <>

-- Query PostgreSQL
SELECT *
FROM <>

-- Query Dremio
SELECT *
FROM <>
```

**Step 6.** Join tables across sources and query.

```sql
-- Query across S3, PostgreSQL, and Dremio.
```

### Acceleration

In this example, data was queried from several remote sources. To improve query performance, locally materialize and accelerate the datasets using [Data Accelerators](/data-accelerators/index.md).
