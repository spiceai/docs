---
title: "Data Types"
sidebar_label: "Data Types"
pagination_prev: 'reference/index'
pagination_next: null
---

Spice adheres to Apache Arrow data [types](https://docs.rs/arrow/latest/arrow/datatypes/index.html). Data accelerators do no support all Arrow data types. The table below outlines the data type compatibility for each accelerator, and datatype used within the accelerator. 

| Arrow Type          | Description                                           | DuckDB | SQLite | Postgres | 
| ------------------- | ----------------------------------------------------- | ------ | ------ | -------- |
| na                  | A NULL type having no physical storage.               |        |        |          |
| bool                | Boolean as 1 bit, LSB bit-packed ordering.            |        |        |          |
| uint8               | Unsigned 8-bit little-endian integer.                 |        |        |          |
| int8                | Signed 8-bit little-endian integer.                   |        |        |          |
| uint16              | Unsigned 16-bit little-endian integer.                |        |        |          |
| int16               | Signed 16-bit little-endian integer.                  |        |        |          |
| uint32              | Unsigned 32-bit little-endian integer.                |        |        |          |
| int32               | Signed 32-bit little-endian integer.                  |        |        |          |
| uint64              | Unsigned 64-bit little-endian integer.                |        |        |          |
| int64               | Signed 64-bit little-endian integer.                  |        |        |          |
| half_float          | 2-byte floating point value                           |        |        |          |
| float               | 4-byte floating point value                           |        |        |          |
| double              | 8-byte floating point value                           |        |        |          |
| string              | UTF8 variable-length string as List\<Char\>           |        |        |          |
| binary              | Variable-length bytes (no guarantee of UTF8-ness)     |        |        |          |
| fixed_size_binary   | Fixed-size binary. Each value occupies the same number of bytes. |        |        |          |
| date32              | int32_t days since the UNIX epoch                     |        |        |          |
| date64              | int64_t milliseconds since the UNIX epoch             |        |        |          |
| timestamp           | Exact timestamp encoded with int64 since UNIX epoch Default unit millisecond. |        |        |          |
| time32              | Time as signed 32-bit integer, representing either seconds or milliseconds since midnight. |        |        |          |
| time64              | Time as signed 64-bit integer, representing either microseconds or nanoseconds since midnight. |        |        |          |
| interval_months     | YEAR_MONTH interval in SQL style.                     |        |        |          |
| interval_day_time   | DAY_TIME interval in SQL style.                       |        |        |          |
| decimal128          | Precision- and scale-based decimal type with 128 bits. |        |        |          |
| decimal             | Defined for backward-compatibility.                   |        |        |          |
| decimal256          | Precision- and scale-based decimal type with 256 bits. |        |        |          |
| list                | A list of some logical data type.                     |        |        |          |
| struct              | Struct of logical types.                              |        |        |          |
| sparse_union        | Sparse unions of logical types.                       |        |        |          |
| dense_union         | Dense unions of logical types.                        |        |        |          |
| dictionary          | Dictionary-encoded type, also called "categorical" or "factor" in other programming languages. |        |        |          |
| map                 | Map, a repeated struct logical type.                  |        |        |          |
| extension           | Custom data type, implemented by user.                |        |        |          |
| fixed_size_list     | Fixed size list of some logical type.                 |        |        |          |
| duration            | Measure of elapsed time in either seconds, milliseconds, microseconds or nanoseconds. |        |        |          |
| large_string        | Like STRING, but with 64-bit offsets.                 |        |        |          |
| large_binary        | Like BINARY, but with 64-bit offsets.                 |        |        |          |
| large_list          | Like LIST, but with 64-bit offsets.                   |        |        |          |
| interval_month_day_nano | Calendar interval type with three fields.         |        |        |          |
| run_end_encoded     | Run-end encoded data.                                 |        |        |          |
| string_view         | String (UTF8) view type with 4-byte prefix and inline small string optimization. |        |        |          |
| binary_view         | Bytes view type with 4-byte prefix and inline small string optimization. |        |        |          |
| list_view           | A list of some logical data type represented by offset and size. |        |        |          |
| large_list_view     | Like LIST_VIEW, but with 64-bit offsets and sizes.    |        |        |          |
