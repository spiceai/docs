---
title: 'Cayenne Catalog Connector'
sidebar_label: 'Cayenne'
description: 'Connect to a Cayenne catalog for high-performance data acceleration.'
sidebar_position: 12
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - cayenne
  - data-connectors
---

Connect to a [Spice Cayenne](https://github.com/spiceai/spiceai) lakehouse catalog for high-performance local data storage. Spice Cayenne is an accelerated lakehouse format that combines SQLite for transactional metadata management with Vortex columnar files for data storage, providing fast analytical queries on locally stored data.

## Configuration

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
    params:
      cayenne_data_dir: /path/to/data # Optional. Directory for table data files.
      cayenne_metadata_dir: /path/to/metadata # Optional. Directory for SQLite metadata.
```

## `from`

The `from` field specifies the catalog provider. For Cayenne, use `cayenne`.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the Cayenne catalog will be available under this catalog name.

## `include` (Optional)

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `params`

| Parameter Name                    | Description                                                                                                                                 | Default              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `cayenne_data_dir`                | Local directory for table data files (Vortex format).                                                                                       | Spice data directory |
| `cayenne_metadata_dir`            | Local directory for Cayenne SQLite metadata.                                                                                                | Spice data directory |
| `cayenne_target_file_size_mb`     | Target Vortex file size in MB.                                                                                                              | `128`                |
| `cayenne_footer_cache_mb`         | Size of the in-memory Vortex footer cache in MB for query performance.                                                                      | `128`                |
| `cayenne_segment_cache_mb`        | Size of the in-memory Vortex segment cache in MB for caching decompressed data.                                                             | `256`                |
| `cayenne_compression_strategy`    | Compression algorithm for Vortex files. Options: `btrblocks`, `zstd`.                                                                       | `btrblocks`          |
| `cayenne_file_path`               | Custom path for storing Cayenne data files. Supports local paths or S3 Express One Zone URLs (e.g., `s3://bucket--usw2-az1--x-s3/prefix/`). | -                    |
| `cayenne_unsupported_type_action` | Action when an unsupported data type is encountered. Options: `error`, `string`, `warn`, `ignore`.                                          | `error`              |
| `cayenne_metastore`               | Metastore backend type. Supports `sqlite` or `turso` (requires `turso` feature flag).                                                       | `sqlite`             |

### S3 Express One Zone Parameters

When `cayenne_file_path` is set to an S3 Express One Zone URL (or `cayenne_s3_zone_ids` is configured), the following parameters control S3 connectivity:

| Parameter                     | Description                                                                                                                                     | Default    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `cayenne_s3_zone_ids`         | Comma-separated availability zone IDs (e.g., `usw2-az1,usw2-az2`). Auto-generates bucket names in format `spice-{app}-{dataset}--{zone}--x-s3`. | -          |
| `cayenne_s3_region`           | AWS region (e.g., `us-west-2`). Auto-derived from zone ID if not specified.                                                                     | -          |
| `cayenne_s3_auth`             | Authentication method: `iam_role` or `key`.                                                                                                     | `iam_role` |
| `cayenne_s3_key`              | AWS access key ID (required when `cayenne_s3_auth: key`).                                                                                       | -          |
| `cayenne_s3_secret`           | AWS secret access key (required when `cayenne_s3_auth: key`).                                                                                   | -          |
| `cayenne_s3_session_token`    | AWS session token (optional, for temporary credentials).                                                                                        | -          |
| `cayenne_s3_endpoint`         | Custom S3 endpoint URL (optional, overrides auto-generated endpoint).                                                                           | -          |
| `cayenne_s3_client_timeout`   | Request timeout duration (e.g., `30s`, `5m`).                                                                                                   | `120s`     |
| `cayenne_s3_unsigned_payload` | Use unsigned payload for S3 Express One Zone requests.                                                                                          | `true`     |
| `cayenne_s3_allow_http`       | Set to `true` for testing with local S3-compatible storage.                                                                                     | `false`    |

## Examples

### Default configuration

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
```

### Custom storage directories

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
    params:
      cayenne_data_dir: /data/cayenne/tables
      cayenne_metadata_dir: /data/cayenne/metadata
```

### Tuned for large datasets

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
    params:
      cayenne_target_file_size_mb: '256'
```

## Table Management

### `CREATE TABLE ... LIKE`

Create a new Cayenne catalog table that copies its schema and partitioning from an existing Cayenne catalog table.

#### Syntax

```sql
CREATE TABLE [IF NOT EXISTS] new_table LIKE source_table
```

#### Behavior

- Copies the source table's column schema.
- Copies the source table's partition expression (if any).
- In distributed mode, copies the source table's partition-to-executor assignments so that writes to both tables route to the same executors.
- Primary keys are **not** copied. Staging and derived tables typically don't need them.

#### Constraints

- Both `source_table` and `new_table` must be in a Cayenne catalog. Using `LIKE` with a non-Cayenne source returns an error.
- `LIKE` cannot be combined with `PARTITION BY` or `WITH` options. To create a table with a different partitioning, use a regular `CREATE TABLE` instead.

#### Example

```sql
-- Source table with bucket-based partitioning
CREATE TABLE cayenne_catalog.bench.orders (
  order_id BIGINT,
  customer_id BIGINT,
  total DOUBLE
) PARTITION BY (bucket(50, order_id));

-- Staging table that inherits the same schema and partitioning
CREATE TABLE IF NOT EXISTS cayenne_catalog.bench.orders_staging
  LIKE cayenne_catalog.bench.orders;
```

This is the recommended way to create staging tables for [`MERGE INTO`](../../reference/sql/dml#merge-into) operations in distributed mode, ensuring the staging and target tables share partition routing.
