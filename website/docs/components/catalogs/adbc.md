---
title: 'ADBC Catalog Connector'
sidebar_label: 'ADBC'
description: 'Connect to databases via ADBC for automatic schema and table discovery.'
sidebar_position: 11
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - adbc
  - data-connectors
---

Connect to any database via [ADBC](https://arrow.apache.org/adbc/) (Arrow Database Connectivity) as a catalog provider for federated SQL query. The ADBC Catalog Connector uses the ADBC metadata API to automatically discover schemas and tables from the connected database.

## Prerequisites

An ADBC-compatible driver must be installed on the system where Spice runs. See the [ADBC Data Connector](../data-connectors/adbc#prerequisites) for driver installation instructions.

### BigQuery driver

A BigQuery catalog needs the BigQuery ADBC driver built from [spiceai/bigquery](https://github.com/spiceai/bigquery). Spice sets the driver option `bigquery.skip_query_result_tables` on a BigQuery catalog, so the driver leaves out the tables of cached query results (the `anon…` tables in BigQuery's hidden datasets) before it fetches any table metadata. Without this option, discovery fetched the metadata of every cached query result one table at a time, and startup time grew with the number of queries the project ran in the last day. Tables in hidden datasets you create, such as `_staging`, are still listed.

The upstream driver releases, including the one `dbc install bigquery` installs, do not have this option yet. With such a driver, the catalog fails to load with an error that names the option and the driver build to use:

```text
Failed to create ADBC database (driver='…'): the BigQuery driver does not support the `bigquery.skip_query_result_tables` option, which the catalog needs to list hidden datasets without fetching the metadata of every cached query result. Use the BigQuery ADBC driver built from https://github.com/spiceai/bigquery. Cause: …
```

To build the driver on Linux (Go and a C compiler are required), then point `adbc_driver_path` at the library:

```shell
git clone --branch spiceai https://github.com/spiceai/bigquery.git adbc-bigquery
cd adbc-bigquery/go
CGO_ENABLED=1 go build -tags driverlib -buildmode=c-shared -o libadbc_driver_bigquery.so ./pkg/
```

The BigQuery [ADBC data connector](../data-connectors/adbc) does not set this option and works with either driver build.

## Configuration

```yaml
catalogs:
  - from: adbc
    name: my_catalog
    include:
      - 'my_schema.*' # include all tables from my_schema
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project"
```

### `from`

The `from` field is used to specify the catalog provider. For ADBC, specify `adbc`.

### `name`

The `name` field specifies the name of the catalog in Spice. Tables from the ADBC-connected database will be available under this catalog name in Spice. The schema hierarchy of the external database is preserved in Spice.

### `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

When `include` is set, Spice lists the tables only of schemas that an `include` pattern can match. A schema that no pattern can reach is still registered in the catalog, with no tables, and the driver is not asked for its tables. On a database with many schemas, a narrow `include`, such as `'my_schema.*'`, shortens discovery at startup.

### `exclude`

Optional. Use the `exclude` field to omit tables that would otherwise be included. It is matched against the same table name as `include`, using the same glob syntax, and multiple `exclude` patterns are OR'ed together. `exclude` takes precedence over `include`: a table is registered only when it matches `include` (or no `include` is set) **and** matches no `exclude` pattern.

### `params`

The following parameters are supported:

| Parameter Name            | Description                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `adbc_driver`             | Required. The ADBC driver name (e.g., `bigquery`, `trino`, `snowflake`, `redshift`, `duckdb`, `postgres`).          |
| `adbc_driver_path`        | Optional. Absolute path to the ADBC driver shared library. If not specified, the driver is loaded by name.           |
| `adbc_uri`                | Required. Database URI/connection string for the ADBC driver.                                                        |
| `adbc_username`           | Optional. Username for database authentication.                                                                      |
| `adbc_password`           | Optional. Password for database authentication.                                                                      |
| `adbc_driver_options`     | Optional. Semicolon-delimited driver-specific database options (e.g., `key1=value1;key2=value2`).                    |
| `connection_pool_size`    | Optional. Maximum number of connections in the connection pool. Default: `5`.                                         |
| `connection_pool_min_idle` | Optional. Minimum number of idle connections to keep open in the pool. Default: `1`.                                 |
| `query_federation`        | Optional. Controls whether queries are federated to the ADBC source. Values: `enabled`, `disabled`. Default: `enabled`.                |

## Examples

### BigQuery

```yaml
catalogs:
  - from: adbc
    name: bq_catalog
    include:
      - 'my_dataset.*'
    params:
      adbc_driver: bigquery
      adbc_uri: "bigquery:///my-gcp-project"
      adbc_driver_options: >-
        adbc.bigquery.sql.dataset_id=my_dataset
```

### Snowflake

```yaml
catalogs:
  - from: adbc
    name: sf_catalog
    include:
      - 'PUBLIC.*'
    params:
      adbc_driver: snowflake
      adbc_uri: ${secrets:snowflake_uri}
      adbc_username: ${secrets:snowflake_user}
      adbc_password: ${secrets:snowflake_pass}
```
