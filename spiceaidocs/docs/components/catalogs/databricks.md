---
title: 'Databricks Catalog Connector'
sidebar_label: 'Databricks'
description: 'Connect to a Databricks Unity Catalog provider.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Connect to a [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) as a catalog provider for federated SQL query using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html) or directly from [Delta Lake](https://delta.io/) tables.

## Configuration

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog # tables from this catalog will be available in the "uc_catalog" catalog in Spice
    include:
      - "*.my_table_name" # include only the "my_table_name" tables
    params:
      endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
      mode: delta_lake # or spark_connect
    dataset_params:
      # delta_lake S3 parameters
      aws_region: us-west-2
      aws_access_key_id: <aws-access-key-id>
      aws_secret_access_key: <aws-secret>
      aws_endpoint: s3.us-west-2.amazonaws.com
      # spark_connect parameters
      databricks_cluster_id: 1234-567890-abcde123
```

## `from`

The `from` field is used to specify the catalog provider. For Databricks, use `databricks:<catalog_name>`. The `catalog_name` is the name of the catalog in the Databricks Unity Catalog you want to connect to.

## `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the Databricks catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

## `params`

The `params` field is used to configure the connection to the Databricks Unity Catalog. The following parameters are supported:

- `endpoint`: The Databricks workspace endpoint, e.g. `dbc-a12cd3e4-56f7.cloud.databricks.com`.
- `token`: The Databricks API token to authenticate with the Unity Catalog API. Can also be specified in the `databricks` secret. See the [Databricks Data Connector](/components/data-connectors/databricks.md) for more information on configuring the secret.
- `mode`: The execution mode for querying against Databricks. The default is `spark_connect`. Possible values:
  - `spark_connect`: Use Spark Connect to query against Databricks. Requires a Spark cluster to be available.
  - `delta_lake`: Query directly from Delta Tables. Requires the object store credentials to be provided, either as a secret or inline in the params.
- `databricks_use_ssl`: If true, use a TLS connection to connect to the Databricks endpoint. Default is `true`.

## `dataset_params`

The `dataset_params` field is used to configure the dataset-specific parameters for the catalog. The following parameters are supported:

### Spark Connect parameters

- `databricks_cluster_id`: The ID of the compute cluster in Databricks to use for the query. e.g. `1234-567890-abcde123`.

### Delta Lake parameters

These settings can also be configured in the `databricks` secret. See the [Databricks Data Connector](/components/data-connectors/databricks.md) for more information on configuring the secret.

#### AWS S3

- `aws_region`: The AWS region for the S3 object store.
- `aws_access_key_id`: The access key ID for the S3 object store.
- `aws_secret_access_key`: The secret access key for the S3 object store.
- `aws_endpoint`: The endpoint for the S3 object store.

#### Azure Blob

Note: One of the following must be provided: `azure_storage_account_key`, `azure_storage_client_id` and `azure_storage_client_secret`, or `azure_storage_sas_key`.

- `azure_storage_account_name`: The Azure Storage account name.
- `azure_storage_account_key`: The Azure Storage master key for accessing the storage account.
- `azure_storage_client_id`: The service principal client id for accessing the storage account.
- `azure_storage_client_secret`: The service principal client secret for accessing the storage account.
- `azure_storage_sas_key`: The shared access signature key for accessing the storage account.
- `azure_storage_endpoint`: The endpoint for the Azure Blob storage account.

#### Google Storage (GCS)

- `google_service_account`: Filesystem path to the Google service account JSON key file.