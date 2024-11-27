---
title: 'Databricks Data Connector'
sidebar_label: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
pagination_prev: null
---

Databricks as a connector for federated SQL query against Databricks using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html) or directly from [Delta Lake](https://delta.io/) tables.

```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table  # A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}
      databricks_aws_access_key_id: ${secrets:aws_access_key_id}
      databricks_aws_secret_access_key: ${secrets:aws_secret_access_key}
```

## Configuration

### `from`

The `from` field for the Databricks connector takes the form `databricks:catalog.schema.table` where `catalog.schema.table` is the fully-qualified path to the table to read from.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table
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

Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:my_token}`.

| Parameter Name          | Description                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                  | The execution mode for querying against Databricks. The default is `spark_connect`. Possible values:<br />  <ul><li>`spark_connect`: Use Spark Connect to query against Databricks. Requires a Spark cluster to be available.</li><li>`delta_lake`: Query directly from Delta Tables. Requires the object store credentials to be provided.</li></ul> |
| `databricks_endpoint`   | The endpoint of the Databricks instance. Required for both modes.                                                                                                                                                                                                                                                                  |
| `databricks_cluster_id` | The ID of the compute cluster in Databricks to use for the query. Only valid when `mode` is `spark_connect`.                                                                                                                                                                                                                       |
| `databricks_use_ssl`    | If true, use a TLS connection to connect to the Databricks endpoint. Default is `true`.                                                                                                                                                                                                                                            |
| `client_timeout`        | Optional. Applicable only in `delta_lake` mode. Specifies timeout for object store operations. Default value is `30s` E.g. `client_timeout: 60s`                                                                                                                                                                                   |

## Delta Lake object store parameters

Configure the connection to the object store when using `mode: delta_lake`. Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

### AWS S3

| Parameter Name                     | Description                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `databricks_aws_region`            | Optional. The AWS region for the S3 object store. E.g. `us-west-2`.                |
| `databricks_aws_access_key_id`     | The access key ID for the S3 object store.                                         |
| `databricks_aws_secret_access_key` | The secret access key for the S3 object store.                                     |
| `databricks_aws_endpoint`          | Optional. The endpoint for the S3 object store. E.g. `s3.us-west-2.amazonaws.com`. |

### Azure Blob

:::info Note
**One** of the following auth values must be provided for Azure Blob:

- `databricks_azure_storage_account_key`, 
- `databricks_azure_storage_client_id` and `azure_storage_client_secret`, or 
- `databricks_azure_storage_sas_key`.
:::

| Parameter Name                           | Description                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `databricks_azure_storage_account_name`  | The Azure Storage account name.                                        |
| `databricks_azure_storage_account_key`   | The Azure Storage key for accessing the storage account.        |
| `databricks_azure_storage_client_id`     | The Service Principal client ID for accessing the storage account.     |
| `databricks_azure_storage_client_secret` | The Service Principal client secret for accessing the storage account. |
| `databricks_azure_storage_sas_key`       | The shared access signature key for accessing the storage account.     |
| `databricks_azure_storage_endpoint`      | Optional. The endpoint for the Azure Blob storage account.             |

### Google Storage (GCS)

| Parameter Name           | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `google_service_account` | Filesystem path to the Google service account JSON key file. |

## Examples

### Spark Connect

```yaml
  - from: databricks:spiceai.datasets.my_spark_table  # A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      mode: spark_connect
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_cluster_id: 1234-567890-abcde123
      databricks_token: ${secrets:my_token}
```

### Delta Lake (S3)

```yaml
  - from: databricks:spiceai.datasets.my_delta_table  # A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}
      databricks_aws_region: us-west-2 # Optional
      databricks_aws_access_key_id: ${secrets:aws_access_key_id}
      databricks_aws_secret_access_key: ${secrets:aws_secret_access_key}
      databricks_aws_endpoint: s3.us-west-2.amazonaws.com # Optional
```

### Delta Lake (Azure Blobs)

```yaml
  - from: databricks:spiceai.datasets.my_adls_table  # A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}

      # Account Name + Key
      databricks_azure_storage_account_name: my_account
      databricks_azure_storage_account_key: ${secrets:my_key}

      # OR Service Principal + Secret
      databricks_azure_storage_client_id: my_client_id
      databricks_azure_storage_client_secret: ${secrets:my_secret}

      # OR SAS Key
      databricks_azure_storage_sas_key: my_sas_key
```

### Delta Lake (GCP)

```yaml
  - from: databricks:spiceai.datasets.my_gcp_table  # A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}
      databricks_google_service_account_path: /path/to/service-account.json
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).