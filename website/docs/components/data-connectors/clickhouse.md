---
title: 'ClickHouse Data Connector'
sidebar_label: 'ClickHouse Data Connector'
description: 'ClickHouse Data Connector Documentation'
---

ClickHouse is a fast, open-source columnar database management system designed for online analytical processing (OLAP) and real-time analytics. This connector enables federated SQL queries from a ClickHouse server.

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
```

## Configuration

### `from`

The `from` field for the ClickHouse connector takes the form of `from:db.dataset` where `db.dataset` is the path to the Dataset within ClickHouse. In the example above it would be `my.dataset`.

The `clickhouse_db` parameter is required when not using `clickhouse_connection_string`. When using a connection string without a database path, it defaults to the `default` database.

:::info
Unquoted identifiers are normalized to lowercase. To reference a table or database with mixed-case characters, wrap each case-sensitive part in double quotes: `clickhouse:my_db."MixedCaseTable"`. See [Identifier Case Sensitivity](./index.md#identifier-case-sensitivity-and-quoting).
:::

### `name`

The dataset name. This will be used as the table name within Spice.

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: cool_dataset
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords) or any of the following keywords that are reserved by ClickHouse:

- `PREWHERE`
- `SETTINGS`
- `FORMAT`

### `params`

The ClickHouse data connector can be configured by providing the following `params`:

| Parameter Name                 | Definition                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clickhouse_connection_string` | The connection string to use to connect to the ClickHouse server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                   |
| `clickhouse_host`              | The hostname of the ClickHouse server.                                                                                                                                                                                                                                                                                                      |
| `clickhouse_tcp_port`          | The port of the ClickHouse server.                                                                                                                                                                                                                                                                                                          |
| `clickhouse_db`                | The name of the database to connect to.                                                                                                                                                                                                                                                                                                     |
| `clickhouse_user`              | The username to connect with.                                                                                                                                                                                                                                                                                                               |
| `clickhouse_pass`              | The password to connect with.                                                                                                                                                                                                                                                                                                               |
| `clickhouse_secure`            | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`true`: (default) This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.</li><li>`false`: This mode will not attempt to use an SSL connection, even if the server supports it.</li></ul> |
| `connection_timeout`           | Optional. Specifies the connection timeout in milliseconds. Default is `10000` (10 seconds).                                                                                                                                                                                                                                                |

## Types

The table below shows the ClickHouse data types supported, along with the type mapping to Apache Arrow types in Spice.

| ClickHouse Type  | Arrow Type                  |
| ---------------- | --------------------------- |
| `Bool`           | `Boolean`                   |
| `Int8`           | `Int8`                      |
| `Int16`          | `Int16`                     |
| `Int32`          | `Int32`                     |
| `Int64`          | `Int64`                     |
| `UInt8`          | `UInt8`                     |
| `UInt16`         | `UInt16`                    |
| `UInt32`         | `UInt32`                    |
| `UInt64`         | `UInt64`                    |
| `Float32`        | `Float32`                   |
| `Float64`        | `Float64`                   |
| `Decimal`        | `Decimal128`                |
| `String`         | `Utf8`                      |
| `FixedString`    | `Utf8`                      |
| `UUID`           | `Utf8`                      |
| `Date`           | `Date32`                    |
| `DateTime`       | `Timestamp(Second, None)`   |
| `Nullable(T)`    | Mapped inner type `T`       |

## Examples

### Connecting to localhost

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
    params:
      clickhouse_host: localhost
      clickhouse_tcp_port: 9000
      clickhouse_db: my_database
      clickhouse_user: my_user
      clickhouse_pass: ${secrets:my_clickhouse_pass}
      connection_timeout: 10000
      clickhouse_secure: false
```

### Specifying a connection timeout

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database
      connection_timeout: 10000
      clickhouse_secure: true
```

### Using a connection string

```yaml
datasets:
  - from: clickhouse:my.dataset
    name: my_dataset
    params:
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database?connection_timeout=10000&secure=true
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure ClickHouse as data connector in Spice. [Clickhouse Data Connector](https://github.com/spiceai/cookbook/tree/trunk/clickhouse#readme)
