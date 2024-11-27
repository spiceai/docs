---
title: 'Microsoft SQL Server Data Connector'
sidebar_label: 'Microsoft SQL Server'
description: 'Microsoft SQL Server Data Connector'
---

[Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) is a relational database management system developed by Microsoft.

The Microsoft SQL Server Data Connector enables federated/accelerated SQL queries on data stored in MSSQL databases.

:::warning[Limitations]

1. The connector supports SQL Server authentication (SQL Login and Password) only.
1. Spatial types (`geography`) are not supported, and columns with these types will be ignored.

:::

```yaml
datasets:
  - from: mssql:path.to.my_dataset
    name: my_dataset
    params:
      mssql_connection_string: ${secrets:mssql_connection_string}
```

## Configuration

### `from`

The `from` field takes the form `mssql:database.schema.table` where `database.schema.table` is the fully-qualified table name in the SQL server.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: mssql:path.to.my_dataset
    name: cool_dataset
    params:
      ...
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

### `params`

The data connector supports the following `params`. Use the [secret replacement syntax](../secret-stores/index.md) to load the secret from a secret store, e.g. `${secrets:my_mssql_conn_string}`.

| Parameter Name                   | Description                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mssql_connection_string`        | The ADO connection string to use to connect to the server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                                                          |
| `mssql_host`                     | The hostname or IP address of the Microsoft SQL Server instance.                                                                                                                                                                                                                                                                                                            |
| `mssql_port`                     | (Optional) The port of the Microsoft SQL Server instance. Default value is 1433.                                                                                                                                                                                                                                                                                            |
| `mssql_database`                 | (Optional) The name of the database to connect to. The default database (`master`) will be used if not specified.                                                                                                                                                                                                                                                                      |
| `mssql_username`                 | The username for the SQL Server authentication.                                                                                                                                                                                                                                                                                                                             |
| `mssql_password`                 | The password for the SQL Server authentication.                                                                                                                                                                                                                                                                                                                             |
| `mssql_encrypt`                  | (Optional) Specifies whether encryption is required for the connection.<br /> <ul><li>`true`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`false`: This mode will not attempt to use an SSL connection, even if the server supports it. Only the login procedure is encrypted.</li></ul> |
| `mssql_trust_server_certificate` | (Optional) Specifies whether the server certificate should be trusted without validation when encryption is enabled.<br /> <ul><li>`true`: The server certificate will not be validated and it is accepted as-is.</li><li>`false`: (default) Server certificate will be validated against system's certificate storage.</li></ul>                                           |

### Example

```yaml
datasets:
  - from: mssql:SalesLT.Customer
    name: customer
    params:
      mssql_host: mssql-host.database.windows.net
      mssql_database: my_catalog
      mssql_username: my_user
      mssql_password: ${secrets:mssql_pass}
      mssql_encrypt: true
      mssql_trust_server_certificate: true
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).