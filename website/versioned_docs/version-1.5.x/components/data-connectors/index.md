---
title: 'Data Connectors'
sidebar_label: 'Data Connectors'
description: 'Learn how to use Data Connector to query external data.'
image: /img/og/data-connectors.png
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - overview
  - federation
---

Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication.

Supported Data Connectors include:

| Name                               | Description                           | Status            | Protocol/Format              |
| ---------------------------------- | ------------------------------------- | ----------------- | ---------------------------- |
| `databricks (mode: delta_lake)`    | [Databricks][databricks]              | Stable            | S3/Delta Lake                |
| `delta_lake`                       | Delta Lake                            | Stable            | Delta Lake                   |
| `dremio`                           | [Dremio][dremio]                      | Stable            | Arrow Flight                 |
| `duckdb`                           | DuckDB                                | Stable            | Embedded                     |
| `file`                             | File                                  | Stable            | Parquet, CSV                 |
| `github`                           | GitHub                                | Stable            | GitHub API                   |
| `postgres`                         | PostgreSQL                            | Stable            |                              |
| `s3`                               | [S3][s3]                              | Stable            | Parquet, CSV                 |
| `mysql`                            | MySQL                                 | Stable            |                              |
| `delta_lake`                       | Delta Lake                            | Stable            | Delta Lake                   |
| `spice.ai`                         | [Spice.ai][spiceai]                   | Stable            | Arrow Flight                 |
| `graphql`                          | GraphQL                               | Release Candidate | JSON                         |
| `databricks (mode: spark_connect)` | [Databricks][databricks]              | Beta              | [Spark Connect][spark]       |
| `flightsql`                        | FlightSQL                             | Beta              | Arrow Flight SQL             |
| `mssql`                            | Microsoft SQL Server                  | Beta              | Tabular Data Stream (TDS)    |
| `odbc`                             | ODBC                                  | Beta              | ODBC                         |
| `snowflake`                        | Snowflake                             | Beta              | Arrow                        |
| `spark`                            | Spark                                 | Beta              | [Spark Connect][spark]       |
| `iceberg`                          | [Apache Iceberg][iceberg]             | Beta              | Parquet                      |
| `abfs`                             | Azure BlobFS                          | Alpha             | Parquet, CSV                 |
| `clickhouse`                       | Clickhouse                            | Alpha             |                              |
| `debezium`                         | Debezium CDC                          | Alpha             | Kafka + JSON                 |
| `dynamodb`                         | DynamoDB                              | Alpha             |                              |
| `ftp`, `sftp`                      | FTP/SFTP                              | Alpha             | Parquet, CSV                 |
| `glue`                             | [Glue][glue]                          | Alpha             | Iceberg, Parquet, CSV        |
| `http`, `https`                    | HTTP(s)                               | Alpha             | Parquet, CSV                 |
| `imap`                             | IMAP                                  | Alpha             | IMAP Emails                  |
| `localpod`                         | [Local dataset replication][localpod] | Alpha             |                              |
| `oracle`                           | Oracle                                | Alpha             | [Oracle ODPI-C][ODPIC]       |
| `sharepoint`                       | Microsoft SharePoint                  | Alpha             | Unstructured UTF-8 documents |
| `elasticsearch`                    | ElasticSearch                         | Roadmap           |                              |
| `mongodb`                          | MongoDB                               | Roadmap           |                              |

[databricks]: https://github.com/spiceai/cookbook/tree/trunk/databricks/delta_lake
[spark]: https://spark.apache.org/docs/latest/spark-connect-overview.html
[s3]: https://github.com/spiceai/cookbook/tree/trunk/s3#readme
[spiceai]: https://github.com/spiceai/cookbook/tree/trunk/spiceai#readme
[dremio]: https://github.com/spiceai/cookbook/tree/trunk/dremio#readme
[localpod]: https://github.com/spiceai/cookbook/blob/trunk/localpod/README.md
[iceberg]: https://github.com/spiceai/cookbook/tree/trunk/catalogs/iceberg#readme
[glue]: https://github.com/spiceai/cookbook/tree/trunk/glue/README.md
[ODPIC]: https://oracle.github.io/odpi/

## Object Store File Formats

For data connectors that are object store compatible, if a folder is provided, the file format must be specified with `params.file_format`.

If a file is provided, the file format will be inferred, and `params.file_format` is unnecessary.

File formats currently supported are:

| Name                                          | Parameter              | Supported | Is Document Format |
| --------------------------------------------- | ---------------------- | --------- | ------------------ |
| [Apache Parquet](https://parquet.apache.org/) | `file_format: parquet` | ✅        | ❌                 |
| [CSV](../../reference/file_format.md#csv)     | `file_format: csv`     | ✅        | ❌                 |
| [Apache Iceberg](https://iceberg.apache.org/) | `file_format: iceberg` | Roadmap   | ❌                 |
| JSON                                          | `file_format: json`    | Roadmap   | ❌                 |
| Microsoft Excel                               | `file_format: xlsx`    | Roadmap   | ❌                 |
| Markdown                                      | `file_format: md`      | ✅        | ✅                 |
| Text                                          | `file_format: txt`     | ✅        | ✅                 |
| PDF                                           | `file_format: pdf`     | Alpha     | ✅                 |
| Microsoft Word                                | `file_format: docx`    | Alpha     | ✅                 |

File formats support additional parameters in the `params` (like `csv_has_header`) described in [File Formats](../../reference/file_format)

If a format is a document format, each file will be treated as a document, as per [document support](#document-support) below.

:::warning[Note]
Document formats in Alpha (e.g. pdf, docx) may not parse all structure or text from the underlying documents correctly.
:::

### Document Support

If a Data Connector supports documents, when the appropriate file format is specified (see [above](#object-store-file-formats)), each file will be treated as a row in the table, with the contents of the file within the `content` column. Additional columns will exist, dependent on the data connector.

#### Example

Consider a local filesystem

```shell
>>> ls -la
total 232
drwxr-sr-x@ 22 jeadie  staff    704 30 Jul 13:12 .
drwxr-sr-x@ 18 jeadie  staff    576 30 Jul 13:12 ..
-rw-r--r--@  1 jeadie  staff   1329 15 Jan  2024 DR-000-Template.md
-rw-r--r--@  1 jeadie  staff   4966 11 Aug  2023 DR-001-Dremio-Architecture.md
-rw-r--r--@  1 jeadie  staff   2307 28 Jul  2023 DR-002-Data-Completeness.md
```

And the spicepod

```yaml
datasets:
  - name: my_documents
    from: file:docs/decisions/
    params:
      file_format: md
```

A Document table will be created.

```shell
>>> SELECT * FROM my_documents LIMIT 3
+----------------------------------------------------+--------------------------------------------------+
| location                                           | content                                          |
+----------------------------------------------------+--------------------------------------------------+
| Users/docs/decisions/DR-000-Template.md            | # DR-000: DR Template                            |
|                                                    | **Date:** <>                                     |
|                                                    | **Decision Makers:**                             |
|                                                    | - @<>                                            |
|                                                    | - @<>                                            |
|                                                    | ...                                              |
| Users/docs/decisions/DR-001-Dremio-Architecture.md | # DR-001: Add "Cached" Dremio Dataset            |
|                                                    |                                                  |
|                                                    | ## Context                                       |
|                                                    |                                                  |
|                                                    | We use [Dremio](https://www.dremio.com/) to p... |
| Users/docs/decisions/DR-002-Data-Completeness.md   | # DR-002: Append-Only Data Completeness          |
|                                                    |                                                  |
|                                                    | ## Context                                       |
|                                                    |                                                  |
|                                                    | Our Ethereum append-only dataset is incomple...  |
+----------------------------------------------------+--------------------------------------------------+
```

## Data Connector Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
