---
title: 'ADBC Data Connector'
sidebar_label: 'ADBC Data Connector'
description: 'ADBC Data Connector Documentation'
pagination_prev: null
---

[ADBC](https://arrow.apache.org/adbc/) (Arrow Database Connectivity) is a columnar, minimal-overhead alternative to JDBC/ODBC for analytical data access. It transfers data using [Apache Arrow](https://arrow.apache.org/), avoiding serialization overhead between the database driver and Spice.

The ADBC data connector dynamically loads any ADBC-compatible driver at runtime and provides federated SQL query access through a managed connection pool. It supports both read and write operations, and pushes filters, projections, and limits down to the source database.

Drivers are available for [BigQuery](https://docs.adbc-drivers.org/drivers/bigquery/index.html), [Trino](https://docs.adbc-drivers.org/drivers/trino/index.html), [Snowflake](https://docs.adbc-drivers.org/drivers/snowflake/index.html), [Amazon Redshift](https://docs.adbc-drivers.org/drivers/redshift/index.html), [Databricks](https://docs.adbc-drivers.org/drivers/databricks/index.html), and more. See [ADBC Driver Foundry](https://docs.adbc-drivers.org/) for the full list.

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project"
      adbc_driver_options: >-
        adbc.bigquery.sql.dataset_id=my_dataset
```

## Prerequisites

An ADBC-compatible driver must be installed on the system where Spice runs. Spice loads the driver shared library by name (e.g., `bigquery`, `trino`, `snowflake`, `redshift`) or by an explicit file path.

The recommended way to install drivers is with [`dbc`](https://docs.columnar.tech/dbc/), the command-line tool for installing and managing ADBC drivers:

```shell
# Install dbc
curl -LsSf https://dbc.columnar.tech/install.sh | sh

# Install drivers
dbc install bigquery
dbc install trino
dbc install redshift
```

See the [`dbc` documentation](https://docs.columnar.tech/dbc/) for other installation methods (pip, Homebrew, Windows MSI) and platform support.

Spice includes built-in SQL dialect support for BigQuery, translating federated queries into BigQuery-compatible SQL automatically.

## Configuration

### `from`

The `from` field takes the form `adbc:table_name`, where `table_name` is the name of the table to read from the connected database.

Table name casing depends on the source database. For example, Snowflake uses uppercase table names by default, while BigQuery and Trino use lowercase. When `adbc_catalog` and `adbc_schema` are not set, fully qualified names can be specified in the `from` field.

### `name`

The dataset name, used as the table name within Spice.

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project"
      adbc_driver_options: >-
        adbc.bigquery.sql.dataset_id=my_dataset
```

```sql
SELECT COUNT(*) FROM my_table;
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

| Parameter Name             | Description                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `adbc_driver`              | Required. The ADBC driver name (e.g., `bigquery`, `trino`, `snowflake`, `redshift`).                                                 |
| `adbc_uri`                 | Required. Database URI or connection string for the ADBC driver. In-memory URIs (e.g., `:memory:`) are not supported.                |
| `adbc_driver_path`         | Optional. Absolute path to the ADBC driver shared library. When omitted, the driver is loaded by name from the system library path.  |
| `adbc_username`            | Optional. Username for database authentication. Supports [Secrets Stores](../secret-stores/).                                        |
| `adbc_password`            | Optional. Password for database authentication. Supports [Secrets Stores](../secret-stores/).                                        |
| `adbc_driver_options`      | Optional. Semicolon-delimited key-value pairs of driver-specific options. See [Driver Options](#driver-options-adbc_driver_options). |
| `adbc_catalog`             | Optional. Sets the default catalog for the connection.                                                                               |
| `adbc_schema`              | Optional. Sets the default schema for the connection.                                                                                |
| `connection_pool_size`     | Optional. Maximum number of connections in the connection pool. Default: `5`.                                                        |
| `connection_pool_min_idle` | Optional. Minimum number of idle connections in the pool. Default: `1`.                                                              |

:::warning[In-memory databases]
In-memory database URIs (e.g., `:memory:` or URIs containing `mode=memory`) are not supported.
:::

### Driver Options (`adbc_driver_options`)

The `adbc_driver_options` parameter passes driver-specific configuration as semicolon-delimited `key=value` pairs. Each key is automatically prefixed with `adbc.` if it does not already start with that prefix.

For example, the following two configurations are equivalent:

```yaml
# Without adbc. prefix (prefix is added automatically)
adbc_driver_options: bigquery.sql.project_id=my-project;bigquery.sql.dataset_id=my_dataset

# With explicit adbc. prefix
adbc_driver_options: adbc.bigquery.sql.project_id=my-project;adbc.bigquery.sql.dataset_id=my_dataset
```

Trailing semicolons are permitted. Entries without an `=` sign or with an empty key are ignored.

For multi-line readability, use YAML's `>-` folded block scalar:

```yaml
adbc_driver_options: >-
  adbc.bigquery.sql.project_id=my-project;
  adbc.bigquery.sql.dataset_id=my_dataset
```

Driver-specific options are documented at [ADBC Driver Foundry](https://docs.adbc-drivers.org/).

#### BigQuery Driver Options

The [BigQuery ADBC driver](https://docs.adbc-drivers.org/drivers/bigquery/index.html) accepts the following commonly-used options through `adbc_driver_options`.

| Option Key                           | Description                                                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `adbc.bigquery.sql.project_id`       | The Google Cloud project ID.                                                                                                              |
| `adbc.bigquery.sql.dataset_id`       | The BigQuery dataset ID.                                                                                                                  |
| `adbc.bigquery.sql.auth_type`        | Authentication type. `0` = Application Default Credentials (default), `1` = service account JSON file, `2` = service account JSON string. |
| `adbc.bigquery.sql.auth_credentials` | Path to the service account JSON file (when `auth_type=1`) or the JSON string (when `auth_type=2`).                                       |

BigQuery also supports connection string URIs as the `adbc_uri` value:

```
bigquery:///my-project-123
bigquery:///my-project-123?OAuthType=1&AuthCredentials=/path/to/key.json
bigquery:///my-project-123?DatasetId=analytics&Location=US
```

See the [BigQuery ADBC driver documentation](https://docs.adbc-drivers.org/drivers/bigquery/index.html) for the full reference.

#### Trino Driver Options

The [Trino ADBC driver](https://docs.adbc-drivers.org/drivers/trino/index.html) uses a connection string URI as the `adbc_uri` value:

```
trino://[user[:password]@]host[:port][/catalog[/schema]][?param=value&...]
```

Examples:

```
trino://trino.example.com:8080/hive/default
trino://user:pass@trino.example.com:8443/postgresql/public?SSL=true
trino://user@localhost:8443/memory/default?SSLVerification=NONE
```

By default, connections use HTTPS. Add `SSL=false` to use HTTP. For self-signed certificates, add `SSLVerification=NONE`.

See the [Trino ADBC driver documentation](https://docs.adbc-drivers.org/drivers/trino/index.html) for the full reference.

### Catalog and Schema

The `adbc_catalog` and `adbc_schema` parameters set connection-level defaults that apply to all queries on the connection. These map to the ADBC standard connection options `adbc.connection.catalog` and `adbc.connection.db_schema`.

How these map to source database concepts varies by driver:

| Driver    | `adbc_catalog`     | `adbc_schema`         |
| --------- | ------------------ | --------------------- |
| BigQuery  | GCP project ID     | BigQuery dataset      |
| Trino     | Trino catalog      | Schema within catalog |
| Redshift  | Redshift database  | Redshift schema       |
| Snowflake | Snowflake database | Snowflake schema      |

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project"
      adbc_catalog: my-gcp-project
      adbc_schema: my_dataset
```

### Connection Pooling

The ADBC connector maintains a pool of database connections for concurrent query execution. The pool is configured with:

- `connection_pool_size`: The maximum number of connections. Increase for workloads with many concurrent queries.
- `connection_pool_min_idle`: The minimum number of idle connections kept open to reduce connection setup latency.

Both values must be positive integers. A `connection_pool_min_idle` greater than `connection_pool_size` is coerced to `connection_pool_size`.

### Query Pushdown

The ADBC connector pushes SQL operations down to the source database when possible, reducing the amount of data transferred:

- **Filter pushdown**: `WHERE` clauses are pushed to the source.
- **Projection pushdown**: Only the columns referenced in the query are fetched.
- **Limit pushdown**: `LIMIT` clauses are applied at the source.

No special configuration is required. Pushdown happens automatically when the source database supports the operation.

## Auth

Authentication varies by driver. Credentials can be provided through `adbc_username`, `adbc_password`, `adbc_driver_options`, the connection URI, or through [Secrets Stores](../secret-stores/).

For BigQuery, authentication typically uses Google Cloud Application Default Credentials or a service account JSON file passed through `adbc_driver_options`.

For Trino, credentials are embedded in the connection URI (`trino://user:pass@host/catalog`).

For drivers that accept `adbc_username` and `adbc_password` (e.g., Redshift, Snowflake), these can be set through environment variables:

```bash
SPICE_SECRET_ADBC_USERNAME=myuser \
SPICE_SECRET_ADBC_PASSWORD=mypassword \
spice run
```

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: redshift
      adbc_uri: "redshift://my-cluster.region.redshift.amazonaws.com:5439/dev"
      adbc_username: ${secrets:ADBC_USERNAME}
      adbc_password: ${secrets:ADBC_PASSWORD}
```

## Examples

### BigQuery

Connect to a BigQuery table using Application Default Credentials. Spice translates federated queries into BigQuery-compatible SQL automatically.

```shell
# Install the driver
dbc install bigquery

# Authenticate with Google Cloud
gcloud auth application-default login
```

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project?DatasetId=my_dataset"
```

#### BigQuery with Service Account

Authenticate with a service account JSON key file:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project?OAuthType=1&AuthCredentials=/path/to/service-account.json"
      adbc_catalog: my-gcp-project
      adbc_schema: my_dataset
```

Or equivalently, using `adbc_driver_options`:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project"
      adbc_catalog: my-gcp-project
      adbc_schema: my_dataset
      adbc_driver_options: >-
        adbc.bigquery.sql.auth_type=1;
        adbc.bigquery.sql.auth_credentials=/path/to/service-account.json
```

### Trino

Connect to a Trino cluster:

```shell
dbc install trino
```

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: trino
      adbc_uri: "trino://trino.example.com:8080/hive/default?SSL=false"
```

#### Trino with Authentication

Connect over HTTPS with HTTP Basic authentication:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: trino
      adbc_uri: "trino://user:${secrets:TRINO_PASSWORD}@trino.example.com:8443/hive/default"
      connection_pool_size: 10
```

For self-signed certificates, add `SSLVerification=NONE`:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: trino
      adbc_uri: "trino://user@trino.internal:8443/hive/default?SSLVerification=NONE"
```

### Amazon Redshift

Connect to a Redshift Provisioned cluster:

```shell
dbc install redshift
```

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: redshift
      adbc_uri: "redshift://admin:${secrets:REDSHIFT_PASSWORD}@my-cluster.region.redshift.amazonaws.com:5439/dev"
```

#### Redshift Serverless with IAM

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: redshift
      adbc_uri: "redshift:///dev?cluster_type=redshift-serverless&workgroup_name=my-workgroup"
```

### Custom Driver Path

When the ADBC driver shared library is not on the system library path (e.g., not installed via `dbc`), specify its location with `adbc_driver_path`:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_driver_path: /opt/drivers/libadbc_driver_bigquery.so
      adbc_uri: "bigquery:///my-gcp-project?DatasetId=my_dataset"
```
