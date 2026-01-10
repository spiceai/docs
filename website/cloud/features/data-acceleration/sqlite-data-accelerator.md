# SQLite Data Accelerator

To use SQLite as Data Accelerator, specify `sqlite` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
```

### Configuration <a href="#configuration" id="configuration"></a>

The connection to SQLite can be configured by providing the following `params`:

* `busy_timeout`: Optional. Specifies the duration for the SQLite [busy timeout](https://www.sqlite.org/c3ref/busy_timeout.html) when connecting to the database file. Default: 5000 ms.

Configuration `params` are provided in the `acceleration` section of a dataset. Other common `acceleration` fields can be configured for sqlite, see see [datasets](https://docs.spiceai.org/reference/spicepod/datasets).

:::warning
**LIMITATIONS**

* The SQLite accelerator doesn't support advanced grouping features such as `ROLLUP` and `GROUPING`.
* In SQLite, `CAST(value AS DECIMAL)` doesn't convert an integer to a floating-point value if the casted value is an integer. Operations like `CAST(1 AS DECIMAL) / CAST(2 AS DECIMAL)` will be treated as integer division, resulting in 0 instead of the expected 0.5. Use `FLOAT` to ensure conversion to a floating-point value: `CAST(1 AS FLOAT) / CAST(2 AS FLOAT)`.
* Updating a dataset with SQLite acceleration while the Spice Runtime is running (hot-reload) will cause SQLite accelerator query federation to disable until the Runtime is restarted.
* The SQLite accelerator doesn't support arrow `Interval` types, as [SQLite](https://www.sqlite.org/lang_datefunc.html) doesn't have a native interval type.
* The SQLite accelerator only supports arrow `List` types of primitive data types; lists with structs are not supported.
:::

:::warning
**MEMORY CONSIDERATIONS**

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.
:::
