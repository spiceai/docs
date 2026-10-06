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
- `AVG` and `SUM` over a decimal column are never sent to SQLite. SQLite stores a decimal value as a double, so a value with more than about 15 significant digits reads back changed. See [Decimal Aggregates and Federation](#decimal-aggregates-and-federation).
- Updating a dataset with SQLite acceleration while the Spice Runtime is running (hot-reload) will cause SQLite accelerator query federation to disable until the Runtime is restarted.

:::

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](duckdb) and [`sqlite`](sqlite) accelerators by specifying `mode: file`.

:::

## Casts and Federation

SQLite's `CAST` never fails. A cast into a numeric type converts the longest numeric prefix of its operand and returns `0` when there is none, so `CAST('abc' AS BIGINT)` returns `0` and `CAST('12abc' AS BIGINT)` returns `12` (see [CAST expressions](https://www.sqlite.org/lang_expr.html#castexpr) in the SQLite documentation). SQLite also formats floats and booleans as text differently, stores dates and timestamps in its own representation, and has no `TRY_CAST`. To return the same results as an unaccelerated query, Spice sends a cast to the SQLite accelerator only when SQLite evaluates it the same way:

- A cast between two string types, or between two binary types.
- An integer cast into a wider integer type, into `Float64`, or into text.
- A `Float32` cast into `Float64`.
- A string literal cast into a date when the literal is already written as `YYYY-MM-DD`, such as `DATE '1994-01-01'`.

Every other `CAST`, and every `TRY_CAST`, is evaluated in Spice above the scan of the accelerated table. This includes a cast whose operand type Spice cannot determine. For example, `CAST(s AS BIGINT)` over a string column that holds `'abc'` returns the error a DataFusion query returns, not `0`, and `CAST(1 AS DECIMAL) / CAST(2 AS DECIMAL)` returns `0.5`, not the result of SQLite integer division. A query whose plan contains such a cast still runs, but that cast does not push down to SQLite.

## Decimal Aggregates and Federation

SQLite has no decimal type. It stores a decimal value as a `REAL` or an `INTEGER`, and computes `avg` and `sum` over it in floating point or in 64-bit integers. Its `avg` returns a rounded floating-point value where Spice computes the average in decimal arithmetic and truncates it to the scale of the result type. Its `sum` over values stored as integers fails with an integer overflow once the total exceeds the 64-bit integer range, and a `sum` that includes a value stored as a `REAL` is computed in floating point instead.

So that these aggregates follow Spice's decimal semantics, Spice does not send `AVG` or `SUM` over a decimal column to the SQLite accelerator, whether called as an aggregate or as a window function. The aggregate is evaluated in Spice above the scan of the accelerated table, and the scan, its filters, and its projection are still sent to SQLite. An aggregate whose argument type Spice cannot determine is also evaluated in Spice. Aggregates over integer and floating-point columns, and other aggregates over decimal columns such as `MIN`, `MAX`, and `COUNT`, are still sent to SQLite.

This changes where the aggregate runs, not how SQLite stores the values. SQLite stores a decimal value as a double, so a value with more than about 15 significant digits is rounded when it is written and reads back changed, with no error ([spiceai/spiceai#14662](https://github.com/spiceai/spiceai/issues/14662)). An aggregate evaluated in Spice is exact over the values SQLite returns, so over such values it can still differ from an unaccelerated query. In the reproduction on that issue, the `arrow` and `duckdb` accelerators return such a value unchanged.

## Cookbook

- A cookbook recipe to configure SQLite as a data accelerator in Spice. [SQLite Data Accelerator](https://github.com/spiceai/cookbook/tree/trunk/sqlite/accelerator#readme)
