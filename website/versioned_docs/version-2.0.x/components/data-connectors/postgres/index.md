---
title: 'PostgreSQL Data Connector'
sidebar_label: 'PostgreSQL Data Connector'
description: 'PostgreSQL Data Connector Documentation'
tags:
  - data-connectors
  - postgres
  - write
---

PostgreSQL is an advanced open-source relational database management system known for its reliability, extensibility, and support for SQL compliance.

The PostgreSQL Server Data Connector enables federated/accelerated SQL queries on data stored in PostgreSQL databases.

```yaml
datasets:
  - from: postgres:my_table
    name: my_dataset
    params: ...
```

## Quickstart

Connect to a local PostgreSQL database and accelerate a table for fast local queries:

```yaml
version: v1
kind: Spicepod
name: pg_demo

datasets:
  - from: postgres:public.customers
    name: customers
    params:
      pg_host: localhost
      pg_port: "5432"
      pg_db: mydb
      pg_user: spice_reader
      pg_pass: ${secrets:PG_PASSWORD}
    acceleration:
      enabled: true
```

```bash
echo "PG_PASSWORD=your_password" > .env
```

Start Spice and query the data:

```bash
spice run
# In another terminal:
spice sql
sql> SELECT count(*) FROM customers;
```

## Configuration

### `from`

The `from` field takes the form `postgres:my_table` where `my_table` is the table identifer in the PostgreSQL server to read from.

The fully-qualified table name (`database.schema.table`) can also be used in the `from` field.

```yaml
datasets:
  - from: postgres:my_database.my_schema.my_table
    name: my_dataset
    params: ...
```

:::info
Unquoted identifiers are normalized to lowercase. To reference a table or schema with mixed-case characters, wrap each case-sensitive part in double quotes: `postgres:my_schema."MixedCaseTable"`. See [Identifier Case Sensitivity](../index.md#identifier-case-sensitivity-and-quoting).
:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: postgres:my_database.my_schema.my_table
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

### `params`

The connection to PostgreSQL can be configured by providing the following `params`:

<!-- When making changes to this list, also update components/data-accelerators/postgres/index.md -->

| Parameter Name                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pg_connection_string`        | Optional. The connection string to use to connect to the PostgreSQL server. This can be used instead of providing individual connection parameters.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `pg_host`                     | The hostname of the PostgreSQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pg_port`                     | The port of the PostgreSQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `pg_db`                       | The name of the database to connect to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pg_user`                     | The username to connect with.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pg_pass`                     | The password to connect with. Use the [secret replacement syntax](../../components/secret-stores) to load the password from a secret store, e.g. `${secrets:my_pg_pass}`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `pg_sslmode`                  | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`verify-full`: (default) This mode requires an SSL connection, a valid root certificate, and the server host name to match the one specified in the certificate.</li><li>`verify-ca`: This mode requires a TLS connection and a valid root certificate.</li><li>`require`: This mode requires a TLS connection.</li><li>`prefer`: This mode will try to establish a secure TLS connection if possible, but will connect insecurely if the server does not support TLS.</li><li>`disable`: This mode will not attempt to use a TLS connection, even if the server supports it.</li></ul> |
| `pg_sslrootcert`              | Optional. Path to a custom PEM certificate file, or inline PEM content, that the connector will trust when `pg_sslmode` is `verify-ca` or `verify-full`. Inline PEM content is accepted only on the federated read/query path; the WAL replication transport (`refresh_mode: changes`) requires a file path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `pg_connection_pool_min_idle` | Optional. The minimum number of idle connections to keep open in the pool. Default is `1`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `connection_pool_size`        | Optional. The maximum number of connections created in the connection pool. Default is `5`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

#### Replication parameters

The following parameters configure PostgreSQL [logical replication](https://www.postgresql.org/docs/current/logical-replication.html) (WAL streaming) when using `refresh_mode: changes`:

| Parameter Name                     | Description                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pg_replication_slot`              | Optional. Name of the replication slot to create/reuse. Defaults to `spice_<dataset>_<dataset-hash>_<instance-hash>`. Each Spice replica MUST have its own unique slot. |
| `pg_publication`                   | Optional. Name of the publication to create/reuse. Defaults to `spice_<dataset>_<dataset-hash>_pub`. Shared across replicas for the same dataset.        |
| `pg_replication_initial_snapshot`  | Optional. Whether to take an initial snapshot of existing rows before streaming WAL changes. Default: `true`.                                            |
| `pg_replication_temporary_slot`    | Optional, but **non-functional — do not set it to `true`**. A temporary slot belongs to the Postgres session that creates it, and Spice creates the slot on a short-lived setup connection, so Postgres drops it before `START_REPLICATION` can attach and the stream never starts. Leave it unset; the replication slot is always durable. |
| `pg_replication_status_interval`   | Optional. How often to send StandbyStatusUpdate to Postgres (e.g. `10s`). Default: `10s`.                                                               |
| `pg_replication_bootstrap_batch_size` | Optional. Number of rows per emitted batch during the initial replication snapshot. Default: `8192`. Maximum: `1048576`.                              |

:::warning[`pg_sslmode` and `pg_sslrootcert` differ on the WAL replication transport]

The `pg_sslmode` default of `verify-full` documented above applies to the federated read/query path. On the WAL replication transport used by `refresh_mode: changes`, an unset `pg_sslmode` defaults to **`prefer`**, which negotiates a **plaintext** connection (no certificate verification). Set `pg_sslmode` to `require`, `verify-ca`, or `verify-full` to force TLS on the WAL stream — see [`pg_sslmode` for WAL streaming](../../features/cdc/postgres-replication#pg_sslmode-for-wal-streaming).

`pg_sslrootcert` also behaves differently on this transport: inline PEM content is supported only on the federated read/query path, while the WAL replication transport requires `pg_sslrootcert` to be a **file path**.

:::

## Types

The table below shows the PostgreSQL data types supported, along with the type mapping to Apache Arrow types in Spice.

| PostgreSQL Type | Arrow Type                       |
| --------------- | -------------------------------- |
| `int2`          | `Int16`                          |
| `int4`          | `Int32`                          |
| `int8`          | `Int64`                          |
| `money`         | `Int64`                          |
| `float4`        | `Float32`                        |
| `float8`        | `Float64`                        |
| `numeric`       | `Decimal128`                     |
| `text`          | `Utf8`                           |
| `varchar`       | `Utf8`                           |
| `bpchar`        | `Utf8`                           |
| `uuid`          | `Utf8`                           |
| `bytea`         | `Binary`                         |
| `bool`          | `Boolean`                        |
| `json`          | `Utf8`                           |
| `timestamp`     | `Timestamp(Nanosecond, None)`    |
| `timestamptz`   | `Timestamp(Nanosecond, UTC)`     |
| `date`          | `Date32`                         |
| `time`          | `Time64(Nanosecond)`             |
| `interval`      | `Interval(MonthDayNano)`         |
| `point`         | `FixedSizeList(Float64[2])`      |
| `int2[]`        | `List(Int16)`                    |
| `int4[]`        | `List(Int32)`                    |
| `int8[]`        | `List(Int64)`                    |
| `float4[]`      | `List(Float32)`                  |
| `float8[]`      | `List(Float64)`                  |
| `text[]`        | `List(Utf8)`                     |
| `bool[]`        | `List(Boolean)`                  |
| `bytea[]`       | `List(Binary)`                   |
| `geometry`      | `Binary`                         |
| `geography`     | `Binary`                         |
| `enum`          | `Dictionary(Int8, Utf8)`         |
| Composite Types | `Struct`                         |

:::info

The Postgres federated queries may result in unexpected result types due to the difference in DataFusion and Postgres size increase rules. Explicitly specify the expected output type of aggregation functions when writing queries involving Postgres tables in Spice. For example, rewrite `SUM(int_col)` into `CAST (SUM(int_col) as BIGINT)`.

:::

## Write Support

The PostgreSQL connector supports writing data to PostgreSQL tables using SQL [`INSERT INTO`](../../reference/sql/dml#insert), `UPDATE`, and `DELETE FROM` statements.

To enable writes, set `access: read_write` on the dataset:

```yaml
datasets:
  - from: postgres:public.events
    name: events
    access: read_write
    params:
      pg_host: localhost
      pg_port: '5432'
      pg_db: mydb
      pg_user: spice_writer
      pg_pass: ${secrets:PG_PASSWORD}
```

```sql
-- Insert rows
INSERT INTO events (id, name, amount)
VALUES (1, 'Alice', 100.0), (2, 'Bob', 200.0);

-- Update rows
UPDATE events SET amount = 150.0 WHERE id = 1;

-- Delete rows
DELETE FROM events WHERE id = 2;
```

### Write modes with acceleration

When PostgreSQL is used as the federated source for an accelerated dataset, `acceleration.write_mode` selects how writes propagate between the local accelerator and PostgreSQL:

- `write_through` (default) — writes are sent to PostgreSQL synchronously. The client receives an ACK only after the source commits. The local accelerator is updated via the configured refresh path. Choose this for ACID guarantees.
- `write_back` — writes are applied to the local accelerator first (fast ACK), then forwarded asynchronously to PostgreSQL. Choose this for write throughput when eventual consistency at the source is acceptable.

`acceleration.refresh_mode: changes` is supported for `access: read_write` datasets: writes go to PostgreSQL and the WAL replication stream applies the resulting changes back to the accelerator.

```yaml
datasets:
  - from: postgres:public.events
    name: events
    access: read_write
    params:
      pg_host: localhost
      pg_port: '5432'
      pg_db: mydb
      pg_user: spice_writer
      pg_pass: ${secrets:PG_PASSWORD}
      # Replication-mode parameters (see Configuration above)
      pg_publication: spice_pub
      pg_replication_slot: spice_slot
    acceleration:
      engine: duckdb
      mode: file
      refresh_mode: changes
      write_mode: write_through # default; use write_back for fast async writes
```

For more details, see [Data Ingestion](../../features/data-ingestion).

## Examples

### Connecting using Username/Password

```yaml
datasets:
  - from: postgres:my_database.my_schema.my_table
    name: my_dataset
    params:
      pg_host: localhost
      pg_port: 5432
      pg_db: my_database
      pg_user: my_user
      pg_pass: ${secrets:my_pg_pass}
```

### Connect using SSL

```yaml
datasets:
  - from: postgres:my_database.my_schema.my_table
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

### Separate dataset/accelerator secrets

Specify different secrets for a PostgreSQL source and acceleration:

```yaml
datasets:
  - from: postgres:my_schema.my_table
    name: my_dataset
    params:
      pg_host: localhost
      pg_port: 5432
      pg_db: my_database
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

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../../components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../../components/secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to configure PostgreSQL as a data connector in Spice. [PostgreSQL Data Accelerator](https://github.com/spiceai/cookbook/tree/trunk/postgres/accelerator#readme)
- A cookbook recipe to configure AWS RDS for PostgreSQL as a data connector in Spice. [AWS RDS for PostgreSQL](https://github.com/spiceai/cookbook/tree/trunk/postgres/rds#readme)
- A cookbook recipe to configure Supabase a data connector in Spice. [Supabase (PostgreSQL Data Connector)](https://github.com/spiceai/cookbook/tree/trunk/postgres/supabase#readme)
