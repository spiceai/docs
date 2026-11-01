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

| ClickHouse Type                 | Arrow Type                                |
| ------------------------------- | ----------------------------------------- |
| `Bool`                          | `Boolean`                                 |
| `Int8`                          | `Int8`                                    |
| `Int16`                         | `Int16`                                   |
| `Int32`                         | `Int32`                                   |
| `Int64`                         | `Int64`                                   |
| `Int128`                        | `Decimal256(39, 0)`                       |
| `UInt8`                         | `UInt8`                                   |
| `UInt16`                        | `UInt16`                                  |
| `UInt32`                        | `UInt32`                                  |
| `UInt64`                        | `UInt64`                                  |
| `UInt128`                       | `Decimal256(39, 0)`                       |
| `Float32`                       | `Float32`                                 |
| `Float64`                       | `Float64`                                 |
| `Decimal`                       | `Decimal128`                              |
| `String`                        | `Utf8`                                    |
| `FixedString`                   | `Utf8`                                    |
| `UUID`                          | `Utf8`                                    |
| `IPv4`                          | `Utf8`                                    |
| `IPv6`                          | `Utf8`                                    |
| `Enum8`                         | `Utf8` (the enum value name)              |
| `Enum16`                        | `Utf8` (the enum value name)              |
| `Date`                          | `Date32`                                  |
| `Date32`                        | `Date32`                                  |
| `DateTime`, `DateTime(tz)`      | `Timestamp(Second, None)`                 |
| `DateTime64(0)`                 | `Timestamp(Second, None)`                 |
| `DateTime64(1)`–`DateTime64(3)` | `Timestamp(Millisecond, None)`            |
| `DateTime64(4)`–`DateTime64(6)` | `Timestamp(Microsecond, None)`            |
| `DateTime64(7)`–`DateTime64(9)` | `Timestamp(Nanosecond, None)`             |
| `Nullable(T)`                   | Mapped inner type `T`                     |
| `LowCardinality(T)`             | Mapped inner type `T`                     |
| `Array(T)`                      | `List` of the mapped type `T`             |
| `Map(K, V)`                     | `Map` of the mapped types `K` and `V`     |
| `Tuple(...)`                    | `Struct` with one field per tuple element |

`DateTime64(P)` maps to the coarsest Arrow timestamp unit that holds its precision exactly. Timestamps have no Arrow timezone: values are UTC instants, including for columns declared with a timezone such as `DateTime('UTC')` or `DateTime64(3, 'Asia/Tokyo')`. Arrow nanosecond timestamps end at 2262-04-11, so reading a `DateTime64(7)` or `DateTime64(8)` value after that date returns an error that names the value rather than a truncated timestamp.

A `Decimal` value is read from the driver's unscaled integer and scale, then widened to the column's scale. A value that cannot be widened exactly returns an error rather than a rounded value. The driver decodes only `Decimal` values that fit in 64 bits, so a column with a precision above 18, such as `Decimal(38, 10)`, does not read correctly yet ([spiceai/spiceai#15545](https://github.com/spiceai/spiceai/issues/15545)). In v2.4.1 and earlier, a negative value with no integer digits, such as `-0.05`, failed with `Failed to parse decimal string as BigInteger`, and an acceleration of the table did not load.

A named `Tuple` element keeps its name as the `Struct` field name. An unnamed element is named by its 1-based position (`1`, `2`, and so on), matching how ClickHouse addresses tuple elements.

`LowCardinality` is supported as a top-level column type, including `LowCardinality(Nullable(T))`. A `LowCardinality` type nested inside an `Array`, `Map`, or `Tuple`, such as `Array(LowCardinality(String))`, is not supported and returns an `Unsupported Clickhouse type` error. `SimpleAggregateFunction` columns are not supported.

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
      clickhouse_connection_string: tcp://my_user:${secrets:my_clickhouse_pass}@localhost:9000/my_database?connection_timeout=10000ms&secure=true
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure ClickHouse as data connector in Spice. [Clickhouse Data Connector](https://github.com/spiceai/cookbook/tree/trunk/clickhouse#readme)
