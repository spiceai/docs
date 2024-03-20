---
type: docs
title: 'PostgreSQL Data Connector'
linkTitle: 'PostgreSQL Data Connector'
description: 'PostgreSQL Data Connector Documentation'
---

## Dataset Source/Federated SQL Query

To use PostgreSQL as a dataset source or for federated SQL query, specify `postgres` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
```

## Configuration

The connection to PostgreSQL can be configured by providing the following `params`:

- `pg_host`: The hostname of the PostgreSQL server.
- `pg_port`: The port of the PostgreSQL server.
- `pg_db`: The name of the database to connect to.
- `pg_user`: The username to connect with.
- `pg_pass_key`: The secret key containing the password to connect with.
- `pg_pass`: The raw password to connect with, ignored if `pg_pass_key` is provided.

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
      pg_pass_key: my_secret
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
