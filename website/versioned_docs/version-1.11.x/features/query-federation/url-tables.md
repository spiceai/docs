---
title: 'URL Tables'
sidebar_label: 'URL Tables'
description: 'Query object store files directly using URLs without pre-registering datasets'
sidebar_position: 3
tags:
  - query
  - sql
  - features
  - s3
  - azure
---

URL tables enable querying files in object stores directly using their URLs, without pre-registering datasets in a Spicepod. This provides an ad-hoc query capability for exploring data stored in S3, Azure Blob Storage, or HTTP endpoints.

## Enabling URL Tables

URL tables are disabled by default and must be explicitly enabled in the Spicepod configuration:

```yaml
runtime:
  params:
    url_tables: enabled
```

## Supported URL Schemes

| Scheme     | Description                  | Example                                                |
| ---------- | ---------------------------- | ------------------------------------------------------ |
| `s3://`    | Amazon S3                    | `s3://bucket/path/file.parquet`                        |
| `abfs://`  | Azure Blob Storage           | `abfs://container@account/path/file.parquet`           |
| `abfss://` | Azure Data Lake Storage Gen2 | `abfss://container@account.dfs.core.windows.net/path/` |
| `https://` | HTTPS endpoints              | `https://example.com/data.parquet`                     |
| `http://`  | HTTP endpoints               | `http://localhost:8080/data.csv`                       |

## Query Patterns

### Single File

Query a single file by specifying its full URL:

```sql
SELECT * FROM 's3://my-bucket/data/sales.parquet' LIMIT 10
```

### Directory or Prefix

Query all files under a directory or prefix by including a trailing slash:

```sql
-- All files in a directory
SELECT * FROM 's3://my-bucket/data/'

-- All files in a bucket
SELECT * FROM 's3://my-bucket/'
```

### Glob Patterns

Use glob patterns to match specific files:

```sql
-- All parquet files in a directory
SELECT * FROM 's3://my-bucket/data/*.parquet'

-- Files matching a pattern across subdirectories
SELECT * FROM 's3://my-bucket/year=2024/month=*/data.parquet'
```

### Hive-Style Partitions

Hive-style partitions are automatically inferred from the path structure, enabling partition pruning:

```sql
-- If data is stored at s3://bucket/data/year=2024/month=01/file.parquet
-- the year and month columns are available for filtering
SELECT * FROM 's3://my-bucket/data/' WHERE year = '2024' AND month = '01'
```

## Authentication

URL tables use the same authentication mechanisms as the corresponding data connectors. Credentials are loaded automatically from environment variables or cloud provider defaults.

### S3

For S3, credentials are loaded from:

1. Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
2. Shared AWS credentials file (`~/.aws/credentials`)
3. IAM instance profiles or roles

For public buckets, no authentication is required.

### Azure Blob Storage

For Azure, set the storage account name via environment variable:

```bash
export AZURE_STORAGE_ACCOUNT=mystorageaccount
```

Alternatively, include the account name in the URL:

```sql
SELECT * FROM 'abfss://container@mystorageaccount.dfs.core.windows.net/path/file.parquet'
```

Additional authentication options:

- Environment variable: `AZURE_STORAGE_KEY` for access key authentication
- Azure Managed Identity (automatic when running on Azure)
- Azure CLI credentials

## Examples

### S3 Query

```yaml
runtime:
  params:
    url_tables: enabled
```

```sql
-- Query a public S3 dataset
SELECT VendorID, passenger_count, trip_distance
FROM 's3://spiceai-public-datasets/taxi_small_samples/taxi_sample.parquet'
LIMIT 5
```

### Azure Blob Storage Query

```yaml
runtime:
  params:
    url_tables: enabled
```

Set the account via environment variable:

```bash
export AZURE_STORAGE_ACCOUNT=mystorageaccount
export AZURE_STORAGE_KEY=${your_access_key}
```

Or include the account in the URL:

```sql
SELECT *
FROM 'abfss://mycontainer@mystorageaccount.dfs.core.windows.net/data/'
LIMIT 10
```

### Cross-Source Query

URL tables can be combined with registered datasets in federated queries:

```yaml
runtime:
  params:
    url_tables: enabled

datasets:
  - from: postgres:orders
    name: orders
    params:
      pg_host: localhost
      pg_db: mydb
```

```sql
-- Join a registered dataset with an ad-hoc S3 query
SELECT o.order_id, o.customer_id, s.product_name
FROM orders o
JOIN 's3://my-bucket/products.parquet' s ON o.product_id = s.id
```

## Considerations

- **Schema Inference**: The schema is inferred from the files at query time. For best performance with large datasets, consider registering datasets in the Spicepod.
- **File Format Detection**: File formats are automatically inferred from file extensions. Supported formats include Parquet, CSV, and JSON.
- **Performance**: URL tables query data directly from the object store without local acceleration. For frequently accessed data or performance-critical queries, register datasets with [data acceleration](../../components/data-accelerators/).
- **Authentication Scope**: URL table queries use environment-level credentials. For queries requiring different credentials per source, register datasets with explicit authentication parameters.

## Related Topics

- [S3 Data Connector](../../components/data-connectors/s3) - Register S3 datasets with full configuration options
- [Azure BlobFS Data Connector](../../components/data-connectors/abfs) - Register Azure datasets with full configuration options
- [Query Federation](./) - Learn about federated queries across multiple sources
- [Data Acceleration](../../components/data-accelerators) - Accelerate query performance with local caching
