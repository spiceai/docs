---
title: "DuckDB Data Connector"
sidebar_label: "DuckDB Data Connector"
description: "DuckDB Data Connector Documentation"
---

## Dataset Source

To connect to a DuckDB [persistent database](https://duckdb.org/docs/connect/overview#persistent-database) as a data source, specify `duckdb` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
```

## Configuration

The DuckDB data connector can be configured by providing the following `params`:

- `open`: The name for the file to back the DuckDB database. `open` is a required parameter, and DuckDB run in the `file` mode to open the DuckDB database file.

Configuration `params` are provided either in the top level `dataset` for a dataset source, or in the `acceleration` section for a data store.

A generic example of DuckDB data connector configuration.

```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      open: path/to/duckdb_file.duckdb
```

This example uses a DuckDB database file that is at location /my/path/

```yaml
datasets:
  - from: duckdb:sample_data.nyc.rideshare
    name: nyc_rideshare
    params:
      open: /my/path/my_database.db
```

## Dataset Function 
Common [data import](https://duckdb.org/docs/data/overview) DuckDB functions can also define datasets. Instead of a fixed table reference (e.g. `database.schema.table`), a DuckDB function is provided in the `from:` key. For example
```yaml
datasets:
  - from: duckdb:database.schema.table
    name: my_dataset
    params:
      open: path/to/duckdb_file.duckdb

  - from: duckdb:read_csv('test.csv', header = false)
    name: from_function
    params:
      open: path/to/duckdb_function_file.duckdb
```

Conceptually datasets created from DuckDB functions are analagous to a standard `SELECT` query. For example
```SQL
-- from_function
SELECT * FROM read_csv('test.csv', header = false)
```

Importantly, many DuckDB data imports can be rewritten as DuckDB functions, and therefore viable as Spice datasets. For example:
```sql
SELECT * FROM 'todos.json';

-- As a DuckDB function
SELECT * FROM read_json('todos.json');
```
