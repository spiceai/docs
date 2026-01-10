# DuckDB Data Accelerator

To use DuckDB as Data Accelerator, specify `duckdb` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: duckdb
```

### Configuration <a href="#configuration" id="configuration"></a>

Spice.ai currently only supports `mode: memory` for DuckDB accelerator.

Configuration `params` are provided in the `acceleration` section for a data store. Other common `acceleration` fields can be configured for DuckDB, see see [datasets](https://docs.spiceai.org/components/data-accelerators).

:::warning
**LIMITATIONS**

* The DuckDB accelerator does not support nested lists, or structs with nested structs/lists [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  * Supported:
    * `SELECT {'x': 1, 'y': 2, 'z': 3}`
  * Unsupported:
    * `SELECT [['duck', 'goose', 'heron'], ['frog', 'toad']]`
    * `SELECT {'x': [1, 2, 3]}`
* The DuckDB accelerator does not support enum, dictionary, or map [field types](https://duckdb.org/docs/sql/data_types/overview). For example:
  * Unsupported:
    * `SELECT MAP(['key1', 'key2', 'key3'], [10, 20, 30])`
* The DuckDB accelerator does not support `Decimal256` (76 digits), as it exceeds DuckDB's maximum Decimal width of 38 digits.
* Updating a dataset with DuckDB acceleration while the Spice Runtime is running (hot-reload) will cause the DuckDB accelerator query federation to disable until the Runtime is restarted.
:::

:::warning
**MEMORY CONSIDERATIONS**

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.
:::
