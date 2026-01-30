---
title: 'Databricks Catalog Connector'
sidebar_label: 'Databricks'
description: 'Connect to a Databricks Unity Catalog provider.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - databricks
  - data-connectors
---

Connect to a [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) as a catalog provider for federated SQL query using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html), directly from [Delta Lake](https://delta.io/) tables, or using the [SQL Statement Execution API](https://docs.databricks.com/aws/en/dev-tools/sql-execution-tutorial).

## Configuration

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog # tables from this catalog will be available in the "uc_catalog" catalog in Spice
    include:
      - '*.my_table_name' # include only the "my_table_name" tables
    params:
      mode: delta_lake # or spark_connect or sql_warehouse
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
    dataset_params:
      # delta_lake S3 parameters
      databricks_aws_region: us-west-2
      databricks_aws_access_key_id: ${secrets:aws_access_key_id}
      databricks_aws_secret_access_key: ${secrets:aws_secret_access_key}
      databricks_aws_endpoint: s3.us-west-2.amazonaws.com
      # spark_connect parameters
      databricks_cluster_id: 1234-567890-abcde123
      # sql_warehouse parameters
      databricks_sql_warehouse_id: 2b4e24cff378fb24
```

## `from`

The `from` field is used to specify the catalog provider. For Databricks, use `databricks:<catalog_name>`. The `catalog_name` is the name of the catalog in the Databricks Unity Catalog you want to connect to.

## `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the Databricks catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

## `params`

The following parameters are supported for configuring the connection to the Databricks Unity Catalog:

| Parameter Name        | Definition                                                                                                                                                                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                | The execution mode for querying against Databricks. `spark_connect` uses Spark Connect to query against Databricks requires a Spark cluster to be available. `delta_lake` queries directly from Delta Tables and requires the object store credentials to be provided. Default is `spark_connect`. |
| `databricks_endpoint` | The Databricks workspace endpoint, e.g. `dbc-a12cd3e4-56f7.cloud.databricks.com`                                                                                                                                                                                                                   |
| `databricks_token`    | The Databricks API token to authenticate with the Unity Catalog API. Use the [secret replacement syntax](../secret-stores/index) to reference a secret, e.g. `${secrets:my_databricks_token}`.                                                                                                  |
| `databricks_use_ssl`  | If true, use a TLS connection to connect to the Databricks endpoint. Default is `true`.                                                                                                                                                                                                            |

To locate the Databricks endpoint, do the following:

1. Log in to your Databricks workspace.
2. In the sidebar, click Compute.
3. In the list of available clusters, click the target cluster's name.
4. On the Configuration tab, expand Advanced options.
5. Click the JDBC/ODBC tab.
6. The endpoint is the Server Hostname.

## Authentication

### Personal access token

To learn more about how to set up personal access tokens, see [Databricks PAT docs](https://docs.databricks.com/aws/en/dev-tools/auth/pat).

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    include:
      - '*.my_table_name'
    params:
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
      databricks_token: ${secrets:DATABRICKS_TOKEN} # PAT
```

### Databricks service principal

Spice supports the Machine-to-Machine (M2M) OAuth flow with service principal credentials by utilizing the `databricks_client_id` and `databricks_client_secret` parameters. The runtime will automatically refresh the token.

Ensure that you grant your service principal the "Data Reader" privilege preset for the catalog and "Can Attach" cluster permissions when using Spark Connect mode.

To learn more about how to set up the service principal, see [Databricks M2M OAuth docs](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    include:
      - '*.my_table_name'
    params:
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID} # service principal client id
      databricks_client_secret: ${secrets:DATABRICKS_CLIENT_SECRET} # service principal client secret
```

## `dataset_params`

The `dataset_params` field is used to configure the dataset-specific parameters for the catalog. The following parameters are supported:

### Spark Connect parameters

| Dataset Parameter Name  | Definition                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `databricks_cluster_id` | The ID of the compute cluster in Databricks to use for the query. e.g. `1234-567890-abcde123`. |

To locate the cluster ID, do the following:

1. Log in to your Databricks workspace.
2. In the sidebar, click Compute.
3. In the list of available clusters, click the target cluster's name.
4. On the Configuration tab, expand Advanced options.
5. Click the JDBC/ODBC tab.
6. The cluster ID is the prefix of the Server Hostname.

### Delta Lake object store parameters

Configure the connection to the object store when using `mode: delta_lake`. Use the [secret replacement syntax](../secret-stores/index) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

### SQL Warehouse parameters

- `databricks_sql_warehouse_id`: The ID of the SQL Warehouse in Databricks to use for the query. e.g. `2b4e24cff378fb24`.

To locate your SQL Warehouse ID, do the following:

1. Log in to your Databricks workspace.
2. In the sidebar, click SQL -> SQL Warehouses.
3. In the list of available warehouses, click the target warehouse's name.
4. Next to the **Name** field, the ID follows the name in parentheses. For example: `My Serverless Warehouse (ID: 2b4e24cff378fb24)`

#### AWS S3

| Dataset Parameter Name             | Definition                                                               |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `databricks_aws_region`            | The AWS region for the S3 object store. E.g. `us-west-2`.                |
| `databricks_aws_access_key_id`     | The access key ID for the S3 object store.                               |
| `databricks_aws_secret_access_key` | The secret access key for the S3 object store.                           |
| `databricks_aws_endpoint`          | The endpoint for the S3 object store. E.g. `s3.us-west-2.amazonaws.com`. |

Example:

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    include:
      - '*.my_table_name'
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
    dataset_params:
      databricks_aws_region: us-west-2
      databricks_aws_access_key_id: ${secrets:aws_access_key_id}
      databricks_aws_secret_access_key: ${secrets:aws_secret_access_key}
      databricks_aws_endpoint: s3.us-west-2.amazonaws.com
```

#### Azure Blob

:::info Note
One of the following auth values must be provided for Azure Blob:

- `databricks_azure_storage_account_key`,
- `databricks_azure_storage_client_id` and `azure_storage_client_secret`, or
- `databricks_azure_storage_sas_key`.
  :::

| Dataset Parameter Name                   | Definition                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `databricks_azure_storage_account_name`  | The Azure Storage account name.                                        |
| `databricks_azure_storage_account_key`   | The Azure Storage master key for accessing the storage account.        |
| `databricks_azure_storage_client_id`     | The service principal client id for accessing the storage account.     |
| `databricks_azure_storage_client_secret` | The service principal client secret for accessing the storage account. |
| `databricks_azure_storage_sas_key`       | The shared access signature key for accessing the storage account.     |
| `databricks_azure_storage_endpoint`      | The endpoint for the Azure Blob storage account.                       |

Example:

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    include:
      - '*.my_table_name'
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
    dataset_params:
      databricks_azure_storage_account_name: myaccount
      databricks_azure_storage_account_key: ${secrets:azure_storage_account_key}
      databricks_azure_storage_endpoint: myaccount.blob.core.windows.net
```

#### Google Storage (GCS)

| Dataset Parameter Name   | Definition                                                   |
| ------------------------ | ------------------------------------------------------------ |
| `google_service_account` | Filesystem path to the Google service account JSON key file. |

Example:

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    include:
      - '*.my_table_name'
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
    dataset_params:
      databricks_google_service_account: /path/to/service-account.json
```

## Limitations

- Databricks catalog connector (mode: delta_lake) does not support reading Delta tables with the `V2Checkpoint` feature enabled. To use the Databricks catalog connector (mode: delta_lake) with such tables, drop the `V2Checkpoint` feature by executing the following command:

  ```sql
  ALTER TABLE <table-name> DROP FEATURE v2Checkpoint [TRUNCATE HISTORY];
  ```

  For more details on dropping Delta table features, refer to the official documentation: [Drop Delta table features](https://docs.databricks.com/en/delta/drop-feature.html#:~:text=Databricks%20provides%20limited%20support%20for,data%20files%20backing%20the%20table.)

- The Databricks Catalog Connector (`mode: spark_connect`) does not yet support streaming query results from Spark.

:::warning[Memory Considerations]

When using the Databricks (mode: delta_lake) Catalog connector without acceleration, data is loaded into memory during query execution. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

:::
