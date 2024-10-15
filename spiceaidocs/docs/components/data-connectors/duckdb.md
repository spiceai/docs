---
title: 'DuckDB Data Connector'
sidebar_label: 'DuckDB Data Connector'
description: 'DuckDB Data Connector Documentation'
---

DuckDB is an in-process SQL OLAP database management system designed for analytical query workloads. It is optimized for fast execution and can be embedded directly into applications, providing efficient data processing without the need for a separate database server.

This connector allows you to use a DuckDB [persistent database](https://duckdb.org/docs/connect/overview#persistent-database) as a data source for federated SQL queries.

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      duckdb_open: path/to/duckdb_file.duckdb
```

## Configuration

### `from`

The `from` field supports one of two forms:

| `from`                         | Description                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duckdb:database.schema.table` | Read data from a table named `database.schema.table` in your DuckDB file                                                                                |
| `duckdb:read_*()`              | Read data using one of the common [data import](https://duckdb.org/docs/data/overview) DuckDB functions, e.g `read_json`, `read_parquet` or `read_csv`. |

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: duckdb:database.schema.table
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

The DuckDB data connector can be configured by providing the following `params`:

| Parameter Name | Description                                        |
| -------------- | -------------------------------------------------- |
| `duckdb_open`  | The name for the file to back the DuckDB database. |

Configuration `params` are provided either in the top level `dataset` for a dataset source, or in the `acceleration` section for a data store.

## Examples

### Reading from a relative path

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      duckdb_open: path/to/duckdb_file.duckdb
```

### Reading from an absolute path

```yaml
datasets:
  - from: duckdb:sample_data.nyc.rideshare
    name: nyc_rideshare
    params:
      duckdb_open: /my/path/my_database.db
```

### DuckDB Functions

Common [data import](https://duckdb.org/docs/data/overview) DuckDB functions can also define datasets. Instead of a fixed table reference (e.g. `database.schema.table`), a DuckDB function is provided in the `from:` key. For example

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      duckdb_open: path/to/duckdb_file.duckdb

  - from: duckdb:read_csv('test.csv', header = false)
    name: from_function
```

Datasets created from DuckDB functions are similar to a standard `SELECT` query. For example:

```yaml
datasets:
  - from: duckdb:read_csv('test.csv', header = false)
```

is equivalent to:

```sql
-- from_function
SELECT * FROM read_csv('test.csv', header = false);
```

Many DuckDB data imports can be rewritten as DuckDB functions, making them usable as Spice datasets. For example:

```sql
SELECT * FROM 'todos.json';

-- As a DuckDB function
SELECT * FROM read_json('todos.json');
```

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)
