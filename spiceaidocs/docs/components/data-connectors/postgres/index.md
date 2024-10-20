---
title: 'PostgreSQL Data Connector'
sidebar_label: 'PostgreSQL Data Connector'
description: 'PostgreSQL Data Connector Documentation'
---

## Dataset Source/Federated SQL Query

To use PostgreSQL as a dataset source or for federated SQL query, specify `postgres` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
```

:::warning[Limitations]

- The Postgres federated queries may result in unexpected result types due to the difference in DataFusion and Postgres size increase rules. Please explicitly specify the expected output type of aggregation functions when writing query involving Postgres table in Spice. For example, rewrite `SUM(int_col)` into `CAST (SUM(int_col) as BIGINT`.

:::

## Configuration

The connection to PostgreSQL can be configured by providing the following `params`:

<!-- When making changes to this list, also update components/data-accelerators/postgres/index.md -->

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

Configuration `params` are provided either in the top level `dataset` for a dataset source and federated SQL query, or in the `acceleration` section for a data store.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
    params:
      pg_host: localhost
      pg_port: 5432
      pg_db: my_database
      pg_user: my_user
      pg_pass: ${secrets:my_pg_pass}
```

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
    params:
      pg_host: localhost
      pg_port: 5432
      pg_db: my_database
      pg_user: my_user
      pg_pass: ${secrets:my_pg_pass}
      pg_sslmode: verify-ca
      pg_sslrootcert: ./custom_cert.pem
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

## Types

The table below shows the PostgreSQL data types supported, along with the type mapping to Apache Arrow types in Spice.

| PostgreSQL Type   | Arrow Type                                      |
| ----------------- | ----------------------------------------------- |
| `int2`            | `Int16`                                         |
| `int4`            | `Int32`                                         |
| `int8`            | `Int64`                                         |
| `money`           | `Int64`                                         |
| `float4`          | `Float32`                                       |
| `float8`          | `Float64`                                       |
| `numeric`         | `Decimal128`                                    |
| `text`            | `Utf8`                                          |
| `varchar`         | `Utf8`                                          |
| `bpchar`          | `Utf8`                                          |
| `uuid`            | `Utf8`                                          |
| `bytea`           | `Binary`                                        |
| `bool`            | `Boolean`                                       |
| `json`            | `LargeUtf8`                                     |
| `timestamp`       | `Timestamp(Nanosecond, None)`                   |
| `timestampz`      | `Timestamp(Nanosecond, TimeZone`                |
| `date`            | `Date32`                                        |
| `time`            | `Time64(Nanosecond)`                            |
| `interval`        | `Interval(MonthDayNano)`                        |
| `point`           | `FixedSizeList(Float64[2])`                     |
| `int2[]`          | `List(Int16)`                                   |
| `int4[]`          | `List(Int32)`                                   |
| `int8[]`          | `List(Int64)`                                   |
| `float4[]`        | `List(Float32)`                                 |
| `float8[]`        | `List(Float64)`                                 |
| `text[]`          | `List(Utf8)`                                    |
| `bool[]`          | `List(Boolean)`                                 |
| `bytea[]`         | `List(Binary)`                                  |
| `geometry`        | `Binary`                                        |
| `geography`       | `Binary`                                        |
| `enum`            | `Dictionary(Int8, Utf8)`                        |
| Composite Types   | `Struct`                                        |
