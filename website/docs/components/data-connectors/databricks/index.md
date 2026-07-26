---
title: 'Databricks Data Connector'
sidebar_label: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
pagination_prev: null
tags:
  - data-connectors
  - databricks
  - delta-lake
---

Databricks as a connector for federated SQL query against Databricks using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html), directly from [Delta Lake](https://delta.io/) tables, or using the [SQL Statement Execution API](https://docs.databricks.com/aws/en/dev-tools/sql-execution-tutorial).

```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table # A reference to a table in the Databricks unity catalog
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

:::info
Unquoted identifiers are normalized to lowercase. To reference a table, schema, or catalog with mixed-case characters, wrap each case-sensitive part in double quotes: `databricks:my_catalog."MySchema"."MyTable"`. See [Identifier Case Sensitivity](../index.md#identifier-case-sensitivity-and-quoting).
:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table
    name: cool_dataset
    params: ...
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

Use the [secret replacement syntax](../secret-stores/) to reference a secret, e.g. `${secrets:my_token}`.

| Parameter Name                | Description                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                        | The execution mode for querying against Databricks. The default is `spark_connect`. Possible values:<br /> <ul><li>`spark_connect`: Use Spark Connect to query against Databricks. Requires a Spark cluster to be available.</li><li>`delta_lake`: Query directly from Delta Tables. Requires the object store credentials to be provided.</li><li>`sql_warehouse`: Use the SQL Statement Execution API to query against a Databricks SQL Warehouse.</li></ul> |
| `databricks_endpoint`         | The endpoint of the Databricks instance. Required for all modes.                                                                                                                                                                                                                                                                                     |
| `databricks_sql_warehouse_id` | The ID of the SQL Warehouse in Databricks to use for the query. Only valid when `mode` is `sql_warehouse`.                                                                                                                                                                                                                                           |
| `databricks_cluster_id`       | The ID of the compute cluster in Databricks to use for the query. Only valid when `mode` is `spark_connect`.                                                                                                                                                                                                                                         |
| `databricks_credential_vending` | When set to `enabled` (requires `mode` to be `delta_lake`), short-lived storage credentials for each table are fetched from the Unity Catalog credential vending API instead of using static object store credentials. Possible values: `enabled`, `disabled`. Defaults to `disabled`.                                                              |
| `databricks_use_ssl`          | If true, use a TLS connection to connect to the Databricks Spark Connect endpoint. Only valid when `mode` is `spark_connect`. Default is `true`.                                                                                                                                                                                                                                                              |
| `client_timeout`              | Optional. Specifies timeout for HTTP operations. In `delta_lake` mode, applies to object store operations. In `sql_warehouse` mode, applies per-HTTP-call (statement submit, status poll, chunk fetch) — not total query duration. Default: `30s`. E.g. `client_timeout: 2m` |
| `connect_timeout`             | Optional. Timeout for establishing TCP/TLS connections. Applies in `sql_warehouse` mode. Default: `10s`. E.g. `connect_timeout: 15s`                                                                                                                   |
| `databricks_token`            | The Databricks API token to authenticate with the Unity Catalog API. Can't be used with `databricks_client_id` and `databricks_client_secret`.                                                                                                                                                                                                       |
| `databricks_client_id`        | The Databricks OAuth client ID. Used with `databricks_client_secret` for service-principal (M2M) auth, or alone for interactive User-to-Machine (U2M) auth. Can't be used with `databricks_token`.                                                                                                                                                   |
| `databricks_client_secret`    | The Databricks Service Principal Client Secret. Required for M2M auth; omit for U2M auth. Can't be used with `databricks_token`.                                                                                                                                                                                                                     |

#### SQL Warehouse tuning

The following parameters apply only when `mode` is `sql_warehouse` and control connection resilience and concurrency:

| Parameter Name               | Description                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `connect_timeout`            | Optional. Timeout for establishing TCP/TLS connections to the Databricks API. Default: `10s`. E.g. `connect_timeout: 15s`     |
| `client_timeout`             | Optional. Per-HTTP-call timeout (statement submit, status poll, chunk fetch) — not total query duration. Overall query time is bounded by `statement_max_retries` × backoff. Default: `30s`. E.g. `client_timeout: 2m` |
| `max_concurrent_requests`    | Optional. Maximum number of concurrent HTTP requests to the SQL Warehouse API. Default: `8`.                                  |
| `http_max_retries`           | Optional. Maximum number of HTTP-level retries for transient failures (429, 5xx). Default: `3`.                               |
| `backoff_method`             | Optional. Backoff strategy for transient HTTP retries. Options: `fibonacci`, `exponential`. Default: `fibonacci`.              |
| `statement_max_retries`      | Optional. Maximum number of poll retries when waiting for async statement completion. Default: `14`.                           |
| `disable_on_permanent_error` | Optional. When `true`, non-retryable errors (401, 403, 404) permanently disable the connector. Default: `true`.               |

#### Rate control

The Databricks connector supports per-dataset rate control parameters when `mode` is `spark_connect` or `sql_warehouse`. These override [`runtime.params`](../../reference/spicepod/runtime#runtimeparams) HTTP rate control defaults. When [`runtime.source_rate_control.state_location`](../../reference/spicepod/runtime#runtimesource_rate_control) is configured, rate limits are coordinated across the cluster.

| Parameter Name              | Description                                                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requests_per_second_limit` | Optional. Maximum HTTP requests per second to the Databricks endpoint. Overrides `runtime.params.http_requests_per_second_limit`.                                |
| `requests_per_minute_limit` | Optional. Maximum HTTP requests per minute to the Databricks endpoint. Overrides `runtime.params.http_requests_per_minute_limit`.                                |
| `rate_control_jitter_min`   | Optional. Minimum random delay before HTTP requests when rate control is active. Defaults to `5ms` when a rate limit is configured. Accepts durations like `5ms`. |
| `rate_control_jitter_max`   | Optional. Maximum random delay before HTTP requests when rate control is active. Defaults to `10ms` when a rate limit is configured. Accepts durations like `10ms`. |

## Authentication

### Personal access token

To learn more about how to set up personal access tokens, see [Databricks PAT docs](https://docs.databricks.com/aws/en/dev-tools/auth/pat).

```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table
    name: my_awesome_table
    params:
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_cluster_id: 1234-567890-abcde123
      databricks_token: ${secrets:DATABRICKS_TOKEN} # PAT
```

### Databricks service principal

Spice supports the Machine-to-Machine (M2M) OAuth flow with service principal credentials by utilizing the `databricks_client_id` and `databricks_client_secret` parameters. The runtime will automatically refresh the token.

Ensure that you grant your service principal the "Data Reader" privilege preset for the catalog and "Can Attach" cluster permissions when using Spark Connect mode.

To Learn more about how to set up the service principal, see [Databricks M2M OAuth docs](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table
    name: my_awesome_table
    params:
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_cluster_id: 1234-567890-abcde123
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID} # service principal client id
      databricks_client_secret: ${secrets:DATABRICKS_CLIENT_SECRET} # service principal client secret
```

### User-to-Machine (U2M) OAuth

Spice supports the User-to-Machine (U2M) OAuth flow for interactive sign-in against Databricks. To use U2M auth, supply only `databricks_client_id` (without `databricks_token` or `databricks_client_secret`).

When U2M auth is configured, the connector defers initialization until first use. On the first query the runtime opens a browser to complete the Databricks OAuth sign-in, then caches and refreshes the resulting token for subsequent requests.

To learn more about how to set up U2M OAuth, see the [Databricks U2M OAuth docs](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-u2m).

:::note
U2M auth is supported with `mode: delta_lake` and `mode: sql_warehouse`. It is not supported with `mode: spark_connect` — use a personal access token or service principal credentials when querying through Spark Connect.
:::

```yaml
datasets:
  - from: databricks:spiceai.datasets.my_awesome_table
    name: my_awesome_table
    params:
      mode: sql_warehouse
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_sql_warehouse_id: 2b4e24cff378fb24
      databricks_client_id: ${secrets:DATABRICKS_CLIENT_ID} # OAuth app client id
```

## Delta Lake object store parameters

Configure the connection to the object store when using `mode: delta_lake`. Use the [secret replacement syntax](../secret-stores/) to reference a secret, e.g. `${secrets:aws_access_key_id}`.

### AWS S3

| Parameter Name                     | Description                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `databricks_aws_region`            | Optional. The AWS region for the S3 object store. E.g. `us-west-2`.                            |
| `databricks_aws_access_key_id`     | The access key ID for the S3 object store.                                                     |
| `databricks_aws_secret_access_key` | The secret access key for the S3 object store.                                                 |
| `databricks_aws_session_token`     | Optional. The AWS session token for the S3 object store. Required with temporary (STS) credentials. |
| `databricks_aws_endpoint`          | Optional. The endpoint for the S3 object store. E.g. `s3.us-west-2.amazonaws.com`.             |
| `databricks_aws_allow_http`        | Optional. Enables insecure HTTP connections to `databricks_aws_endpoint`. Defaults to `false`. |

### Azure Blob

:::info Note
**One** of the following auth values must be provided for Azure Blob:

- `databricks_azure_storage_account_key`,
- `databricks_azure_storage_client_id` and `databricks_azure_storage_client_secret`, or
- `databricks_azure_storage_sas_key`.
  :::

| Parameter Name                           | Description                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `databricks_azure_storage_account_name`  | The Azure Storage account name.                                        |
| `databricks_azure_storage_account_key`   | The Azure Storage key for accessing the storage account.               |
| `databricks_azure_storage_client_id`     | The Service Principal client ID for accessing the storage account.     |
| `databricks_azure_storage_client_secret` | The Service Principal client secret for accessing the storage account. |
| `databricks_azure_storage_sas_key`       | The shared access signature key for accessing the storage account.     |
| `databricks_azure_storage_endpoint`      | Optional. The endpoint for the Azure Blob storage account.             |

### Google Storage (GCS)

| Parameter Name           | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `databricks_google_service_account` | Filesystem path to the Google service account JSON key file. |

## Examples

### Spark Connect

```yaml
- from: databricks:spiceai.datasets.my_spark_table # A reference to a table in the Databricks unity catalog
  name: my_delta_lake_table
  params:
    mode: spark_connect
    databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
    databricks_cluster_id: 1234-567890-abcde123
    databricks_token: ${secrets:my_token}
```

### SQL Warehouse

```yaml
- from: databricks:spiceai.datasets.my_table # A reference to a table in the Databricks unity catalog
  name: my_table
  params:
    mode: sql_warehouse
    databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
    databricks_sql_warehouse_id: 2b4e24cff378fb24
    databricks_token: ${secrets:my_token}
```

### Delta Lake (S3)

```yaml
- from: databricks:spiceai.datasets.my_delta_table # A reference to a table in the Databricks unity catalog
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
- from: databricks:spiceai.datasets.my_adls_table # A reference to a table in the Databricks unity catalog
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
- from: databricks:spiceai.datasets.my_gcp_table # A reference to a table in the Databricks unity catalog
  name: my_delta_lake_table
  params:
    mode: delta_lake
    databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
    databricks_token: ${secrets:my_token}
    databricks_google_service_account: /path/to/service-account.json
```

## Types

### mode: delta_lake

The table below shows the Databricks (mode: delta_lake) data types supported, along with the type mapping to Apache Arrow types in Spice.

| Databricks SQL Type | Arrow Type                            |
| ------------------- | ------------------------------------- |
| `STRING`            | `Utf8`                                |
| `BIGINT`            | `Int64`                               |
| `INT`               | `Int32`                               |
| `SMALLINT`          | `Int16`                               |
| `TINYINT`           | `Int8`                                |
| `FLOAT`             | `Float32`                             |
| `DOUBLE`            | `Float64`                             |
| `BOOLEAN`           | `Boolean`                             |
| `BINARY`            | `Binary`                              |
| `DATE`              | `Date32`                              |
| `TIMESTAMP`         | `Timestamp(Microsecond, Some("UTC"))` |
| `TIMESTAMP_NTZ`     | `Timestamp(Microsecond, None)`        |
| `DECIMAL`           | `Decimal128`                          |
| `ARRAY`             | `List`                                |
| `STRUCT`            | `Struct`                              |
| `MAP`               | `Map`                                 |

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Limitations

- Databricks connector (mode: delta_lake) does not support reading Delta tables with the `V2Checkpoint` feature enabled. To use the Databricks connector (mode: delta_lake) with such tables, drop the `V2Checkpoint` feature by executing the following command:

  ```sql
  ALTER TABLE <table-name> DROP FEATURE v2Checkpoint [TRUNCATE HISTORY];
  ```

  For more details on dropping Delta table features, refer to the official documentation: [Drop Delta table features](https://docs.databricks.com/en/delta/drop-feature.html#:~:text=Databricks%20provides%20limited%20support%20for,data%20files%20backing%20the%20table.)

- When using `mode: spark_connect`, correlated scalar subqueries can only be used in filters, aggregations, projections, and UPDATE/MERGE/DELETE commands. [Spark Docs](https://spark.apache.org/docs/latest/sql-error-conditions-unsupported-subquery-expression-category-error-class.html#unsupported_correlated_scalar_subquery)

:::warning[Memory Considerations]

When using the Databricks (mode: delta_lake) Data connector without acceleration, data is loaded into memory during query execution. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

Memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](../data-accelerators/duckdb) and [`sqlite`](../data-accelerators/sqlite) accelerators by specifying `mode: file`.

- The Databricks Connector (`mode: spark_connect`) does not yet support streaming query results from Spark.

:::

## Cookbook

- A cookbook recipe to configure Databricks as a data connector in Spice. [Spice on Databricks](https://github.com/spiceai/cookbook/tree/trunk/databricks)
