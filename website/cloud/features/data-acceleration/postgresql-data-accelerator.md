# PostgreSQL Data Accelerator

To use PostgreSQL as Data Accelerator, specify `postgres` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: postgres
```

### Configuration <a href="#configuration" id="configuration"></a>

The connection to PostgreSQL can be configured by providing the following `params`:

* `pg_host`: The hostname of the PostgreSQL server.
* `pg_port`: The port of the PostgreSQL server.
* `pg_db`: The name of the database to connect to.
* `pg_user`: The username to connect with.
* `pg_pass`: The password to connect with. Use the [secret replacement syntax](https://docs.spiceai.org/components/secret-stores) to load the password from a secret store, e.g. `${secrets:my_pg_pass}`.
* `pg_sslmode`: Optional. Specifies the SSL/TLS behavior for the connection, supported values:
  * `verify-full`: (default) This mode requires an SSL connection, a valid root certificate, and the server host name to match the one specified in the certificate.
  * `verify-ca`: This mode requires a TLS connection and a valid root certificate.
  * `require`: This mode requires a TLS connection.
  * `prefer`: This mode will try to establish a secure TLS connection if possible, but will connect insecurely if the server does not support TLS.
  * `disable`: This mode will not attempt to use a TLS connection, even if the server supports it.
* `pg_sslrootcert`: Optional parameter specifying the path to a custom PEM certificate that the connector will trust.
* `connection_pool_size`: Optional. The maximum number of connections to keep open in the connection pool. Default is 10.

Configuration `params` are provided either in the `acceleration` section of a dataset.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: postgres
      params:
        pg_host: my_db_host
        pg_port: 5432
        pg_db: my_database
        pg_user: my_user
        pg_pass: ${secrets:my_pg_pass}
        pg_sslmode: require
```

### Arrow to PostgreSQL Type Mapping <a href="#arrow-to-postgresql-type-mapping" id="arrow-to-postgresql-type-mapping"></a>

The table below lists the supported [Apache Arrow data types](https://arrow.apache.org/rust/arrow/datatypes/enum.DataType.html) and their mappings to [PostgreSQL types](https://www.postgresql.org/docs/current/datatype.html) when stored

<table><thead><tr><th width="249">Arrow Type</th><th>sea_query ColumnType</th><th>PostgreSQL Type</th></tr></thead><tbody><tr><td>`Int8`</td><td>`TinyInteger`</td><td>`smallint`</td></tr><tr><td>`Int16`</td><td>`SmallInteger`</td><td>`smallint`</td></tr><tr><td>`Int32`</td><td>`Integer`</td><td>`integer`</td></tr><tr><td>`Int64`</td><td>`BigInteger`</td><td>`bigint`</td></tr><tr><td>`UInt8`</td><td>`TinyUnsigned`</td><td>`smallint`</td></tr><tr><td>`UInt16`</td><td>`SmallUnsigned`</td><td>`smallint`</td></tr><tr><td>`UInt32`</td><td>`Unsigned`</td><td>`bigint`</td></tr><tr><td>`UInt64`</td><td>`BigUnsigned`</td><td>`numeric`</td></tr><tr><td>`Decimal128` / `Decimal256`</td><td>`Decimal`</td><td>`decimal`</td></tr><tr><td>`Float32`</td><td>`Float`</td><td>`real`</td></tr><tr><td>`Float64`</td><td>`Double`</td><td>`double precision`</td></tr><tr><td>`Utf8 / LargeUtf8`</td><td>`Text`</td><td>`text`</td></tr><tr><td>`Boolean`</td><td>`Boolean`</td><td>`bool`</td></tr><tr><td>`Binary / LargeBinary`</td><td>`VarBinary`</td><td>`bytea`</td></tr><tr><td>`FixedSizeBinary`</td><td>`Binary`</td><td>`bytea`</td></tr><tr><td>`Timestamp` (no Timezone)</td><td>`Timestamp`</td><td>`timestamp` without time zone</td></tr><tr><td>`Timestamp` (with Timezone)</td><td>`TimestampWithTimeZone`</td><td>`timestamp` with time zone</td></tr><tr><td>`Date32` / `Date64`</td><td>`Date`</td><td>`date`</td></tr><tr><td>`Time32` / `Time64`</td><td>`Time`</td><td>`time`</td></tr><tr><td>`Interval`</td><td>`Interval`</td><td>`interval`</td></tr><tr><td>`Duration`</td><td>`BigInteger`</td><td>`bigint`</td></tr><tr><td>`List` / `LargeList` / `FixedSizeList`</td><td>`Array`</td><td>`array`</td></tr><tr><td>`Struct`</td><td>`N/A`</td><td>`Composite` (Custom type)</td></tr></tbody></table>

:::warning
**LIMITATIONS**

* The Postgres federated queries may result in unexpected result types due to the difference in DataFusion and Postgres size increase rules. Please explicitly specify the expected output type of aggregation functions when writing query involving Postgres table in Spice. For example, rewrite `SUM(int_col)` into `CAST (SUM(int_col) as BIGINT`.
:::
