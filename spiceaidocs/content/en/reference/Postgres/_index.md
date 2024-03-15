---
type: docs
title: "Postgres"
linkTitle: "Postgres"
description: 'PostgreSQL reference'
weight: 80
---

PostgreSQL can be connected to Spice AI as either a dataset source, a data store, or a data mesh.

## Dataset Source

To use PostgreSQL as a dataset source, specify `postgres` as the `source` portion of `from` value for your dataset.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
    acceleration:
        enabled: true
```

## Data Mesh

To use PostgreSQL as a data mesh, specify `postgres` as the `source` portion of `from` value for your dataset, without acceleration.

```yaml
datasets:
  - from: postgres:path.to.my_dataset
    name: my_dataset
```

## Data Store

To use PostgreSQL as a data store, specify `postgres` as the `engine` for your dataset.

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
        engine: postgres
```

## Configuration

You can configure the connection to your PostgreSQL by providing the following `params`:

- `pg_host`: The hostname of the PostgreSQL server.
- `pg_port`: The port of the PostgreSQL server.
- `pg_db`: The name of the database to connect to.
- `pg_user`: The username to connect with.
- `pg_pass_key`: The name of the secret containing the password to connect with.
- `pg_pass`: The raw password to connect with, ignored if `pg_pass_key` is provided.

Configuration `params` are provided either in the top level `dataset` for a dataset source and data mesh, or in the `acceleration` section for a data store.

### Dataset Source/Mesh

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

### Data Store

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