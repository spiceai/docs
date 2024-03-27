---
title: 'DuckDB Data Accelerator'
sidebar_label: 'DuckDB Data Accelerator'
description: 'DuckDB Data Accelerator Documentation'
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
      params:
        duckdb_file: /my/chosen/location/duckdb.db
```