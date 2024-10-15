---
title: 'PostgreSQL Data Connector'
sidebar_label: 'PostgreSQL Data Connector'
description: 'PostgreSQL Data Connector Documentation'
---

PostgreSQL is an advanced open-source relational database management system known for its robustness, extensibility, and support for SQL compliance.

The PostgreSQL Server Data Connector enables federated SQL queries on data stored in PostgreSQL databases.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
```

:::warning[Limitations]

- The Postgres federated queries may result in unexpected result types due to the difference in DataFusion and Postgres size increase rules. Please explicitly specify the expected output type of aggregation functions when writing query involving Postgres table in Spice. For example, rewrite `SUM(int_col)` into `CAST (SUM(int_col) as BIGINT`.

:::

## Configuration

### `from`

The `from` field takes the form `mysql:path.to.my_dataset` where `path.to.my_dataset` is the fully-qualified table name in the SQL server.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: postgres:path.to.my_dataset
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

The connection to PostgreSQL can be configured by providing the following `params`:

<!-- When making changes to this list, also update components/data-accelerators/postgres/index.md -->

| Parameter Name         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pg_host`              | The hostname of the PostgreSQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `pg_port`              | The port of the PostgreSQL server.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `pg_db`                | The name of the database to connect to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pg_user`              | The username to connect with.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pg_pass`              | The password to connect with. Use the [secret replacement syntax](../../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_pg_pass}`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `pg_sslmode`           | Optional. Specifies the SSL/TLS behavior for the connection, supported values:<br /> <ul><li>`verify-full`: (default) This mode requires an SSL connection, a valid root certificate, and the server host name to match the one specified in the certificate.</li><li>`verify-ca`: This mode requires a TLS connection and a valid root certificate.</li><li>`require`: This mode requires a TLS connection.</li><li>`prefer`: This mode will try to establish a secure TLS connection if possible, but will connect insecurely if the server does not support TLS.</li><li>`disable`: This mode will not attempt to use a TLS connection, even if the server supports it.</li></ul> |
| `pg_sslrootcert`       | Optional parameter specifying the path to a custom PEM certificate that the connector will trust.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `connection_pool_size` | Optional. The maximum number of connections to keep open in the connection pool. Default is 10.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
## Example

### Connecting using Username/Password

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

### Connect using SSL

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

### Separate dataset/accelerator secrets

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

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)
