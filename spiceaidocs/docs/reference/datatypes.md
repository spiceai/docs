---
title: "Data Types"
sidebar_label: "Data Types"
pagination_prev: 'reference/index'
pagination_next: null
---

Spice adheres to Apache Arrow data [types](https://docs.rs/arrow/latest/arrow/datatypes/index.html). Data accelerators do no support all Arrow data types. The table below outlines the data type compatibility for each accelerator, and datatype used within the accelerator. 

| Datatype | Description | Arrow | DuckDB | SQLite | Postgres|
| --- | --- | --- | --- | --- | ---|
| na | A NULL type having no physical storage. | na | | | |
| bool | Boolean as 1 bit, LSB bit-packed ordering. | bool | | | |
| uint8 | Unsigned 8-bit little-endian integer. | uint8 | | | |
| int8 | Signed 8-bit little-endian integer. | int8 | | | |
| uint16 | Unsigned 16-bit little-endian integer. | uint16 | | | |
| int16 | Signed 16-bit little-endian integer. | int16 | | | |
| uint32 | Unsigned 32-bit little-endian integer. | uint32 | | | |
| int32 | Signed 32-bit little-endian integer. | int32 | | | |
| uint64 | Unsigned 64-bit little-endian integer. | uint64 | | | |
| int64 | Signed 64-bit little-endian integer. | int64 | | | |
| half_float | 2-byte floating point value | half_float | | | |
| float | 4-byte floating point value | float | | | |
| double | 8-byte floating point value | double | | | |
| string | UTF8 variable-length string as List\<Char\> | string | | | |
| binary | Variable-length bytes (no guarantee of UTF8-ness) | binary | | | |
| fixed_size_binary | Fixed-size binary. Each value occupies the same number of bytes. | fixed_size_binary | | | |
| date32 | int32_t days since the UNIX epoch | date32 | | | |
| date64 | int64_t milliseconds since the UNIX epoch | date64 | | | |
| timestamp | Exact timestamp encoded with int64 since UNIX epoch Default unit millisecond. | timestamp | | | |
| time32 | Time as signed 32-bit integer, representing either seconds or milliseconds since midnight. | time32 | | | |
| time64 | Time as signed 64-bit integer, representing either microseconds or nanoseconds since midnight. | time64 | | | |
| interval_months | YEAR_MONTH interval in SQL style. | interval_months | | | |
| interval_day_time | DAY_TIME interval in SQL style. | interval_day_time | | | |
| decimal128 | Precision- and scale-based decimal type with 128 bits. | decimal128 | | | |
| decimal | Defined for backward-compatibility. | decimal | | | |
| decimal256 | Precision- and scale-based decimal type with 256 bits. | decimal256 | | | |
| list | A list of some logical data type. | list | | | |
| struct | Struct of logical types. | struct | | | |
| sparse_union | Sparse unions of logical types. | sparse_union | | | |
| dense_union | Dense unions of logical types. | dense_union | | | |
| dictionary | Dictionary-encoded type, also called "categorical" or "factor" in other programming languages. | dictionary | | | |
| map | Map, a repeated struct logical type. | map | | | |
| extension | Custom data type, implemented by user. | extension | | | |
| fixed_size_list | Fixed size list of some logical type. | fixed_size_list | | | |
| duration | Measure of elapsed time in either seconds, milliseconds, microseconds or nanoseconds. | duration | | | |
| large_string | Like STRING, but with 64-bit offsets. | large_string | | | |
| large_binary | Like BINARY, but with 64-bit offsets. | large_binary | | | |
| large_list | Like LIST, but with 64-bit offsets. | large_list | | | |
| interval_month_day_nano | Calendar interval type with three fields. | interval_month_day_nano | | | |
| run_end_encoded | Run-end encoded data. | run_end_encoded | | | |
| string_view | String (UTF8) view type with 4-byte prefix and inline small string optimization. | string_view | | | |
| binary_view | Bytes view type with 4-byte prefix and inline small string optimization. | binary_view | | | |
| list_view | A list of some logical data type represented by offset and size. | list_view | | | |
| large_list_view | Like LIST_VIEW, but with 64-bit offsets and sizes. | large_list_view | | | |