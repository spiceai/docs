---
title: 'ADBC Data Connector'
sidebar_label: 'ADBC Data Connector'
description: 'ADBC Data Connector Documentation'
---

[ADBC](https://arrow.apache.org/adbc/) (Arrow Database Connectivity) is a columnar, minimal-overhead alternative to JDBC/ODBC for analytical data access. It uses [Apache Arrow](https://arrow.apache.org/) for data transfer, avoiding serialization overhead between the database driver and Spice.

The ADBC data connector dynamically loads ADBC-compatible drivers (e.g., DuckDB, SQLite, PostgreSQL) and provides federated SQL query access through connection pooling.

```yaml
datasets:
  - from: adbc:table_name
    name: my_table
    params:
      adbc_driver: duckdb # or sqlite, postgres, etc.
      adbc_uri: path/to/database.db
      # Optional connection pool settings
      connection_pool_size: 5
      connection_pool_min_idle: 1
```

## Configuration

### `from`

The `from` field takes the form `adbc:table_name`, where `table_name` is the name of the table to read from the connected database.

### `name`

The dataset name. This is used as the table name within Spice.

Example:

```yaml
datasets:
  - from: adbc:table_name
    name: cool_dataset
    params:
      adbc_driver: duckdb
      adbc_uri: path/to/database.db
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

| Parameter Name             | Description                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `adbc_driver`              | Required. The ADBC driver name (e.g., `duckdb`, `sqlite`, `postgres`).                                                                   |
| `adbc_uri`                 | Required. Database URI or connection string for the ADBC driver. In-memory URIs (e.g., `:memory:`) are not supported.                    |
| `adbc_driver_path`         | Optional. Path to the ADBC driver shared library. When omitted, the driver is loaded by name.                                            |
| `adbc_driver_options`      | Optional. Semicolon-separated key-value pairs of driver-specific options passed to the ADBC driver on connection.                        |
| `connection_pool_size`     | Optional. Maximum number of connections in the connection pool. Default value is `5`.                                                    |
| `connection_pool_min_idle` | Optional. Minimum number of idle connections to keep open in the pool. Default value is `1`.                                             |

:::warning[In-memory databases]
In-memory database URIs (e.g., `:memory:` or URIs containing `mode=memory`) are not supported. Each pooled connection would create an isolated in-memory database, leading to data inconsistency.
:::

## Examples

### PostgreSQL

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: postgres
      adbc_uri: postgresql://user:password@localhost:5432/mydb
```

### Driver Options (Snowflake)

Use `adbc_driver_options` to pass driver-specific options as semicolon-separated key-value pairs:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: snowflake
      adbc_uri: user:password@account.snowflakecomputing.com/mydb/myschema
      adbc_driver_options: >-
        snowflake.sql.warehouse=MY_WH;
        snowflake.sql.role=MY_ROLE;
        snowflake.sql.auth_type=auth_snowflake
```

### Custom Driver Path

When the ADBC driver shared library is not on the system library path, specify its location with `adbc_driver_path`:

```yaml
datasets:
  - from: adbc:my_table
    name: my_table
    params:
      adbc_driver: duckdb
      adbc_driver_path: /opt/drivers/libadbc_driver_duckdb.so
      adbc_uri: /path/to/database.duckdb
```
