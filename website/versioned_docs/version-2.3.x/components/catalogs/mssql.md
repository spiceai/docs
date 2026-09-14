---
title: 'Microsoft SQL Server Catalog Connector'
sidebar_label: 'MS SQL Server'
description: 'Connect to a Microsoft SQL Server database as a catalog provider for federated SQL query.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - mssql
  - data-connectors
---

Connect to a [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) database as a catalog provider for federated SQL query. The MSSQL Catalog Connector automatically discovers schemas and tables within a SQL Server database and makes them available for querying in Spice.

For connecting to individual SQL Server tables, see the [Microsoft SQL Server Data Connector documentation](../data-connectors/mssql).

## Configuration

```yaml
catalogs:
  - from: mssql
    name: my_mssql
    include:
      - 'dbo.*' # include all tables from the dbo schema
    params:
      mssql_connection_string: "Server=localhost,1433;Database=my_database;User Id=${secrets:MSSQL_USER};Password=${secrets:MSSQL_PASS};"
```

## `from`

The `from` field specifies the catalog provider. For Microsoft SQL Server, use `mssql`.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the SQL Server database will be available under this catalog name. The schema hierarchy of the SQL Server database is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `exclude`

Optional. Use the `exclude` field to omit tables that would otherwise be included. It is matched against the same table name as `include`, using the same glob syntax, and multiple `exclude` patterns are OR'ed together. `exclude` takes precedence over `include`: a table is registered only when it matches `include` (or no `include` is set) **and** matches no `exclude` pattern.

## `params`

Connection can be configured using a connection string or individual parameters.

### Connection string

| Parameter Name            | Description                                                                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mssql_connection_string` | An [ADO.NET connection string](https://learn.microsoft.com/en-us/sql/connect/ado-net/connection-string-syntax). E.g. `Server=host,port;Database=mydb;User Id=sa;Password=pass;`. |

### Individual parameters

| Parameter Name                   | Description                                                          |
| -------------------------------- | -------------------------------------------------------------------- |
| `mssql_host`                     | The SQL Server host address.                                         |
| `mssql_port`                     | The SQL Server port number.                                          |
| `mssql_database`                 | The SQL Server database name.                                        |
| `mssql_username`                 | The SQL Server username for authentication.                          |
| `mssql_password`                 | The SQL Server password for authentication.                          |
| `mssql_encrypt`                  | Encryption mode: `true` (default), `false`, `require`, or `disable`. |
| `mssql_trust_server_certificate` | Whether to trust the server certificate: `true` or `false`.          |

## Authentication

### Connection string

```yaml
catalogs:
  - from: mssql
    name: my_mssql
    params:
      mssql_connection_string: "Server=localhost,1433;Database=my_database;User Id=${secrets:MSSQL_USER};Password=${secrets:MSSQL_PASS};"
```

### Individual parameters

```yaml
catalogs:
  - from: mssql
    name: my_mssql
    params:
      mssql_host: localhost
      mssql_port: '1433'
      mssql_database: my_database
      mssql_username: ${secrets:MSSQL_USER}
      mssql_password: ${secrets:MSSQL_PASS}
      mssql_encrypt: 'true'
      mssql_trust_server_certificate: 'true'
```

:::warning[Limitations]
The MSSQL Catalog Connector supports SQL Server authentication (SQL Login and Password) only. Windows Authentication and Azure Active Directory authentication are not currently supported.
:::

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
