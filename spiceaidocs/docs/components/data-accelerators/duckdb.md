---
title: 'DuckDB Data Accelerator'
sidebar_label: 'DuckDB Data Accelerator'
description: 'DuckDB Data Accelerator Documentation'
sidebar_position: 3
---

To use DuckDB as Data Accelerator, specify `duckdb` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
```

## Configuration

The DuckDB accelerator can be configured by providing the following `params`:

- `duckdb_file`: The name for the file to back the DuckDB database. If the file does not exist, it will be created. Only applies if `mode` is `file`.

Configuration `params` are provided in the `acceleration` section for a data store. Other common `acceleration` fields can be configured for DuckDB, see see [datasets](/reference/spicepod/datasets.md).

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
      mode: file
      params:
        duckdb_file: /my/chosen/location/duckdb.db
```

:::warning[Limitations]

- The DuckDB accelerator does not support nested lists, or structs with nested structs/lists [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  - Supported:
    - `SELECT {'x': 1, 'y': 2, 'z': 3}`
  - Unsupported:
    - `SELECT [['duck', 'goose', 'heron'], ['frog', 'toad']]`
    - `SELECT {'x': [1, 2, 3]}`
- The DuckDB accelerator does not support enum, dictionary, or map [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  - Unsupported:
    - `SELECT MAP(['key1', 'key2', 'key3'], [10, 20, 30])`
- The DuckDB accelerator does not support `Decimal256` (76 digits), as it exceeds DuckDB's maximum Decimal width of 38 digits.
- Updating a dataset with DuckDB acceleration while the Spice Runtime is running (hot-reload) will cause the DuckDB accelerator query federation to disable until the Runtime is restarted.

:::

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](./duckdb.md) and [`sqlite`](./sqlite.md) accelerators by specifying `mode: file`.

:::
