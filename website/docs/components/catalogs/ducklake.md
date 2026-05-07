---
title: 'DuckLake Catalog Connector'
sidebar_label: 'DuckLake'
description: 'Connect to a DuckLake catalog for federated SQL query.'
sidebar_position: 6
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - ducklake
  - data-connectors
  - write
---

Connect to a [DuckLake](https://ducklake.select/) catalog for federated SQL query. DuckLake is an open lakehouse format that stores metadata in a SQLite-compatible database (or PostgreSQL) and data in Parquet files, providing lakehouse-style operations without a separate metadata service.

For connecting to individual DuckLake tables, see the [DuckLake Data Connector documentation](../data-connectors/ducklake).

## Configuration

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/path/metadata.ducklake
    name: my_lakehouse
    # access: read_write  # Optional. Enable write operations.
    params:
      name: ducklake # Optional. Name to attach the catalog as in DuckDB. Defaults to 'ducklake'.
      open: /path/to/local.duckdb # Optional. Path to a DuckDB file for persistent storage.
```

## `from`

The `from` field specifies the DuckLake catalog connection. Use `ducklake:<connection_string>`, where `connection_string` is the location of the DuckLake metadata.

Supported connection string formats:

| Backend    | Example                                                                      |
| ---------- | ---------------------------------------------------------------------------- |
| Local file | `ducklake:/path/to/metadata.ducklake`                                        |
| AWS S3     | `ducklake:s3://bucket/path/metadata.ducklake`                                |
| PostgreSQL | `ducklake:postgres:dbname=mydb host=localhost user=postgres password=secret` |

The connection string can also be provided via the `ducklake_connection_string` parameter.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the DuckLake catalog will be available using this name in Spice. The schema hierarchy of the DuckLake catalog is preserved.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables.

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/metadata.ducklake
    name: my_lakehouse
    include:
      - 'main.*' # Include all tables in the "main" schema
```

## `access`

The `access` field controls what operations are allowed on the catalog:

| Access Mode         | Description                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `read` (default)    | Query tables only. DuckDB opens in read-only mode.                                   |
| `read_write`        | Query and write data (INSERT). DuckDB opens in read-write mode.                      |
| `read_write_create` | Full access including CREATE/DROP SCHEMA and TABLE. DuckDB opens in read-write mode. |

## `params`

| Parameter Name                     | Description                                                                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ducklake_connection_string`       | The DuckLake metadata location (e.g., `s3://bucket/path/metadata.ducklake`). If omitted, the value from `from: ducklake:<connection_string>` is used. |
| `ducklake_name`                    | The name to attach the DuckLake catalog as in DuckDB. Default: `ducklake`.                                                                            |
| `ducklake_open`                    | Path to an existing DuckDB file for persistent storage. If not provided, an in-memory DuckDB instance is used.                                        |
| `ducklake_aws_region`              | Optional. The AWS region for S3 storage. Default: `us-east-1` when explicit credentials are provided.                                                 |
| `ducklake_aws_access_key_id`       | Optional. The AWS access key ID for S3 storage. Must be set together with `ducklake_aws_secret_access_key`.                                           |
| `ducklake_aws_secret_access_key`   | Optional. The AWS secret access key for S3 storage. Must be set together with `ducklake_aws_access_key_id`.                                           |
| `ducklake_aws_endpoint`            | Optional. Custom S3-compatible endpoint URL (e.g., for MinIO).                                                                                        |
| `ducklake_aws_allow_http`          | Optional. Set to `true` to allow HTTP (non-TLS) connections to S3. Default: `false`.                                                                  |

## Authentication

### AWS S3

When no explicit S3 credentials are configured, DuckDB falls back to its built-in credential chain provider:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`)
2. Shared credentials file (`~/.aws/credentials`)
3. IAM instance profiles (on EC2/ECS)

To provide explicit S3 credentials, use the `ducklake_aws_*` parameters:

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/metadata.ducklake
    name: my_lakehouse
    params:
      ducklake_aws_region: us-west-2
      ducklake_aws_access_key_id: ${secrets:AWS_ACCESS_KEY_ID}
      ducklake_aws_secret_access_key: ${secrets:AWS_SECRET_ACCESS_KEY}
```

For S3-compatible storage (e.g., MinIO), use `ducklake_aws_endpoint`:

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/metadata.ducklake
    name: my_lakehouse
    params:
      ducklake_aws_endpoint: http://minio:9000
      ducklake_aws_access_key_id: ${secrets:MINIO_ACCESS_KEY}
      ducklake_aws_secret_access_key: ${secrets:MINIO_SECRET_KEY}
      ducklake_aws_allow_http: true
```

## Examples

### Local DuckLake catalog

```yaml
catalogs:
  - from: ducklake:/path/to/metadata.ducklake
    name: my_lakehouse
```

### S3-backed DuckLake catalog

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/lakehouse/metadata.ducklake
    name: cloud_lakehouse
```

### PostgreSQL metadata backend

Use PostgreSQL as the metadata storage for multi-user access (note: `from` field does not support secrets replacement):

```yaml
catalogs:
  - from: ducklake
    name: my_lakehouse
    params:
      ducklake_connection_string: "postgres:dbname=ducklake_catalog host=localhost user=postgres password=${secrets:PASSWORD}"
```

### Read-write with DDL support

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/metadata.ducklake
    name: my_lakehouse
    access: read_write_create
```

```sql
-- Create a new schema
CREATE SCHEMA my_lakehouse.analytics;

-- Create a table
CREATE TABLE my_lakehouse.analytics.events (
    id BIGINT,
    event_type VARCHAR,
    timestamp TIMESTAMP
);

-- Insert data
INSERT INTO my_lakehouse.analytics.events VALUES (1, 'click', '2026-03-01T10:00:00');

-- Drop a table
DROP TABLE my_lakehouse.analytics.events;

-- Drop an empty schema
DROP SCHEMA my_lakehouse.analytics;
```

## Write Support

This catalog supports writing data to DuckLake tables using SQL [`INSERT INTO`](../../reference/sql/dml#insert) statements when `access` is set to `read_write` or `read_write_create`.

```yaml
catalogs:
  - from: ducklake:s3://my-bucket/metadata.ducklake
    name: my_lakehouse
    access: read_write
```

```sql
INSERT INTO my_lakehouse.main.customers (id, name, email)
VALUES (1, 'Acme Corp', 'info@acme.com');
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).

:::warning[Limitations]

- Spice uses DuckDB 1.4.4, which supports DuckLake format versions 0.1, 0.2, 0.3-dev1, and 0.3 only. Catalogs created with DuckDB 1.5.x or later use format v0.4+, which is not compatible.
- The DuckLake DuckDB extension is downloaded at runtime on first use, requiring network connectivity.
- The `information_schema` and `pg_catalog` system schemas are automatically filtered out during discovery.
- Catalog refresh is non-incremental — a full re-query of `information_schema` is performed on each refresh cycle.
- If a table fails to load during catalog refresh, it is skipped with a warning and does not fail the entire catalog.

:::
