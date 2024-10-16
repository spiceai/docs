---
title: 'Databricks Data Connector'
sidebar_label: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Databricks as a connector for federated SQL query against Databricks using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html) or directly from [Delta Lake](https://delta.io/) tables.


```yaml
datasets:
  # Example for Spark Connect
  - from: databricks:spiceai.datasets.my_awesome_table  # A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      mode: spark_connect
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token} # Use the key `my_token` from any secret store
      databricks_cluster_id: 1234-567890-abcde123
  # Example for Delta Lake + S3
  - from: databricks:spiceai.datasets.my_awesome_table  # A reference to a table in the Databricks unity catalog
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


## Configuration

Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:my_token}`.

<Tabs>
  <TabItem value="spark_connect" label="Spark Connect" default>

    ```yaml
    params:
      mode: spark_connect
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_cluster_id: 1234-567890-abcde123
      databricks_token: ${secrets:my_token}
    ```

  </TabItem>
  <TabItem value="delta_lake_s3" label="Delta Lake + S3">

    ```yaml
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}
      databricks_aws_region: us-west-2 # Optional
      databricks_aws_access_key_id: ${secrets:aws_access_key_id}
      databricks_aws_secret_access_key: ${secrets:aws_secret_access_key}
      databricks_aws_endpoint: s3.us-west-2.amazonaws.com # Optional
    ```

  </TabItem>
  <TabItem value="delta_lake_azure" label="Delta Lake + Azure Blob">

    ```yaml
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

  </TabItem>
  <TabItem value="delta_lake_gcp" label="Delta Lake + Google Storage">

    ```yaml
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}
      databricks_google_service_account_path: /path/to/service-account.json
    ```

  </TabItem>
</Tabs>

### Parameters

- `mode`: The execution mode for querying against Databricks. The default is `spark_connect`. Possible values:
  - `spark_connect`: Use Spark Connect to query against Databricks. Requires a Spark cluster to be available.
  - `delta_lake`: Query directly from Delta Tables. Requires the object store credentials to be provided.
- `databricks_endpoint`: The endpoint of the Databricks instance. Required for both modes.
- `databricks_cluster_id`: The ID of the compute cluster in Databricks to use for the query. Only valid when `mode` is `spark_connect`.
- `databricks_use_ssl`: If true, use a TLS connection to connect to the Databricks endpoint. Default is `true`.
- `client_timeout`: Optional. Applicable only in `delta_lake` mode. Specifies timeout for object store operations. Default value is `30s` E.g. `client_timeout: 60s`

### Delta Lake object store parameters

Configure the connection to the object store when using `mode: delta_lake`. Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

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
