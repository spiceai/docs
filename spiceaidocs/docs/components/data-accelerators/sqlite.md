---
title: 'SQLite Data Accelerator'
sidebar_label: 'SQLite Data Accelerator'
description: 'SQLite Data Accelerator Documentation'
sidebar_position: 3
pagination_next: null
---

To use SQLite as Data Accelerator, specify `sqlite` as the `engine` for acceleration.

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
```

## Configuration

The connection to SQLite can be configured by providing the following `params`:

- `sqlite_file`: The filename for the file to back the SQLite database. Only applies if `mode` is `file`.

Configuration `params` are provided in the `acceleration` section of a dataset. Other common `acceleration` fields can be configured for sqlite, see see [datasets](/reference/spicepod/datasets.md).

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
      mode: file
      params:
        sqlite_file: /my/chosen/location/sqlite.db
```

:::warning[Limitations]

- The SQLite accelerator only support arrow `Decimal128` and `Decimal256` for up to 16 precision, as SQLite REAL type conforms to the [IEEE 754 Binary-64](https://en.wikipedia.org/wiki/Double-precision_floating-point_format#IEEE_754_double-precision_binary_floating-point_format:_binary64) format which supports 16 decimal digits.
- The SQLite accelerator don't support arrow `Interval` types, as [SQLite](https://www.sqlite.org/lang_datefunc.html) doesn't have a native interval type.
- The SQLite accelerator only supports arrow `List` types of primitive data types; lists with structs are not supported.
- Updating a dataset with SQLite acceleration while the Spice Runtime is running (hot-reload) will cause SQLite accelerator query federation to disable until the Runtime is restarted.

:::
