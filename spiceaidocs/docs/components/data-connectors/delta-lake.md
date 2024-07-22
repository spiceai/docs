---
title: 'Delta Lake Data Connector'
sidebar_label: 'Delta Lake Data Connector'
description: 'Delta Lake Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Query/accelerate [Delta Lake](https://delta.io/) tables in Spice.

```yaml
datasets:
  # Example for local Delta Lake
  - from: delta_lake:/path/to/local/delta/table  # A local filesystem path to a Delta Lake table
    name: my_delta_lake_table
  # Example for Delta Lake on S3
  - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/  # A reference to a table in S3
    name: my_delta_lake_table
    params:
      delta_lake_aws_access_key_id: ${secrets:aws_access_key_id}
      delta_lake_aws_secret_access_key: ${secrets:aws_secret_access_key}
  # Example for Delta Lake on Azure Blob
  - from: delta_lake:abfss://my_container@my_account.dfs.core.windows.net/path/to/azure/delta/table/  # A reference to a table in Azure Blob
    name: my_delta_lake_table
    params:
      delta_lake_azure_storage_account_name: my_account
      delta_lake_azure_storage_account_key: ${secrets:my_key}
```

## Configuration

<Tabs>
  <TabItem value="delta_lake_local" label="Delta Lake + Local" default>

    ```yaml
    - from: delta_lake:/path/to/local/delta/table  # A local filesystem path to a Delta Lake table
      name: my_delta_lake_table
    ```

  </TabItem>
  <TabItem value="delta_lake_s3" label="Delta Lake + S3" default>

    ```yaml
    - from: delta_lake:s3://my_bucket/path/to/s3/delta/table/  # A reference to a table in S3
      name: my_delta_lake_table
      params:
        delta_lake_aws_region: us-west-2 # Optional
        delta_lake_aws_access_key_id: ${secrets:aws_access_key_id}
        delta_lake_aws_secret_access_key: ${secrets:aws_secret_access_key}
        delta_lake_aws_endpoint: s3.us-west-2.amazonaws.com # Optional
    ```

  </TabItem>
  <TabItem value="delta_lake_azure" label="Delta Lake + Azure Blob">

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

  </TabItem>
  <TabItem value="delta_lake_gcp" label="Delta Lake + Google Storage">

    ```yaml
    params:
      delta_lake_google_service_account_path: /path/to/service-account.json
    ```

  </TabItem>
</Tabs>

### Delta Lake object store parameters

Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

#### AWS S3

- `databricks_aws_region`: Optional. The AWS region for the S3 object store. E.g. `us-west-2`.
- `databricks_aws_access_key_id`: The access key ID for the S3 object store. 
- `databricks_aws_secret_access_key`: The secret access key for the S3 object store.
- `databricks_aws_endpoint`: Optional. The endpoint for the S3 object store. E.g. `s3.us-west-2.amazonaws.com`.

#### Azure Blob

:::info Note
One of the following auth values must be provided for Azure Blob:

- `databricks_azure_storage_account_key`, 
- `databricks_azure_storage_client_id` and `azure_storage_client_secret`, or 
- `databricks_azure_storage_sas_key`.
:::

- `databricks_azure_storage_account_name`: The Azure Storage account name.
- `databricks_azure_storage_account_key`: The Azure Storage master key for accessing the storage account.
- `databricks_azure_storage_client_id`: The service principal client id for accessing the storage account.
- `databricks_azure_storage_client_secret`: The service principal client secret for accessing the storage account.
- `databricks_azure_storage_sas_key`: The shared access signature key for accessing the storage account.
- `databricks_azure_storage_endpoint`: Optional. The endpoint for the Azure Blob storage account.

#### Google Storage (GCS)

- `google_service_account`: Filesystem path to the Google service account JSON key file.
