---
title: 'Object Store Data Types'
sidebar_label: 'Object Store Data Types'
---

Spice adheres to Apache Arrow data [types](https://docs.rs/arrow/latest/arrow/datatypes/index.html). The table below lists the types of supported file type from object stores and their corresponding Apache Arrow type mappings in Spice.

## Parquet

| Parquet Physical Type  | Arrow Type                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `BOOLEAN`              | `Boolean`                                                                                    |
| `INT32`                | `Int8`/`Int16`/`Int32`/`UInt8`/`UInt16`/`UInt32`/`Date32`/`Time32`/`Decimal128`              |
| `INT64`                | `Int64`/`UInt64`/`Time64`/`Timestamp(Millisecond/Microsecond/Nanosecond, None)`/`Decimal128` |
| `INT96`                | `Timestamp(Nanosecond, None)`                                                                |
| `FLOAT`                | `Float32`                                                                                    |
| `DOUBLE`               | `Float64`                                                                                    |
| `BYTE_ARRAY`           | `LargeUtf8`/`LargeBinary`/`Decimal128`/`Decimal256`                                          |
| `FIXED_LEN_BYTE_ARRAY` | `Decimal128`/`Decimal256`/`Interval`/`Float16`/`FixedSizeBinary`                             |

Spice reads Parquet string and binary columns as `LargeUtf8` and `LargeBinary`, including when the file's embedded Arrow schema declares `Utf8` or `Binary`. To return a `Utf8` column to a client that requires one, cast it with `arrow_cast(column, 'Utf8')`.
