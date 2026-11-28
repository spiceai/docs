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

## `exclude`

Optional. Use the `exclude` field to omit tables that would otherwise be included. It is matched against the same table name as `include`, using the same glob syntax, and multiple `exclude` patterns are OR'ed together. `exclude` takes precedence over `include`: a table is registered only when it matches `include` (or no `include` is set) **and** matches no `exclude` pattern.

## `params`

The following parameters are supported for configuring the connection to the Databricks Unity Catalog:

| Parameter Name        | Definition                                                                                                                                                                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                | The execution mode for querying against Databricks. `spark_connect` uses Spark Connect to query against Databricks requires a Spark cluster to be available. `delta_lake` queries directly from Delta Tables and requires the object store credentials to be provided. Default is `spark_connect`. |
| `databricks_endpoint` | The Databricks workspace endpoint, e.g. `dbc-a12cd3e4-56f7.cloud.databricks.com`                                                                                                                                                                                                                   |
| `databricks_token`    | The Databricks API token to authenticate with the Unity Catalog API. Use the [secret replacement syntax](../secret-stores) to reference a secret, e.g. `${secrets:my_databricks_token}`.                                                                                                           |
| `databricks_oidc_token_filepath` | A file that holds the workload's identity token, read again for every exchange, such as a Kubernetes projected service account token. With `databricks_client_id`, the catalog authenticates with [workload identity federation](#workload-identity-federation). Can't be used with `databricks_token_audience`. |
| `databricks_token_audience` | The audience of the identity token Spice requests from a GitHub Actions job, such as the Databricks account ID. With `databricks_client_id`, the catalog authenticates with [workload identity federation](#workload-identity-federation). Can't be used with `databricks_oidc_token_filepath`. |
| `databricks_use_ssl`  | If true, use a TLS connection to connect to the Databricks endpoint. Default is `true`.                                                                                                                                                                                                            |
| `databricks_auth_mode` | Optional. Pins the authentication flow instead of inferring it from the credentials that are set. One of `auto`, `token`, `m2m`, `u2m` (case-insensitive). Defaults to `auto`. See [Pinning the authentication mode](#pinning-the-authentication-mode).                                            |
| `databricks_credential_vending` | Optional. When set to `enabled`, the catalog fetches short-lived storage credentials for each table from the Unity Catalog credential vending API, rather than from the [Delta Lake object store parameters](#delta-lake-object-store-parameters). Requires `mode: delta_lake`. One of `enabled`, `disabled`. Defaults to `disabled`. Any other value, or `enabled` with another `mode`, fails the catalog with an error. Vending is not exclusive: when it fails while Spice opens a table, for example because Unity Catalog refuses to vend credentials, Spice logs a warning that contains `falling back to configured storage credentials` and reads the table with the configured storage credentials instead. After a table is open, a failure to renew its vended credentials fails the read and does not fall back. |

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

### Workload identity federation

The catalog can authenticate as a service principal with the identity token its platform gives it, so no Databricks token or client secret is stored. Set `databricks_client_id` to the service principal's application ID, and set either `databricks_oidc_token_filepath` or, in a GitHub Actions job, `databricks_token_audience`. See [workload identity federation](../data-connectors/databricks#workload-identity-federation) for the federation policy the service principal needs and how Spice renews the token.

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    include:
      - '*.my_table_name'
    params:
      mode: sql_warehouse
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID} # service principal application id
      databricks_oidc_token_filepath: /var/run/secrets/tokens/databricks
    dataset_params:
      databricks_sql_warehouse_id: 2b4e24cff378fb24
```

Federation authenticates requests to Databricks, not reads from object storage. For `delta_lake` mode, see the [object store parameters](#delta-lake-object-store-parameters).

### Pinning the authentication mode

By default (`databricks_auth_mode: auto`) the catalog connector infers the flow from whichever credentials resolve: a `databricks_token` alone selects personal access token, `databricks_client_id` alone selects U2M, `databricks_client_id` together with `databricks_client_secret` selects M2M, and `databricks_client_id` together with `databricks_oidc_token_filepath` or `databricks_token_audience` selects [workload identity federation](#workload-identity-federation).

Credentials do not only come from the Spicepod. `databricks_token`, `databricks_client_secret`, and the other secret parameters are auto-loaded from the [secret stores](../secret-stores) and the environment (e.g. `DATABRICKS_CLIENT_SECRET`, `SPICE_DATABRICKS_CLIENT_SECRET`) when the Spicepod omits them — so an ambient client secret on the host is enough to switch a U2M catalog to machine-to-machine, which then fails with a service principal `401`.

Set `databricks_auth_mode` to pin the flow. A pinned mode ignores the credentials the flow does not use:

| Value            | Flow                              | Requires                                           |
| ---------------- | --------------------------------- | -------------------------------------------------- |
| `auto` (default) | Inferred from the credentials set | —                                                  |
| `token`          | Personal access token             | `databricks_token`                                 |
| `m2m`            | Service principal (M2M) OAuth     | `databricks_client_id`, `databricks_client_secret` |
| `u2m`            | User-to-machine OAuth             | `databricks_client_id`                             |

Values are matched case-insensitively, so `M2M` and `U2M` are also accepted. A required parameter that is missing for the pinned mode fails at load with an error naming it; an unrecognized value is rejected.

```yaml
catalogs:
  - from: databricks:my_uc_catalog
    name: uc_catalog
    params:
      databricks_endpoint: dbc-a12cd3e4-56f7.cloud.databricks.com
      databricks_auth_mode: m2m # ignore any ambient databricks_token
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID}
      databricks_client_secret: ${secrets:DATABRICKS_CLIENT_SECRET}
```

### User-to-Machine (U2M) OAuth

A catalog that uses U2M auth, with `databricks_client_id` alone or `databricks_auth_mode: u2m`, is not loaded at startup. It loads on the first request that carries a user's Databricks token for the catalog's client ID, and that request is matched by the client ID the parameter resolves to, so `databricks_client_id` can be a literal or a reference such as `${secrets:DATABRICKS_CLIENT_ID}`.

U2M requires `mode: delta_lake` or `mode: sql_warehouse`, which use the token of each request. A Spark Connect session keeps the token it was built with, so a U2M catalog in `mode: spark_connect`, the default mode, is a configuration error at startup:

```
User-to-machine (U2M) authentication requires 'mode' to be 'delta_lake' or 'sql_warehouse'. For details, visit: https://spiceai.org/docs/components/catalogs/databricks#params
```

When a load fails, for example because Databricks refuses the request's token, the request logs a warning with the error, and the catalog is loaded again on a later request. A configuration error removes the catalog and sets its status to error.

In v2.4.x and earlier, a load that failed lost the catalog until the runtime restarted, with no log line, a catalog whose client ID was given as a reference never loaded, and a U2M catalog in `spark_connect` mode was deferred and never loaded.

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

Configure the connection to the object store when using `mode: delta_lake`. Use the [secret replacement syntax](../secret-stores) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

### SQL Warehouse parameters

- `databricks_sql_warehouse_id`: The ID of the SQL Warehouse in Databricks to use for the query. e.g. `2b4e24cff378fb24`.

To locate your SQL Warehouse ID, do the following:

1. Log in to your Databricks workspace.
2. In the sidebar, click SQL -> SQL Warehouses.
3. In the list of available warehouses, click the target warehouse's name.
4. Next to the **Name** field, the ID follows the name in parentheses. For example: `My Serverless Warehouse (ID: 2b4e24cff378fb24)`

#### SQL Warehouse connection tuning

The following parameters control resilience and concurrency for the SQL Statement Execution API when using `mode: sql_warehouse`:

| Parameter Name               | Description                                                                                                                         | Default      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `connect_timeout`            | Timeout for establishing TCP/TLS connections to the Databricks API. Accepts durations like `10s`.                                   | `10s`        |
| `client_timeout`             | Per-HTTP-call timeout (statement submit, status poll, chunk fetch). Set to the longest expected single call, not total query duration. Accepts durations like `30s` or `2m`. | `30s`        |
| `max_concurrent_requests`    | Maximum number of concurrent HTTP requests to the SQL Warehouse API.                                                                | `8`          |
| `http_max_retries`           | Maximum number of HTTP-level retries for transient failures (429, 5xx).                                                             | `3`          |
| `backoff_method`             | Backoff strategy for transient HTTP retries. Options: `fibonacci`, `exponential`.                                                   | `fibonacci`  |
| `statement_max_retries`      | Maximum number of poll retries when waiting for async statement completion.                                                          | `14`         |
| `disable_on_permanent_error` | When `true`, non-retryable errors (401, 403, 404) permanently disable the connector to prevent a thundering herd of failed requests. | `true`       |

### Request rate control

The following parameters limit the rate of HTTP requests the catalog sends to the Databricks endpoint. One rate limit is shared by the catalog's Unity Catalog API requests and, in `mode: sql_warehouse`, its SQL Statement Execution API requests. Each parameter overrides the matching `runtime.params.http_*` setting. Set them in `params` or `dataset_params`.

| Parameter Name                 | Description                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requests_per_second_limit`    | Optional. Maximum HTTP requests per second to the Databricks endpoint. Overrides `runtime.params.http_requests_per_second_limit`.                                             |
| `requests_per_minute_limit`    | Optional. Maximum HTTP requests per minute to the Databricks endpoint. Overrides `runtime.params.http_requests_per_minute_limit`.                                             |
| `rate_control_jitter_min`      | Optional. Minimum random delay before HTTP requests when rate control is active. Defaults to `5ms` when a request-rate limit is configured, otherwise `0ms`. Accepts durations like `5ms`.   |
| `rate_control_jitter_max`      | Optional. Maximum random delay before HTTP requests when rate control is active. Defaults to `10ms` when a request-rate limit is configured, otherwise `0ms`. Accepts durations like `10ms`. |
| `rate_control_acquire_timeout` | Optional. Maximum time an HTTP request waits for rate-control capacity before it fails. Overrides `runtime.params.http_rate_control_acquire_timeout`. Defaults to `client_timeout`. `0` waits without a bound. Accepts durations like `30s`. |

### Delta Lake parameters

- `client_timeout`: HTTP client request timeout. In `delta_lake` mode, applies to the object store client. In `sql_warehouse` mode, applies per-HTTP-call. Accepts durations like `30s` or `5m`. Default: `30s`.

#### AWS S3

| Dataset Parameter Name             | Definition                                                               |
| ---------------------------------- | ------------------------------------------------------------------------ |
| `databricks_aws_region`            | The AWS region for the S3 object store. E.g. `us-west-2`.                |
| `databricks_aws_access_key_id`     | The access key ID for the S3 object store.                               |
| `databricks_aws_secret_access_key` | The secret access key for the S3 object store.                           |
| `databricks_aws_session_token`     | Optional. The AWS session token for the S3 object store. Required with temporary (STS) credentials. |
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
- `databricks_azure_storage_client_id` and `databricks_azure_storage_client_secret`, or
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
| `databricks_google_service_account` | Filesystem path to the Google service account JSON key file. |

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

- In `mode: delta_lake`, the catalog does not register a [catalog-managed Delta table](https://github.com/delta-io/delta/blob/master/PROTOCOL.md#catalog-managed-tables), a table with a `delta.feature.catalogManaged` or `delta.feature.catalogOwned` property, because Databricks does not permit reading such a table directly from storage. Queries against the table do not resolve, and the runtime logs a warning for each skipped table that `include` and `exclude` select. The warning contains:

  ```text
  Table '<catalog>.<schema>.<table>' is a catalog-managed Delta table and is not registered, so queries against it will not resolve. Databricks does not allow reading it directly from storage; use a catalog `mode` other than `delta_lake`.
  ```

  To query these tables, use `mode: sql_warehouse` or `mode: spark_connect`. In v2.4.x and earlier, reading such a table failed with a Delta Lake reader error.

- In `mode: delta_lake`, the catalog reads a table only when its storage location is in object storage, with one of the schemes `s3`, `s3a`, `abfss`, `abfs`, `az`, `azure`, `wasbs`, `wasb`, or `gs`. It does not register a table at any other location, such as a `file://` URL or a bare path, and logs a warning such as:

  ```text
  Table '<catalog>.<schema>.<table>' is not registered, so queries against it will not resolve: its storage location uses the 'file' scheme, and catalog tables are only read from object storage (s3, s3a, abfss, abfs, az, azure, wasbs, wasb, gs).
  ```

  `mode: sql_warehouse` and `mode: spark_connect` read through Databricks and do not check the storage location. In v2.4.3 and earlier, a table at a local location was read from the Spice host's filesystem.

:::warning[Memory Considerations]

When using the Databricks (mode: delta_lake) Catalog connector without acceleration, data is loaded into memory during query execution. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

:::

## Cookbook

- A cookbook recipe to configure Databricks Unity Catalog as a catalog connector in Spice. [Databricks Unity Catalog Connector](https://github.com/spiceai/cookbook/tree/trunk/catalogs/databricks#readme)
