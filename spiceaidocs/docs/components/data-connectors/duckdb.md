---
title: 'DuckDB Data Connector'
sidebar_label: 'DuckDB Data Connector'
description: 'DuckDB Data Connector Documentation'
---

DuckDB is an in-process SQL OLAP (Online Analytical Processing) database management system designed for analytical query workloads. It is optimized for fast execution and can be embedded directly into applications, providing efficient data processing without the need for a separate database server.

This connector supports DuckDB [persistent databases](https://duckdb.org/docs/connect/overview#persistent-database) as a data source for federated SQL queries.

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

| `from`                         | Description                                                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `duckdb:database.schema.table` | Read data from a table named `database.schema.table` in the DuckDB file                                                                                                                              |
| `duckdb:*`                     | Read data using any DuckDB function that produces a table. For example one of the [data import](https://duckdb.org/docs/data/overview) functions such as `read_json`, `read_parquet` or `read_csv`. |

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
| `duckdb_open`  | The name of the DuckDB database to open. |

Configuration `params` are provided either in the top level `dataset` for a dataset source, or in the `acceleration` section for a data store.

## Examples

### Reading from a relative path

A generic example of DuckDB data connector configuration.

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

:::warning[Limitations]

- The DuckDB connector does not support nested lists, or structs with nested structs/lists [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  - Supported:
    - `SELECT {'x': 1, 'y': 2, 'z': 3}`
  - Unsupported:
    - `SELECT [['duck', 'goose', 'heron'], ['frog', 'toad']]`
    - `SELECT {'x': [1, 2, 3]}`
- The DuckDB connector does not support enum, dictionary, or map [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  - Unsupported:
    - `SELECT MAP(['key1', 'key2', 'key3'], [10, 20, 30])`
- The DuckDB connector does not support `Decimal256` (76 digits), as it exceeds DuckDB's maximum Decimal width of 38 digits.

:::
