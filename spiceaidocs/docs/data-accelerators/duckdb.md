---
title: 'DuckDB Data Accelerator'
sidebar_label: 'DuckDB Data Accelerator'
description: 'DuckDB Data Accelerator Documentation'
sidebar_position: 2
---

To use DuckDB as Data Accelerator, specify `duckdb` as the `engine` for acceleration.

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
```

## Configuration

The DuckDB accelerator can be configured by providing the following `params`:

- `duckdb_file`: The name for the file to back the DuckDB database. If the file does not exist, it will be created. Only applies if `mode` is `file`.

Configuration `params` are provided in the `acceleration` section for a data store. Other common `acceleration` fields can be configured for DuckDB, see see [datasets](../reference/spicepod/datasets.md).

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_file: /my/chosen/location/duckdb.db
```

## Limitations

- The DuckDB accelerator does not support schemas with [field types](https://duckdb.org/docs/sql/data_types/overview): nested arrays/lists, UTF8/string arrays/lists, structs or map fields. For example:
  - Supported:
    - `SELECT [1, 2, 3];`
    - `SELECT ['1992-09-20 11:30:00.123456789', 'epoch'::TIMESTAMP]`
  - Unsupported:
    - `SELECT [['duck', 'goose', 'heron'], ['frog', 'toad']]`
    - `SELECT {'x': 1, 'y': 2, 'z': 3}`
    - `SELECT MAP(['key1', 'key2', 'key3'], [10, 20, 30])`
    - `SELECT ['duck', 'goose', 'heron'];`
