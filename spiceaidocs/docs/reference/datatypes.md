---
title: "Data Types"
sidebar_label: "Data Types"
pagination_prev: 'reference/index'
pagination_next: null
---

Spice adheres to Apache Arrow data [types](https://docs.rs/arrow/latest/arrow/datatypes/index.html). Data accelerators do no support all Arrow data types. The table below outlines the data type compatibility for each accelerator, and datatype used within the accelerator. 

| Arrow Type               | Description                                                                  | [DuckDB](https://duckdb.org/docs/sql/data_types/overview) | [SQLite](https://sqlite.org/datatype3.html) | [Postgres](https://www.postgresql.org/docs/current/datatype.html#DATATYPE-TABLE) |
|--------------------------|------------------------------------------------------------------------------|-------------------------------|-------------------|--------------------|
| na                       | A NULL type having no physical storage.                                      |                               |                   |                    |
| bool                     | Boolean as 1 bit, LSB bit-packed ordering.                                   | `BOOLEAN`                     | `BOOL`            |  `BOOL`            |
| uint8                    | Unsigned 8-bit little-endian integer.                                        | `TINYINT`                     | `TINYINT`         | `SMALLINT`         |
| int8                     | Signed 8-bit little-endian integer.                                          | `TINYINT`                     | `TINYINT`         | `SMALLINT`         |
| uint16                   | Unsigned 16-bit little-endian integer.                                       | `SMALLINT`                    | `SMALLINT`        | `SMALLINT`         |
| int16                    | Signed 16-bit little-endian integer.                                         | `SMALLINT`                    | `SMALLINT`        | `SMALLINT`         |
| uint32                   | Unsigned 32-bit little-endian integer.                                       | `INTEGER`                     | `INT`             | `INTEGER`          |
| int32                    | Signed 32-bit little-endian integer.                                         | `INTEGER`                     | `INT`             | `INTEGER`          |
| uint64                   | Unsigned 64-bit little-endian integer.                                       | `BIGINT`                      | `BIGINT`          | `BIGINT`           |
| int64                    | Signed 64-bit little-endian integer.                                         | `BIGINT`                      | `BIGINT`          | `BIGINT`           |
| half_float               | 2-byte floating point value                                                  |                               |                   |                    |
| float                    | 4-byte floating point value                                                  | `FLOAT`                       | `FLOAT`           | `REAL`             |
| double                   | 8-byte floating point value                                                  | `DOUBLE`                      | `DOUBLE`          | `DOUBLE PRECISION` |
| string                   | UTF8 variable-length string as List\<Char\>                                  | `VARCHAR`                     | `TEXT`            | `TEXT`             |
| binary                   | Variable-length bytes (no guarantee of UTF8-ness)                            |                               |                   |                    |
| fixed_size_binary        | Each value has equal bytes of binary.                                        |                               |                   |                    |
| date32                   | int32_t days since the UNIX epoch                                            | `DATE`                        | `DATE`            |                    |
| date64                   | int64_t milliseconds since the UNIX epoch                                    | `DATE`                        | `TIMESTAMP`       |                    |
| timestamp                | Exact timestamp encoded with int64 since UNIX epoch, seconds or milliseconds | `TIMESTAMP_S`, `TIMESTAMP_MS` | `TIMESTAMP`       | `TIMESTAMP`        |
| time32                   | Time as signed 32-bit integer, seconds or milliseconds since midnight.       | `TIME`                        | `TIME`            |                    |
| time64                   | Time as signed 64-bit integer, microseconds or nanoseconds since midnight.   | `TIME`                        | `TIME`            |                    |
| interval_months          | YEAR_MONTH interval in SQL style.                                            |                               |                   |                    |
| interval_day_time        | DAY_TIME interval in SQL style.                                              |                               |                   |                    |
| decimal128               | Precision- and scale-based decimal type with 128 bits.                       | `DOUBLE`                      | `DECIMAL(38, 10)` | `DECIMAL(38, 10)`  |
| decimal                  | Defined for backward-compatibility.                                          |                               |                   |                    |
| decimal256               | Precision- and scale-based decimal type with 256 bits.                       |                               |                   |                    |
| list                     | A list of some logical data type.                                            |                               |                   | `TYPE[]`           |
| struct                   | Struct of logical types.                                                     |                               |                   |                    |
| sparse_union             | Sparse unions of logical types.                                              |                               |                   |                    |
| dense_union              | Dense unions of logical types.                                               |                               |                   |                    |
| dictionary               | Dictionary-encoded type,                                                     |                               |                   |                    |
| map                      | Map, a repeated struct logical type.                                         |                               |                   |                    |
| extension                | Custom data type, implemented by user.                                       |                               |                   |                    |
| fixed_size_list          | Fixed size list of some logical type.                                        |                               |                   |                    |
| duration                 | Elapsed time in seconds, milliseconds, microseconds or nanoseconds.          |                               |                   |                    |
| large_string             | Like STRING, but with 64-bit offsets.                                        |                               |                   |                    |
| large_binary             | Like BINARY, but with 64-bit offsets.                                        |                               |                   |                    |
| large_list               | Like LIST, but with 64-bit offsets.                                          |                               |                   |                    |
| interval_month_day_nano  | Calendar interval type with three fields.                                    |                               |                   |                    |
| run_end_encoded          | Run-end encoded data.                                                        |                               |                   |                    |
| string_view              | UTF8 view type with 4-byte prefix & inline small string optimization.        |                               |                   |                    |
| binary_view              | Bytes view type with 4-byte prefix and inline small string optimization.     |                               |                   |                    |
| list_view                | A list of some logical data type represented by offset and size.             |                               |                   |                    |
| large_list_view          | Like LIST_VIEW, but with 64-bit offsets and sizes.                           |                               |                   |                    |

Note: Where `TYPE` is used (e.g. `TYPE[]`), it refers an established supported type for the specific data accelerator (e.g. `INTEGER[]`). 

