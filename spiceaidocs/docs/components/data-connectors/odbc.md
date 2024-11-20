---
title: 'ODBC Data Connector'
sidebar_label: 'ODBC Data Connector'
description: 'ODBC Data Connector Documentation'
---

ODBC (Open Database Connectivity) is a standard API that allows applications to connect to and interact with various database management systems using a common interface. To connect to any ODBC database for federated/accelerated SQL queries, specify `odbc` as the selector in the `from` value for the dataset. The `odbc_connection_string` parameter is required.

:::warning

Spice must be [built with the `odbc` feature](#building-spice-with-odbc), and the host/container must have a [valid ODBC configuration](https://www.unixodbc.org/odbcinst.html).

Alternatively, use the official Spice Docker image. To use the official Spice Docker image from [DockerHub](https://hub.docker.com/r/spiceai/spiceai):

# Pull the latest official Spice image

```bash
docker pull spiceai/spiceai:latest
```

# Pull the official v0.20.0-beta Spice image

```bash
docker pull spiceai/spiceai:0.20.0-beta
```

:::

```yaml
datasets:
  - from: odbc:path.to.my_dataset
    name: my_dataset
    params:
      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value
```

An ODBC connection requires a compatible ODBC driver and valid driver configuration. ODBC drivers are available from their respective vendors. Here are a few examples:

- [PostgreSQL](https://odbc.postgresql.org/)
- [MySQL](https://dev.mysql.com/downloads/connector/odbc/)
- [Databricks](https://www.databricks.com/spark/odbc-drivers-download)
- [AWS Athena](https://docs.aws.amazon.com/athena/latest/ug/connect-with-odbc.html)

Non-Windows systems additionally require the installation of an ODBC Driver Manager like `unixodbc`.

- Ubuntu: `sudo apt-get install unixodbc`
- MacOS: `brew install unixodbc`

:::info

For the best `JOIN` performance, ensure all ODBC datasets from the same database are configured with the exact same `odbc_connection_string` in Spice.

:::

## ODBC Connection String

The ODBC connection string requires the use of an installed and registered driver based on your system type:

- Unix systems; ODBC driver installations can be managed using [unixODBC](https://www.unixodbc.org/), or directly edited through `/etc/odbc.ini` or `/etc/odbcinst.ini`. For example, in the [Databricks DSN Connection Setup Guide](https://docs.databricks.com/en/integrations/odbc/dsn.html#linux) for Linux.
- Windows systems; ODBC driver installations are managed using the [ODBC Data Source Administrator](https://support.microsoft.com/en-au/office/administer-odbc-data-sources-b19f856b-5b9b-48c9-8b93-07484bfab5a7).

For an example Unix system with an installed PostgreSQL driver where the contents of `/etc/odbcinst.ini` is:

```ini
[PostgreSQL Unicode]
Description=PostgreSQL ODBC driver (Unicode version)
Driver=psqlodbcw.so
Setup=libodbcpsqlS.so
Debug=0
CommLog=1
UsageCount=1
```

The Spice Runtime can use this driver installation where `Driver={PostgreSQL Unicode}` is used in the connection string, like:

```yaml
datasets:
  - from: odbc:my_table
    name: my_dataset
    params:
      odbc_connection_string: Driver={PostgreSQL Unicode};Server=localhost;Port=5432;Database=postgres;Uid=myuser;Pwd=mypass
```

## Configuration

### `from`

The `from` field takes the form `odbc:path.to.my.dataset` where `path.to.my.dataset` is the table name in the ODBC-supporting server to read from.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: odbc:my.cool.table
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

| Parameter                     | Type           | Description                                                                                                                                                             |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sql_dialect`                 | string         | Override what SQL dialect is used for the ODBC connection. Supports `postgresql`, `mysql`, `sqlite`, `athena` or `databricks` values. Default is unset (auto-detected). |
| `odbc_max_bytes_per_batch`    | number (bytes) | Maximum number of bytes transferred in each query record batch. A lower value may improve performance on low-memory systems. Default is `512_000_000`.                                                                                                    |
| `odbc_max_num_rows_per_batch` | number (rows)  | Maximum number of rows transferred in each query record batch. A higher value may speed up query results, but requires more memory in conjunction with `odbc_max_bytes_per_batch`. Default is `65536`.                                                                                               |
| `odbc_max_text_size`          | number (bytes) | A limit for the maximum size of text columns transmitted between the ODBC driver and the Runtime. Default is unset (allocates driver-reported max column size).                                          |
| `odbc_max_binary_size`        | number (bytes) | A limit for the maximum size of binary columns transmitted between the ODBC driver and the Runtime. Default is unset (allocates driver-reported max column size).                                        |
| `odbc_connection_string`      | string         | Connection string to use to connect to the ODBC server                                                                                                                  |

```yaml
datasets:
  - from: odbc:path.to.my_dataset
    name: my_dataset
    params:
      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value
```

## Selecting SQL Dialect

The default SQL dialect may not be supported by every ODBC connection. The `sql_dialect` parameter supports overriding the selected SQL dialect for a specified connection.

The runtime will attempt to detect the dialect to use for a connection based on the contents of `Driver=` in the `odbc_connection_string`. The runtime will detect the correct SQL dialect for the following connection types, when setup with a standard driver configuration:

- PostgreSQL
- MySQL
- SQLite
- Databricks
- AWS Athena

These connection types are also the supported values for overriding dialect in `sql_dialect`, in lowercase format: `postgresql`, `mysql`, `sqlite`, `databricks`, `athena`. For example, overriding the dialect for your connection to a `postgresql` style dialect:

```yaml
datasets:
  - from: odbc:path.to.my_dataset
    name: my_dataset
    params:
      sql_dialect: postgresql
      odbc_connection_string: Driver={Foo Driver};Host=db.foo.net;Param=Value
```

## Building Spice with ODBC

ODBC support is not included in the released binaries. To use ODBC with Spice, you need to [checkout and compile the code](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md#building) with the `--features odbc` flag (`cargo build --release --features odbc`).

Alternatively, use the official Spice Docker image. To use the official Spice Docker image from [DockerHub](https://hub.docker.com/r/spiceai/spiceai):

```bash
# Pull the latest official Spice image
docker pull spiceai/spiceai:latest

# Pull the official v0.20.0-beta Spice image
docker pull spiceai/spiceai:0.20.0-beta
```

## Baking an image with ODBC Support

There are many dozens of ODBC adapters; this recipe covers making a custom image and configuring it to work with Spice.

```Dockerfile
FROM spiceai/spiceai:latest

RUN apt update \
    && apt install --yes libsqliteodbc --no-install-recommends \
    && rm -rf /var/lib/{apt,dpkg,cache,log}
```

Build the container:

```bash
docker build -t spice-libsqliteodbc .
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

### `test.db`

To fully test the image, make an example SQLite database (`test.db`) and spicepod on your host:

```bash
$ sqlite3 test.db
SQLite version 3.43.2 2023-10-10 13:08:14
Enter ".help" for usage hints.
sqlite> create table spice_test (name text not null);
sqlite> insert into spice_test values ("Lala");
sqlite> insert into spice_test values ("Hopper");
sqlite> insert into spice_test values ("Linus");
```

### `spicepod.yaml`

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
$ docker run -p8090:8090 -p50051:50051 -v $(pwd)/spicepod.yaml:/spicepod.yaml -v $(pwd)/test.db:/test.db -it spice-libsqliteodbc --http=0.0.0.0:8090 --flight=0.0.0.0:50051
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

## Examples

### Connecting to an SQLite database

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

### Connecting to Postgres

Ensure that the Postgres ODBC driver is installed. On Unix systems, this will create an entry in `/etc/odbcinst.ini` similar to:

```ini
[PostgreSQL Unicode]
Description=PostgreSQL ODBC driver (Unicode version)
Driver=psqlodbcw.so
Setup=libodbcpsqlS.so
Debug=0
CommLog=1
UsageCount=1
```

Then, in your `spicepod.yaml` the `odbc_connection_string` parameter can be used for the ODBC connection string:

```yaml
version: v1beta1
kind: Spicepod
name: odbc-demo
datasets:
- from: odbc:taxi_trips
  name: taxi_trips
  params:
    odbc_connection_string: Driver={PostgreSQL Unicode};Server=localhost;Port=5432;Database=spice_demo;Uid=postgres
```

See the [ODBC Quickstart](https://github.com/spiceai/quickstarts/blob/trunk/odbc/README.md) for more help on getting started with ODBC and Postgres.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).
