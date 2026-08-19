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
1. `DATETIME2` and `DATETIMEOFFSET` columns are mapped to Arrow `Timestamp(Nanosecond)`. Timestamps outside the nanosecond range (approximately years 1677–2262) will return an error. This is an inherent limitation of Arrow's nanosecond timestamp representation.

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

:::info
Unquoted identifiers are normalized to lowercase. To reference a table, schema, or database with mixed-case characters, wrap each case-sensitive part in double quotes: `mssql:my_database."MySchema"."MyTable"`. See [Identifier Case Sensitivity](../index.md#identifier-case-sensitivity-and-quoting).
:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: mssql:path.to.my_dataset
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords) or any of the following keywords that are reserved by Microsoft SQL Server:

- `OUTER`
- `SET`
- `QUALIFY`
- `WINDOW`
- `END`
- `FOR`

### `params`

The data connector supports the following `params`. Use the [secret replacement syntax](../secret-stores/) to load the secret from a secret store, e.g. `${secrets:my_mssql_conn_string}`.

| Parameter Name                   | Description                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mssql_connection_string`        | The ADO connection string to use to connect to the server. This can be used instead of providing individual connection parameters, and is the only way to set `ApplicationIntent` — see [Availability groups and read-only routing](#availability-groups-and-read-only-routing).                                                                                             |
| `mssql_host`                     | The hostname or IP address of the Microsoft SQL Server instance.                                                                                                                                                                                                                                                                                                            |
| `mssql_port`                     | (Optional) The port of the Microsoft SQL Server instance. Default value is 1433.                                                                                                                                                                                                                                                                                            |
| `mssql_database`                 | (Optional) The name of the database to connect to. The default database (`master`) will be used if not specified.                                                                                                                                                                                                                                                           |
| `mssql_username`                 | The username for the SQL Server authentication.                                                                                                                                                                                                                                                                                                                             |
| `mssql_password`                 | The password for the SQL Server authentication.                                                                                                                                                                                                                                                                                                                             |
| `mssql_encrypt`                  | (Optional) Specifies whether encryption is required for the connection.<br /> <ul><li>`true` or `require`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`false` or `disable`: This mode will not attempt to use an SSL connection, even if the server supports it. Only the login procedure is encrypted.</li></ul> |
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

## Availability groups and read-only routing

When a dataset connects to an [Always On availability group](https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/always-on-availability-groups-sql-server) listener with read intent, the listener answers the login by naming the secondary replica the session belongs on instead of completing it. Spice follows that redirect automatically and re-dials the named replica, so a read-intent dataset lands on a readable secondary rather than the primary.

Read intent is requested through the connection string, so it requires `mssql_connection_string` — the individual connection parameters (`mssql_host`, `mssql_username`, and so on) have no equivalent:

```yaml
datasets:
  - from: mssql:SalesLT.Customer
    name: customer
    params:
      mssql_connection_string: ${secrets:mssql_connection_string}
```

With a connection string of the form:

```text
Server=tcp:ag-listener.example.com,1433;Database=Sales;User ID=my_user;Password=my_password;ApplicationIntent=ReadOnly;Encrypt=true
```

`ApplicationIntent` is the only value that enables routing, and `ReadOnly` is matched exactly — other spellings are treated as read-write intent and are not routed.

The redirect carries the settings the dataset supplied: only the host and port are replaced, so the routed replica is reached with the same credentials, database, encryption level and certificate-trust configuration.

:::info
Spice follows up to **3** redirects (4 connection attempts) before reporting the chain as broken. A routing list that points back at the listener redirects indefinitely, so exceeding the limit fails the connection with an error naming the last address it was routed to — check the availability group's read-only routing list when this happens.
:::

## Performance

See the dedicated **[Performance](./performance.md)** page for query-pushdown tuning — TopK / `ORDER BY ... LIMIT` pushdown and its NULL-ordering rules.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure Microsoft SQL Server as a data connector in Spice. [MSSQL (Microsoft SQL Server) Connector](https://github.com/spiceai/cookbook/tree/trunk/mssql#readme)
