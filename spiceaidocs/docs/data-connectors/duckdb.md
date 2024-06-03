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

To connect to a [MotherDuck](https://motherduck.com/) use [MotherDuck Data Connector](motherduck).

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
