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

## Configuration

In addition to the connection string, the following [arrow_odbc builder parameters](https://docs.rs/arrow-odbc/latest/arrow_odbc/struct.OdbcReaderBuilder.html) are exposed as params:

| Parameter               | Type           | Description                                                                                                                                                                                      | Default                                           |
|-------------------------|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| max_bytes_per_batch     | number (bytes) | Upper allocation limit for transit buffer.                                                                                                                                                       | `512_000_000`                                     |
| max_num_rows_per_batch  | number (rows)  | Upper limit for number of rows fetched for one batch.                                                                                                                                            | `65536`                                           |
| max_text_size           | number (bytes) | Upper limit for value buffers bound to columns with text values.                                                                                                                                 | Unset (allocates driver-reported max column size) |
| max_binary_size         | number (bytes) | Upper limit for value buffers bound to columns with binary values.                                                                                                                               | Unset (allocates driver-reported max column size) |
| enable_db2_length_quirk | bool           | If connecting to IBM DB2, enable a [quirk](https://docs.rs/arrow-odbc/latest/arrow_odbc/struct.Quirks.html#structfield.indicators_returned_from_bulk_fetch_are_memory_garbage) to avoid crashing.| `false`                                           |

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

## Baking an image with ODBC Support

There are many dozens of ODBC adapters; this recipe covers making your own image and configuring it to work with Spice.

```Dockerfile
FROM spiceai/spiceai:latest

RUN apt update \
    && apt install --yes libsqliteodbc --no-install-recommends \
    && rm -rf /var/lib/{apt,dpkg,cache,log}
```

Build the container:

```bash
docker build -t spice-libsqliteodbc .
docker run --entrypoint /bin/bash -it spice-libsqliteodbc
```

Validate that the ODBC configuration was updated to reference the newly installed driver:


:::warning[Note]
Since `libsqliteodbc` is vendored by Debian, the package install hooks append the driver configuration to `/etc/odbcinst.ini`. When using a custom driver (e.g. [Databricks Simba](https://www.databricks.com/spark/odbc-drivers-download)), it is your responsibility to update `/etc/odbcinst.ini` to point at the location of the newly installed driver.
:::


```bash
$ docker run --entrypoint /bin/bash -it spice-libsqliteodbc

root@f8ceccc94d6a:/# odbcinst -j
unixODBC 2.3.11
DRIVERS............: /etc/odbcinst.ini
SYSTEM DATA SOURCES: /etc/odbc.ini
FILE DATA SOURCES..: /etc/ODBCDataSources
USER DATA SOURCES..: /root/.odbc.ini
SQLULEN Size.......: 8
SQLLEN Size........: 8
SQLSETPOSIROW Size.: 8

root@f8ceccc94d6a:/# cat /etc/odbcinst.ini
[SQLite]
Description=SQLite ODBC Driver
Driver=libsqliteodbc.so
Setup=libsqliteodbc.so
UsageCount=1

[SQLite3]
Description=SQLite3 ODBC Driver
Driver=libsqlite3odbc.so
Setup=libsqlite3odbc.so
UsageCount=1
```

To fully test the image, make an example SQLite database (`test.db`) and spicepod on your host:

###### `test.db`

```bash
$ sqlite3 test.db
SQLite version 3.43.2 2023-10-10 13:08:14
Enter ".help" for usage hints.
sqlite> create table spice_test (name text not null);
sqlite> insert into spice_test values ("Lala");
sqlite> insert into spice_test values ("Hopper");
sqlite> insert into spice_test values ("Linus");
```

###### `spicepod.yaml`

Make sure that the `DRIVER` parameter matches the name of the driver section in `odbcinst.ini`.

```yaml
version: v1beta1
kind: Spicepod
name: sqlite
datasets:
- from: odbc:spice_test
  name: spice_test
  mode: read
  acceleration:
    enabled: false
  params:
    odbc_connection_string: DRIVER={SQLite3};SERVER=localhost;DATABASE=test.db;Trusted_connection=yes
```

All together now:

```bash
$ docker run -p3000:3000 -p50051:50051 -v $(pwd)/spicepod.yaml:/spicepod.yaml -v $(pwd)/test.db:/test.db -it spice-libsqliteodbc --http=0.0.0.0:3000 --flight=0.0.0.0:50051
$ spice sql

Welcome to the interactive Spice.ai SQL Query Utility! Type 'help' for help.

show tables; -- list available tables
sql> show tables;
+------------+
| table_name |
+------------+
| spice_test |
+------------+

Query took: 0.059305583 seconds. 1/1 rows displayed.
sql> select * from spice_test;
+--------+
| name   |
+--------+
| Hopper |
| Lala   |
| Linus  |
+--------+

Query took: 1.8504053329999999 seconds. 3/3 rows displayed.
```
