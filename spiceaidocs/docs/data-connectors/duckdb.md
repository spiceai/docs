---
title: "DuckDB Data Connector"
sidebar_label: "DuckDB Data Connector"
description: "DuckDB Data Connector Documentation"
---

## Dataset Source

To connect to any DuckDB database as a data source, specify `duckdb` as the selector in the `from` value for the dataset.

```yaml
datasets:
  - from: duckdb:path.to.my_dataset
    name: my_dataset
```

## Configuration

The DuckDB data connector can be configured by providing the following `params`:

- `open`: The name for the file to back the DuckDB database. `open` is a required parameter, and DuckDB run in the `file` mode to open the DuckDB database file.

Configuration `params` are provided either in the top level `dataset` for a dataset source, or in the `acceleration` section for a data store.

```yaml
datasets:
  - from: duckdb:path.to.my_dataset
    name: my_dataset
    params:
      open: path/to/my_database.duckdb
```

```yaml
datasets:
  - from: duckdb:path.to.my_dataset
    name: my_dataset
    params:
      open: path/to/my_database.db
```
