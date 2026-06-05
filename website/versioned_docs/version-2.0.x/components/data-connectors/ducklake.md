---
title: 'DuckLake Data Connector'
sidebar_label: 'DuckLake Data Connector'
description: 'DuckLake Data Connector Documentation'
tags:
  - data-connectors
  - ducklake
  - write
---

[DuckLake](https://ducklake.select/) is an open lakehouse format that stores metadata in a SQLite-compatible database (or PostgreSQL) and data in Parquet files. This connector enables querying individual DuckLake tables as datasets in Spice.

For automatic discovery of all schemas and tables in a DuckLake catalog, use the [DuckLake Catalog Connector](../catalogs/ducklake) instead.

```yaml
datasets:
  - from: ducklake:my_table
    name: my_table
    params:
      ducklake_connection_string: s3://my-bucket/path/metadata.ducklake
```

## Configuration

### `from`

The `from` field specifies the DuckLake table to connect to. Use `ducklake:<table_path>`, where `table_path` is the table name or a schema-qualified table name.

| `from`                        | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `ducklake:my_table`           | Read from `my_table` in the default `main` schema |
| `ducklake:my_schema.my_table` | Read from `my_table` in the `my_schema` schema    |

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: ducklake:customer
    name: tpch_customer
    params:
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
```

```sql
SELECT COUNT(*) FROM tpch_customer;
```

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter Name                     | Description                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ducklake_connection_string`       | **Required**. The DuckLake metadata location (e.g., `s3://bucket/path/metadata.ducklake`).                     |
| `ducklake_name`                    | The name to attach the DuckLake catalog as in DuckDB. Default: `ducklake`.                                     |
| `ducklake_open`                    | Path to an existing DuckDB file for persistent storage. If not provided, an in-memory DuckDB instance is used. |
| `ducklake_aws_region`              | Optional. The AWS region for S3 storage. Default: `us-east-1` when explicit credentials are provided.          |
| `ducklake_aws_access_key_id`       | Optional. The AWS access key ID for S3 storage. Must be set together with `ducklake_aws_secret_access_key`.    |
| `ducklake_aws_secret_access_key`   | Optional. The AWS secret access key for S3 storage. Must be set together with `ducklake_aws_access_key_id`.    |
| `ducklake_aws_endpoint`            | Optional. Custom S3-compatible endpoint URL (e.g., for MinIO).                                                 |
| `ducklake_aws_allow_http`          | Optional. Set to `true` to allow HTTP (non-TLS) connections to S3. Default: `false`.                           |

### Connection string formats

| Backend    | Example                                                             |
| ---------- | ------------------------------------------------------------------- |
| Local file | `/path/to/metadata.ducklake`                                        |
| AWS S3     | `s3://bucket/path/metadata.ducklake`                                |
| PostgreSQL | `postgres:dbname=mydb host=localhost user=postgres password=secret` |

## Authentication

### AWS S3

When no explicit S3 credentials are configured, DuckDB falls back to its built-in credential chain provider:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)
2. Shared credentials file (`~/.aws/credentials`)
3. IAM instance profiles (on EC2/ECS)

To provide explicit S3 credentials, use the `ducklake_aws_*` parameters:

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
      ducklake_aws_region: us-west-2
      ducklake_aws_access_key_id: ${secrets:AWS_ACCESS_KEY_ID}
      ducklake_aws_secret_access_key: ${secrets:AWS_SECRET_ACCESS_KEY}
```

For S3-compatible storage (e.g., MinIO), use `ducklake_aws_endpoint`:

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
      ducklake_aws_endpoint: http://minio:9000
      ducklake_aws_access_key_id: ${secrets:MINIO_ACCESS_KEY}
      ducklake_aws_secret_access_key: ${secrets:MINIO_SECRET_KEY}
      ducklake_aws_allow_http: true
```

## Write Support

This connector supports writing data to DuckLake tables using SQL [`INSERT INTO`](../../reference/sql/dml#insert) statements when `access` is set to `read_write`:

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    access: read_write
    params:
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
```

```sql
INSERT INTO customer (c_custkey, c_name) VALUES (1, 'Acme Corp');
```

`UPDATE` and `DELETE FROM` are not supported. For DDL operations (`CREATE TABLE`, `DROP TABLE`), use the [DuckLake Catalog Connector](../catalogs/ducklake) with `access: read_write_create`.

## Examples

### Reading from a local DuckLake catalog

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      ducklake_connection_string: /path/to/metadata.ducklake
```

### Reading from S3

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      ducklake_connection_string: s3://my-bucket/lakehouse/metadata.ducklake
```

### Reading from a specific schema

```yaml
datasets:
  - from: ducklake:analytics.events
    name: events
    params:
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
```

### PostgreSQL metadata backend

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params:
      ducklake_connection_string: "postgres:dbname=ducklake_catalog host=localhost user=postgres password=postgres"
```

### Multiple tables with YAML anchors

```yaml
datasets:
  - from: ducklake:customer
    name: customer
    params: &ducklake_params
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
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
      ducklake_connection_string: s3://my-bucket/metadata.ducklake
    acceleration:
      enabled: true
      engine: duckdb
      mode: file
      refresh_interval: 1h
```

:::warning[Limitations]

- Spice uses DuckDB 1.5.3, which supports DuckLake 1.0. Older DuckLake catalogs require a metadata migration before use. See [DuckLake migration guide](https://ducklake.select/docs/stable/duckdb/guides/troubleshooting#connecting-to-an-older-ducklake).
- The DuckLake DuckDB extension is downloaded at runtime on first use, requiring network connectivity.
- The `ducklake_connection_string` parameter is required — unlike the catalog connector, it cannot be omitted.
- Each dataset creates its own DuckDB connection pool. For querying many tables from the same catalog, consider using the [DuckLake Catalog Connector](../catalogs/ducklake) instead, which shares a single connection pool.
- Writes are limited to `INSERT INTO`. `UPDATE`, `DELETE FROM`, and DDL (`CREATE TABLE`, `DROP TABLE`) are not supported on the data connector — use the [DuckLake Catalog Connector](../catalogs/ducklake) for schema operations.

:::
