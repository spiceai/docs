---
title: 'PostgreSQL Data Connector'
sidebar_label: 'PostgreSQL Data Connector'
description: 'PostgreSQL Data Connector Documentation'
---

## Dataset Source/Federated SQL Query

To use PostgreSQL as a dataset source specify `postgres` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
```

## Configuration

The following connection `params` are supported:

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

### Example

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
