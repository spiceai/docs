---
title: 'SQLite Data Accelerator'
sidebar_label: 'SQLite Data Accelerator'
description: 'SQLite Data Accelerator Documentation'
sidebar_position: 4
pagination_next: null
---

To use SQLite as Data Accelerator, specify `sqlite` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
```

## Configuration

The connection to SQLite can be configured by providing the following `params`:

- `sqlite_file`: The filename for the file to back the SQLite database. Only applies if `mode` is `file`.
- `busy_timeout`: Optional. Specifies the duration for the SQLite [busy timeout](https://www.sqlite.org/c3ref/busy_timeout.html) when connecting to the database file. Default: 5000 ms, or 15000 ms when the acceleration `storage_profile` resolves to EBS-class network storage (where fsync latency spikes are more frequent).

Configuration `params` are provided in the `acceleration` section of a dataset. Other common `acceleration` fields can be configured for sqlite, see see [datasets](../../reference/spicepod/datasets).

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
      mode: file
      params:
        sqlite_file: /my/chosen/location/sqlite.db
```

:::warning[Limitations]

- The SQLite accelerator doesn't support arrow `Interval` types, as [SQLite](https://www.sqlite.org/lang_datefunc.html) doesn't have a native interval type.
- The SQLite accelerator only supports arrow `List` types of primitive data types; lists with structs are not supported.
- The SQLite accelerator doesn't support `Dictionary` or `Map` types.
- SQLite may not be suitable for high row count use cases with complex join queries. Use [DuckDB](duckdb) instead.
- The SQLite accelerator doesn't support advanced grouping features such as `ROLLUP` and `GROUPING`.
- `TRY_CAST` is never sent to SQLite, and a `CAST` is sent only when SQLite evaluates it the same way Spice does. See [Casts and Federation](#casts-and-federation).
- Updating a dataset with SQLite acceleration while the Spice Runtime is running (hot-reload) will cause SQLite accelerator query federation to disable until the Runtime is restarted.

:::

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](duckdb) and [`sqlite`](sqlite) accelerators by specifying `mode: file`.

:::

## Casts and Federation

SQLite's `CAST` never fails. It converts the longest numeric prefix of its operand and returns `0` when there is none, so `CAST('abc' AS BIGINT)` returns `0` and `CAST('12abc' AS BIGINT)` returns `12`. It also formats floats and booleans as text differently, stores dates and timestamps in its own representation, and has no `TRY_CAST`. To return the same results as an unaccelerated query, Spice sends a cast to the SQLite accelerator only when SQLite evaluates it the same way:

- A cast between two string types, or between two binary types.
- An integer cast into a wider integer type, into `Float64`, or into text.
- A `Float32` cast into `Float64`.
- A string literal cast into a date when the literal is already written as `YYYY-MM-DD`, such as `DATE '1994-01-01'`.

Every other `CAST`, and every `TRY_CAST`, is evaluated in Spice above the scan of the accelerated table. This includes a cast whose operand type Spice cannot determine. For example, `CAST(s AS BIGINT)` over a string column that holds `'abc'` returns the error a DataFusion query returns, not `0`, and `CAST(1 AS DECIMAL) / CAST(2 AS DECIMAL)` returns `0.5`, not the result of SQLite integer division. A query whose plan contains such a cast still runs, but that cast does not push down to SQLite.

## Cookbook

- A cookbook recipe to configure SQLite as a data accelerator in Spice. [SQLite Data Accelerator](https://github.com/spiceai/cookbook/tree/trunk/sqlite/accelerator#readme)
