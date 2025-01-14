---
title: 'Unity Catalog Catalog Connector'
sidebar_label: 'Unity Catalog'
description: 'Connect to a Unity Catalog provider.'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Connect to a [Unity Catalog](https://www.unitycatalog.io/) as a catalog provider for federated SQL query against [Delta Lake](https://delta.io/) tables.

## Configuration

```yaml
catalogs:
  - from: unity_catalog:https://my_unity_catalog_host.com/api/2.1/unity-catalog/catalogs/my_catalog
    name: uc
    include:
      - "*.my_table"
    dataset_params:
      # delta_lake S3 parameters
      unity_catalog_aws_region: us-west-2
      unity_catalog_aws_access_key_id: ${secrets:aws_access_key_id}
      unity_catalog_aws_secret_access_key: ${secrets:aws_secret_access_key}
      unity_catalog_aws_endpoint: s3.us-west-2.amazonaws.com
```

## `from`

The `from` field is used to specify the catalog provider. For Unity Catalog, use `unity_catalog:<catalog_path>`. The `catalog_path` is the URL to the [`getCatalog`](https://github.com/unitycatalog/unitycatalog/blob/main/api/Apis/CatalogsApi.md) endpoint of the Unity Catalog API. It should be formatted as `https://<unity_catalog_host>/api/2.1/unity-catalog/catalogs/<catalog_name>`.

## `name`

The `name` field is used to specify the name of the catalog in Spice. The schema hierarchy of the external catalog is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

## `dataset_params`

The `dataset_params` field is used to configure the dataset-specific parameters for the catalog.

### AWS S3

- `unity_catalog_aws_region`: The AWS region for the S3 object store. E.g. `us-west-2`.
- `unity_catalog_aws_access_key_id`: The access key ID for the S3 object store.
- `unity_catalog_aws_secret_access_key`: The secret access key for the S3 object store.
- `unity_catalog_aws_endpoint`: The endpoint for the S3 object store. E.g. `s3.us-west-2.amazonaws.com`.

### Azure Blob

:::info Note
One of the following auth values must be provided for Azure Blob:

- `unity_catalog_azure_storage_account_key`, 
- `unity_catalog_azure_storage_client_id` and `azure_storage_client_secret`, or 
- `unity_catalog_azure_storage_sas_key`.
:::

- `unity_catalog_azure_storage_account_name`: The Azure Storage account name.
- `unity_catalog_azure_storage_account_key`: The Azure Storage master key for accessing the storage account.
- `unity_catalog_azure_storage_client_id`: The service principal client id for accessing the storage account.
- `unity_catalog_azure_storage_client_secret`: The service principal client secret for accessing the storage account.
- `unity_catalog_azure_storage_sas_key`: The shared access signature key for accessing the storage account.
- `unity_catalog_azure_storage_endpoint`: The endpoint for the Azure Blob storage account.

### Google Storage (GCS)

- `unity_catalog_google_service_account`: Filesystem path to the Google service account JSON key file.