---
title: 'DuckLake Data Connector'
sidebar_label: 'DuckLake Data Connector'
description: 'DuckLake Data Connector Documentation'
tags:
  - data-connectors
  - ducklake
---

[DuckLake](https://ducklake.select/) is an open lakehouse format that stores metadata in a SQLite-compatible database (or PostgreSQL) and data in Parquet files. This connector enables querying individual DuckLake tables as datasets in Spice.

For automatic discovery of all schemas and tables in a DuckLake catalog, use the [DuckLake Catalog Connector](../catalogs/ducklake) instead.

```yaml
datasets:
  - from: ducklake:my_table
    name: my_table
    params:
      connection_string: s3://my-bucket/path/metadata.ducklake
```

## Configuration

### `from`

The `from` field specifies the DuckLake table to connect to. Use `ducklake:<table_path>`, where `table_path` is the table name or a schema-qualified table name.

| `from` | Description |
| --- | --- |
| `ducklake:my_table` | Read from `my_table` in the default `main` schema |
| `ducklake:my_schema.my_table` | Read from `my_table` in the `my_schema` schema |

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: ducklake:customer
    name: tpch_customer
    params:
      connection_string: s3://my-bucket/metadata.ducklake
```

```sql
SELECT COUNT(*) FROM tpch_customer;
```

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter Name | Description |
| --- | --- |
| `connection_string` | **Required**. The DuckLake metadata location (e.g., `s3://bucket/path/metadata.ducklake`). |
| `name` | The name to attach the DuckLake catalog as in DuckDB. Default: `ducklake`. |
| `open` | Path to an existing DuckDB file for persistent storage. If not provided, an in-memory DuckDB instance is used. |

### Connection string formats

| Backend | Example |
| --- | --- |
| Local file | `/path/to/metadata.ducklake` |
| AWS S3 | `s3://bucket/path/metadata.ducklake` |
| PostgreSQL | `postgres:dbname=mydb host=localhost user=postgres password=secret` |

## Authentication

DuckLake relies on DuckDB's credential resolution for cloud storage access. No Spice-specific authentication parameters are needed.

### AWS S3

Uses the standard AWS credential chain:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)
2. Shared credentials file (`~/.aws/credentials`)
3. IAM instance profiles (on EC2/ECS)

## Examples

### Reading from a local DuckLake catalog

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      connection_string: /path/to/metadata.ducklake
```

### Reading from S3

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      connection_string: s3://my-bucket/lakehouse/metadata.ducklake
```

### Reading from a specific schema

```yaml
datasets:
  - from: ducklake:analytics.events
    name: events
    params:
      connection_string: s3://my-bucket/metadata.ducklake
```

### PostgreSQL metadata backend

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      connection_string: "postgres:dbname=ducklake_catalog host=localhost user=postgres password=postgres"
```

### Multiple tables with YAML anchors

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params: &ducklake_params
      connection_string: s3://my-bucket/metadata.ducklake
  - from: ducklake:orders
    name: orders
    params: *ducklake_params
  - from: ducklake:lineitem
    name: lineitem
    params: *ducklake_params
```

### With data acceleration

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      connection_string: s3://my-bucket/metadata.ducklake
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_interval: 1h
```

:::warning[Limitations]

- The DuckLake DuckDB extension is downloaded at runtime on first use, requiring network connectivity.
- The `connection_string` parameter is required — unlike the catalog connector, it cannot be omitted.
- Each dataset creates its own DuckDB connection pool. For querying many tables from the same catalog, consider using the [DuckLake Catalog Connector](../catalogs/ducklake) instead, which shares a single connection pool.

:::

## Cookbook

- A cookbook recipe to configure DuckLake as a catalog and data connector in Spice. [DuckLake Catalog Connector](https://github.com/spiceai/cookbook/tree/trunk/catalogs/ducklake#readme)
