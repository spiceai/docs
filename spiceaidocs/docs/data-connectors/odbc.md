---
title: 'ODBC Data Connector'
sidebar_label: 'ODBC Data Connector'
description: 'ODBC Data Connector Documentation'
---

## Federated SQL query

To connect to any ODBC database for federated SQL queries, specify `odbc` as the selector in the `from` value for the dataset. The `odbc_connection_string` parameter is required. Spice must be built with the `odbc` feature, and the host/container must have a [valid ODBC configuration](https://www.unixodbc.org/odbcinst.html).

```yaml
datasets:
  - from: odbc:path.to.my_dataset
    name: my_dataset
    params:
      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value
```

## Dataset Configuration

In addition to the connection string, the following [arrow_odbc builder parameters](https://docs.rs/arrow-odbc/latest/arrow_odbc/struct.OdbcReaderBuilder.html) are exposed as params:

| Parameter               | Type           | Description                                                                                                                                                                                      | Default                                           |
|-------------------------|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| max_bytes_per_batch     | number (bytes) | Upper allocation limit for transit buffer.                                                                                                                                                       | `512_000_000`                                     |
| max_num_rows_per_batch  | number (rows)  | Upper limit for number of rows fetched for one batch.                                                                                                                                            | `65536`                                           |
| max_text_size           | number (bytes) | Upper limit for value buffers bound to columns with text values.                                                                                                                                 | Unset (allocates driver-reported max column size) |
| max_binary_size         | number (bytes) | Upper limit for value buffers bound to columns with binary values.                                                                                                                               | Unset (allocates driver-reported max column size) |
| enable_db2_length_quirk | bool           | If connecting to IBM DB2, enable a [quirk](https://docs.rs/arrow-odbc/latest/arrow_odbc/struct.Quirks.html#structfield.indicators_returned_from_bulk_fetch_are_memory_garbage) to avoid crashing | `false`                                           |

```yaml
datasets:
  - from: odbc:path.to.my_dataset
    name: my_dataset
    params:
      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value
        max_bytes_per_batch: 5000000000
        max_binary_size: 256000000
        max_text_size: 256000000
        max_rows_per_batch: 5
```
