---
title: 'Delta Lake Data Connector'
sidebar_label: 'Delta Lake Data Connector'
description: 'Delta Lake Data Connector Documentation'
pagination_prev: null
---

Query/accelerate [Delta Lake](https://delta.io/) tables in Spice.

```yaml
datasets:
  - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/
    name: my_delta_lake_table
    params:
      delta_lake_aws_access_key_id: ${secrets:aws_access_key_id}
      delta_lake_aws_secret_access_key: ${secrets:aws_secret_access_key}
```

## Configuration

### `from`

The `from` field for the Delta Lake connector takes the form of `delta_lake:path` where `path` is any supported path, either local or to a cloud storage location. See the [examples](#examples) section below.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

| Parameter Name   | Description                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `client_timeout` | Optional. Specifies timeout for object store operations. Default value is `30s`. E.g. `client_timeout: 60s` |

## Delta Lake object store parameters

### AWS S3

| Parameter Name                     | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `delta_lake_aws_region`            | Optional. The AWS region for the S3 object store. E.g. `us-west-2`.                |
| `delta_lake_aws_access_key_id`     | The access key ID for the S3 object store.                                         |
| `delta_lake_aws_secret_access_key` | The secret access key for the S3 object store.                                     |
| `delta_lake_aws_endpoint`          | Optional. The endpoint for the S3 object store. E.g. `s3.us-west-2.amazonaws.com`. |

### Azure Blob

:::info Note
**One** of the following auth values must be provided for Azure Blob:

- `delta_lake_azure_storage_account_key`, 
- `delta_lake_azure_storage_client_id` and `azure_storage_client_secret`, or 
- `delta_lake_azure_storage_sas_key`.
:::

| Parameter Name                           | Description                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `delta_lake_azure_storage_account_name`  | The Azure Storage account name.                                        |
| `delta_lake_azure_storage_account_key`   | The Azure Storage master key for accessing the storage account.        |
| `delta_lake_azure_storage_client_id`     | The service principal client id for accessing the storage account.     |
| `delta_lake_azure_storage_client_secret` | The service principal client secret for accessing the storage account. |
| `delta_lake_azure_storage_sas_key`       | The shared access signature key for accessing the storage account.     |
| `delta_lake_azure_storage_endpoint`      | Optional. The endpoint for the Azure Blob storage account.             |

### Google Storage (GCS)

| Parameter Name           | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `google_service_account` | Filesystem path to the Google service account JSON key file. |

## Examples

### Delta Lake + Local

```yaml
  - from: delta_lake:/path/to/local/delta/table  # A local filesystem path to a Delta Lake table
    name: my_delta_lake_table
```

### Delta Lake + S3

```yaml
  - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/  # A reference to a table in S3
    name: my_delta_lake_table
    params:
      delta_lake_aws_region: us-west-2 # Optional
      delta_lake_aws_access_key_id: ${secrets:aws_access_key_id}
      delta_lake_aws_secret_access_key: ${secrets:aws_secret_access_key}
      delta_lake_aws_endpoint: s3.us-west-2.amazonaws.com # Optional
```

### Delta Lake + Azure Blob

```yaml
  - from: delta_lake:abfss://my_container@my_account.dfs.core.windows.net/path/to/azure/delta/table/  # A reference to a table in Azure Blob
    name: my_delta_lake_table
    params:
      # Account Name + Key
      delta_lake_azure_storage_account_name: my_account
      delta_lake_azure_storage_account_key: ${secrets:my_key}

      # OR Service Principal + Secret
      delta_lake_azure_storage_client_id: my_client_id
      delta_lake_azure_storage_client_secret: ${secrets:my_secret}

      # OR SAS Key
      delta_lake_azure_storage_sas_key: my_sas_key
```

### Delta Lake + Google Storage

```yaml
    params:
      delta_lake_google_service_account_path: /path/to/service-account.json
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).