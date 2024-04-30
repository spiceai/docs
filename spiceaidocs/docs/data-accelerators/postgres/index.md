---
type: docs
title: "PostgreSQL Data Accelerator"
sidebar_label: "PostgreSQL Data Accelerator"
description: "PostgreSQL Data Accelerator Documentation"
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
- `pg_pass_key`: The secret key containing the password to connect with.
- `pg_pass`: The plain-text password to connect with, ignored if `pg_pass_key` is provided.
- `pg_sslmode`: Optional parameter, specifies the SSL/TLS behavior for the connection, supported values:
  - `prefer`: (default) This mode will try to establish a secure SSL connection if possible, but will still connect if the server does not support SSL.
  - `require`: This mode requires an SSL connection. If a secure connection cannot be established, server will not connect.
  - `disable`: This mode will not attempt to use an SSL connection, even if the server supports it.
- `pg_insecure`: Optional parameter, Allows TLS connectivity to servers with invalid/expired certificates.

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
        pg_pass_key: my_secret
        pg_sslmode: required
        pg_insecure: "true"
```

Additionally, an `engine_secret` may be provided when configuring a PostgreSQL data store to allow for using a different secret store to specify the password for a dataset using PostgreSQL as both the data source and data store.

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    params:
      pg_host: localhost
      pg_port: 5432
      pg_db: data_store
      pg_user: my_user
      pg_pass_key: my_secret
    acceleration:
      engine: postgres
      engine_secret: pg_backend
      params:
        pg_host: localhost
        pg_port: 5433
        pg_db: data_store
        pg_user: my_user
        pg_pass_key: my_secret
```
