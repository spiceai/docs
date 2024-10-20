---
type: docs
title: 'PostgreSQL Data Accelerator'
sidebar_label: 'PostgreSQL Data Accelerator'
description: 'PostgreSQL Data Accelerator Documentation'
sidebar_position: 4
---

To use PostgreSQL as Data Accelerator, specify `postgres` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: postgres
```

## Configuration

The connection to PostgreSQL can be configured by providing the following `params`:

<!-- When making changes to this list, also update components/data-connectors/postgres/index.md -->

- `pg_host`: The hostname of the PostgreSQL server.
- `pg_port`: The port of the PostgreSQL server.
- `pg_db`: The name of the database to connect to.
- `pg_user`: The username to connect with.
- `pg_pass`: The password to connect with. Use the [secret replacement syntax](../../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_pg_pass}`.
- `pg_sslmode`: Optional. Specifies the SSL/TLS behavior for the connection, supported values:
  - `verify-full`: (default) This mode requires an SSL connection, a valid root certificate, and the server host name to match the one specified in the certificate.
  - `verify-ca`: This mode requires a TLS connection and a valid root certificate.
  - `require`: This mode requires a TLS connection.
  - `prefer`: This mode will try to establish a secure TLS connection if possible, but will connect insecurely if the server does not support TLS.
  - `disable`: This mode will not attempt to use a TLS connection, even if the server supports it.
- `pg_sslrootcert`: Optional parameter specifying the path to a custom PEM certificate that the connector will trust.
- `connection_pool_size`: Optional. The maximum number of connections to keep open in the connection pool. Default is 10.

Configuration `params` are provided either in the `acceleration` section of a dataset.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: postgres
      params:
        pg_host: localhost
        pg_port: 5432
        pg_db: my_database
        pg_user: my_user
        pg_pass: ${secrets:my_pg_pass}
        pg_sslmode: require
```

Specify different secrets for a PostgreSQL source and acceleration:

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    params:
      pg_host: localhost
      pg_port: 5432
      pg_db: data_store
      pg_user: my_user
      pg_pass: ${secrets:pg1_pass}
    acceleration:
      engine: postgres
      params:
        pg_host: localhost
        pg_port: 5433
        pg_db: acceleration
        pg_user: two_user_two_furious
        pg_pass: ${secrets:pg2_pass}
```

:::warning[Limitations]

- The Postgres federated queries may result in unexpected result types due to the difference in DataFusion and Postgres size increase rules. Please explicitly specify the expected output type of aggregation functions when writing query involving Postgres table in Spice. For example, rewrite `SUM(int_col)` into `CAST (SUM(int_col) as BIGINT`.

:::

## Arrow to PostgreSQL Type Mapping

The table below lists the supported [Apache Arrow data types](https://arrow.apache.org/rust/arrow/datatypes/enum.DataType.html) and their mappings to [PostgreSQL types](https://www.postgresql.org/docs/current/datatype.html) when stored

| Arrow Type                             | sea_query ColumnType    | PostgreSQL Type               |
| -------------------------------------- | ----------------------- | ----------------------------- |
| `Int8`                                 | `TinyInteger`           | `smallint`                    |
| `Int16`                                | `SmallInteger`          | `smallint`                    |
| `Int32`                                | `Integer`               | `integer`                     |
| `Int64`                                | `BigInteger`            | `bigint`                      |
| `UInt8`                                | `TinyUnsigned`          | `smallint`                    |
| `UInt16`                               | `SmallUnsigned`         | `smallint`                    |
| `UInt32`                               | `Unsigned`              | `bigint`                      |
| `UInt64`                               | `BigUnsigned`           | `numeric`                     |
| `Decimal128` / `Decimal256`            | `Decimal`               | `decimal`                     |
| `Float32`                              | `Float`                 | `real`                        |
| `Float64`                              | `Double`                | `double precision`            |
| `Utf8 / LargeUtf8`                     | `Text`                  | `text`                        |
| `Boolean`                              | `Boolean`               | `bool`                        |
| `Binary / LargeBinary`                 | `VarBinary`             | `bytea`                       |
| `FixedSizeBinary`                      | `Binary`                | `bytea`                       |
| `Timestamp` (no Timezone)              | `Timestamp`             | `timestamp` without time zone |
| `Timestamp` (with Timezone)            | `TimestampWithTimeZone` | `timestamp` with time zone    |
| `Date32` / `Date64`                    | `Date`                  | `date`                        |
| `Time32` / `Time64`                    | `Time`                  | `time`                        |
| `Interval`                             | `Interval`              | `interval`                    |
| `Duration`                             | `BigInteger`            | `bigint`                      |
| `List` / `LargeList` / `FixedSizeList` | `Array`                 | `array`                       |
| `Struct`                               | `N/A`                   | `Composite` (Custom type)     |
