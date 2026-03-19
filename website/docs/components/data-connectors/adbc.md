---
title: 'ADBC Data Connector'
sidebar_label: 'ADBC Data Connector'
description: 'ADBC Data Connector Documentation'
pagination_prev: null
---

[ADBC](https://arrow.apache.org/adbc/) (Arrow Database Connectivity) is a columnar, minimal-overhead alternative to JDBC/ODBC for analytical data access. It transfers data using [Apache Arrow](https://arrow.apache.org/), avoiding serialization overhead between the database driver and Spice.

The ADBC data connector dynamically loads any ADBC-compatible driver at runtime and provides federated SQL query access through a managed connection pool. It currently supports read-only operations, and pushes filters, projections, and limits down to the source database.

```yaml
datasets:
  - from: adbc:MY_TABLE
    name: my_table
    params:
      adbc_driver: snowflake
      adbc_uri: ${secrets:SNOWFLAKE_URI}
      adbc_username: ${secrets:SNOWFLAKE_USERNAME}
      adbc_password: ${secrets:SNOWFLAKE_PASSWORD}
      adbc_driver_options: >-
        snowflake.sql.warehouse=MY_WH;
        snowflake.sql.role=MY_ROLE;
        snowflake.sql.auth_type=auth_snowflake
```

## Prerequisites

An ADBC-compatible driver must be installed on the system where Spice runs. Spice loads the driver shared library by name (e.g., `snowflake`, `bigquery`) or by an explicit file path.

E.g. For Snowflake, install the [Snowflake ADBC driver](https://arrow.apache.org/adbc/current/driver/snowflake.html). The driver shared library (e.g., `libadbc_driver_snowflake.so` on Linux, `libadbc_driver_snowflake.dylib` on macOS) must be on the system library path or referenced with `adbc_driver_path`.

For BigQuery, install the [BigQuery ADBC driver](https://arrow.apache.org/adbc/current/driver/bigquery.html). Spice includes built-in SQL dialect support for BigQuery, translating federated queries into BigQuery-compatible SQL.

## Configuration

### `from`

The `from` field takes the form `adbc:table_name`, where `table_name` is the name of the table to read from the connected database.

For Snowflake, table names are case-sensitive and should match the casing used in Snowflake (typically uppercase). Fully qualified names that include database and schema can be specified when `adbc_catalog` and `adbc_schema` are not set.

### `name`

The dataset name, used as the table name within Spice.

```yaml
datasets:
  - from: adbc:LINEITEM
    name: lineitem
    params:
      adbc_driver: snowflake
      adbc_uri: ${secrets:SNOWFLAKE_URI}
      adbc_username: ${secrets:SNOWFLAKE_USERNAME}
      adbc_password: ${secrets:SNOWFLAKE_PASSWORD}
```

```sql
SELECT COUNT(*) FROM lineitem;
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
| `adbc_driver`              | Required. The ADBC driver name (e.g., `snowflake`, `bigquery`).                                                                      |
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
# Without adbc. prefix (added automatically)
adbc_driver_options: snowflake.sql.warehouse=MY_WH;snowflake.sql.role=MY_ROLE

# With explicit adbc. prefix
adbc_driver_options: adbc.snowflake.sql.warehouse=MY_WH;adbc.snowflake.sql.role=MY_ROLE
```

Trailing semicolons are permitted. Entries without an `=` sign or with an empty key are ignored.

For multi-line readability, use YAML's `>-` folded block scalar:

```yaml
adbc_driver_options: >-
  snowflake.sql.warehouse=MY_WH;
  snowflake.sql.role=MY_ROLE;
  snowflake.sql.auth_type=auth_snowflake
```

#### Snowflake Driver Options

The [Snowflake ADBC driver](https://arrow.apache.org/adbc/current/driver/snowflake.html) accepts the following options through `adbc_driver_options`. See the [Snowflake ADBC client options](https://arrow.apache.org/adbc/current/driver/snowflake.html#client-options) for the complete reference.

| Option Key                               | Description                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `snowflake.sql.warehouse`                | The Snowflake warehouse to use for queries.                                             |
| `snowflake.sql.role`                     | The Snowflake role to assume.                                                           |
| `snowflake.sql.auth_type`                | Authentication type. Common values: `auth_snowflake` (password), `auth_jwt` (key-pair). |
| `snowflake.sql.db`                       | The Snowflake database to use.                                                          |
| `snowflake.sql.schema`                   | The Snowflake schema to use.                                                            |
| `snowflake.sql.region`                   | The Snowflake region for the account.                                                   |
| `snowflake.sql.account`                  | The Snowflake account identifier.                                                       |
| `snowflake.sql.client_option.keep_alive` | Enable session keep-alive. Default: `true`.                                             |
| `snowflake.sql.client_option.app_name`   | Application name reported to Snowflake.                                                 |

### Catalog and Schema

The `adbc_catalog` and `adbc_schema` parameters set connection-level defaults that apply to all queries on the connection. These map to the ADBC standard connection options `adbc.connection.catalog` and `adbc.connection.db_schema`.

For Snowflake, `adbc_catalog` corresponds to the Snowflake database and `adbc_schema` corresponds to the Snowflake schema:

```yaml
datasets:
  - from: adbc:LINEITEM
    name: lineitem
    params:
      adbc_driver: snowflake
      adbc_uri: ${secrets:SNOWFLAKE_URI}
      adbc_username: ${secrets:SNOWFLAKE_USERNAME}
      adbc_password: ${secrets:SNOWFLAKE_PASSWORD}
      adbc_catalog: SNOWFLAKE_SAMPLE_DATA  # Snowflake database
      adbc_schema: TPCH_SF1               # Snowflake schema
      adbc_driver_options: >-
        snowflake.sql.warehouse=MY_WH;
        snowflake.sql.role=MY_ROLE
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

Authentication credentials (`adbc_username`, `adbc_password`) can be provided directly or through [Secrets Stores](../secret-stores/).

```bash
SPICE_SECRET_ADBC_USERNAME=myuser \
SPICE_SECRET_ADBC_PASSWORD=mypassword \
spice run
```

```yaml
datasets:
  - from: adbc:MY_TABLE
    name: my_table
    params:
      adbc_driver: snowflake
      adbc_uri: myaccount.snowflakecomputing.com
      adbc_username: ${secrets:ADBC_USERNAME}
      adbc_password: ${secrets:ADBC_PASSWORD}
      adbc_driver_options: >-
        snowflake.sql.warehouse=MY_WH;
        snowflake.sql.auth_type=auth_snowflake
```

## Examples

### Snowflake

Connect to a Snowflake table with warehouse, role, and authentication options:

```yaml
datasets:
  - from: adbc:LINEITEM
    name: lineitem
    params:
      adbc_driver: snowflake
      adbc_uri: ${secrets:SNOWFLAKE_URI}
      adbc_username: ${secrets:SNOWFLAKE_USERNAME}
      adbc_password: ${secrets:SNOWFLAKE_PASSWORD}
      adbc_catalog: SNOWFLAKE_SAMPLE_DATA
      adbc_schema: TPCH_SF1
      adbc_driver_options: >-
        snowflake.sql.warehouse=COMPUTE_WH;
        snowflake.sql.role=ACCOUNTADMIN;
        snowflake.sql.auth_type=auth_snowflake
      connection_pool_size: 10
      connection_pool_min_idle: 2
```

```sql
SELECT l_returnflag, l_linestatus, SUM(l_quantity) AS sum_qty
FROM lineitem
GROUP BY l_returnflag, l_linestatus
ORDER BY l_returnflag, l_linestatus;
```

#### Snowflake with Key-Pair Authentication

Use JWT-based key-pair authentication by setting `snowflake.sql.auth_type` to `auth_jwt`:

```yaml
datasets:
  - from: adbc:MY_TABLE
    name: my_table
    params:
      adbc_driver: snowflake
      adbc_uri: myaccount.snowflakecomputing.com
      adbc_username: ${secrets:SNOWFLAKE_USERNAME}
      adbc_password: ${secrets:SNOWFLAKE_PRIVATE_KEY}
      adbc_driver_options: >-
        snowflake.sql.warehouse=MY_WH;
        snowflake.sql.role=MY_ROLE;
        snowflake.sql.auth_type=auth_jwt
```

### BigQuery

Connect to a BigQuery table. Spice translates federated queries into BigQuery-compatible SQL automatically.

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "grpc://bigquery.googleapis.com"
      adbc_catalog: my-gcp-project
      adbc_schema: my_dataset
      adbc_driver_options: >-
        adbc.bigquery.sql.auth_type=auth_google_default
```

To authenticate with a service account JSON key:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: bigquery
      adbc_uri: "grpc://bigquery.googleapis.com"
      adbc_catalog: my-gcp-project
      adbc_schema: my_dataset
      adbc_driver_options: >-
        adbc.bigquery.sql.auth_type=auth_json_credential_file;
        adbc.bigquery.sql.auth_credentials=/path/to/service-account.json
```

### Custom Driver Path

When the ADBC driver shared library is not on the system library path, specify its location with `adbc_driver_path`:

```yaml
datasets:
  - from: adbc:MY_TABLE
    name: my_table
    params:
      adbc_driver: snowflake
      adbc_driver_path: /opt/drivers/libadbc_driver_snowflake.so
      adbc_uri: ${secrets:SNOWFLAKE_URI}
      adbc_username: ${secrets:SNOWFLAKE_USERNAME}
      adbc_password: ${secrets:SNOWFLAKE_PASSWORD}
      adbc_driver_options: >-
        snowflake.sql.warehouse=MY_WH;
        snowflake.sql.role=MY_ROLE
```
