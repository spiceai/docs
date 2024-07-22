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
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: postgres
```

## Configuration

The connection to PostgreSQL can be configured by providing the following `params`:

- `pg_host`: The hostname of the PostgreSQL server.
- `pg_port`: The port of the PostgreSQL server.
- `pg_db`: The name of the database to connect to.
- `pg_user`: The username to connect with.
- `pg_pass`: The password to connect with. Use the [secret replacement syntax](../../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_pg_pass}`.
- `pg_sslmode`: Optional parameter, specifies the SSL/TLS behavior for the connection, supported values:
  - `verify-full`: (default) This mode requires an SSL connection, a valid root certificate, and the server host name to match the one specified in the certificate.
  - `verify-ca`: This mode requires an SSL connection and a valid root certificate.
  - `required`: This mode requires an SSL connection.
  - `prefer`: This mode will try to establish a secure SSL connection if possible, but will connect insecurely if the server does not support SSL.
  - `disable`: This mode will not attempt to use an SSL connection, even if the server supports it.
- `pg_sslrootcert`: Optional parameter specifying the path to a custom PEM certificate that the connector will trust.

Configuration `params` are provided either in the `acceleration` section of a dataset.

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: postgres
      params:
        pg_host: localhost
        pg_port: 5432
        pg_db: my_database
        pg_user: my_user
        pg_pass: ${secrets:my_pg_pass}
        pg_sslmode: required
```

Specify different secrets for a PostgreSQL source and acceleration:

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
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
