---
title: 'Data Connectors'
sidebar_label: 'Data Connectors'
description: 'Learn how to use Data Connector to query external data.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication.

Currently supported Data Connectors include:

| Name            | Description   | Status            | Protocol/Format                     | Refresh Modes               | Supports [Ingestion][ingestion] | Supports Documents |
| --------------- | ------------- | ----------------- | ----------------------------------- | --------------------------- | ------------------------------- | ------------------ |
| `github`        | GitHub        | Release Candidate | GraphQL, REST                       | `append`, `full`            | ❌                             | ❌                 |
| `mysql`         | MySQL         | Release Candidate |                                     | `append`, `full`            | Roadmap                         | ❌                 |
| `databricks`    | Databricks    | Beta              | Spark Connect <br/> S3 / Delta Lake | `append`, `full`            | Roadmap                         | ❌                 |
| `delta_lake`    | Delta Lake    | Beta              | Delta Lake                          | `append`, `full`            | Roadmap                         | ❌                 |
| `flightsql`     | FlightSQL     | Beta              | Arrow Flight SQL                    | `append`, `full`            | ❌                             | ❌                 |
| `odbc`          | ODBC          | Beta              |                                     | `append`, `full`            | ❌                             | ❌                 |
| `postgres`      | PostgreSQL    | Beta              |                                     | `append`, `full`            | Roadmap                         | ❌                 |
| `s3`            | S3            | Beta              | Parquet, CSV                        | `append`, `full`            | Roadmap                         | ✅                 |
| `spiceai`       | Spice.ai      | Beta              | Arrow Flight                        | `append`, `full`            | ✅                             | ❌                 |
| `abfs`          | Azure BlobFS  | Alpha             | Parquet, CSV                        | `append`, `full`            | Roadmap                         | ✅                 |
| `clickhouse`    | Clickhouse    | Alpha             |                                     | `append`, `full`            | ❌                             | ❌                 |
| `debezium`      | Debezium      | Alpha             | CDC, Kafka                          | `append`, `full`, `changes` | ❌                             | ❌                 |
| `dremio`        | Dremio        | Alpha             | Arrow Flight SQL                    | `append`, `full`            | ❌                             | ❌                 |
| `duckdb`        | DuckDB        | Alpha             |                                     | `append`, `full`            | ❌                             | ❌                 |
| `file`          | File          | Alpha             | Parquet, CSV                        | `append`, `full`            | Roadmap                         | ✅                 |
| `ftp`, `sftp`   | FTP/SFTP      | Alpha             | Parquet, CSV                        | `append`, `full`            | ❌                             | ✅                 |
| `graphql`       | GraphQL       | Alpha             | GraphQL                             | `append`, `full`            | ❌                             | ❌                 |
| `http`, `https` | HTTP(s)       | Alpha             | Parquet, CSV                        | `append`, `full`            | ❌                             | ❌                 |
| `mssql`         | MS SQL Server | Alpha             | Tabular Data Stream (TDS)           | `append`, `full`            | ❌                             | ❌                 |
| `sharepoint`    | SharePoint    | Alpha             |                                     | `append`, `full`            | ❌                             | ✅                 |
| `snowflake`     | Snowflake     | Alpha             | Arrow                               | `append`, `full`            | Roadmap                         | ❌                 |
| `spark`         | Spark         | Alpha             | Spark Connect                       | `append`, `full`            | ❌                             | ❌                 |

[ingestion]: https://docs.spiceai.org/features/data-ingestion

## Object Store File Formats

For data connectors that are object store compatible, if a folder is provided, the file format must be specified with `params.file_format`.

If a file is provided, the file format will be inferred, and `params.file_format` is unnecessary.

File formats currently supported are:

| Name                                          | Parameter              | Supported | Is Document Format |
| --------------------------------------------- | ---------------------- | --------- | ------------------ |
| [Apache Parquet](https://parquet.apache.org/) | `file_format: parquet` | ✅        | ❌                 |
| [CSV](/reference/file_format.md#csv)          | `file_format: csv`     | ✅        | ❌                 |
| [Apache Iceberg](https://iceberg.apache.org/) | `file_format: iceberg` | Roadmap   | ❌                 |
| JSON                                          | `file_format: json`    | Roadmap   | ❌                 |
| Microsoft Excel                               | `file_format: xlsx`    | Roadmap   | ❌                 |
| Markdown                                      | `file_format: md`      | ✅        | ✅                 |
| Text                                          | `file_format: txt`     | ✅        | ✅                 |
| PDF                                           | `file_format: pdf`     | Alpha     | ✅                 |
| Microsoft Word                                | `file_format: docx`    | Alpha     | ✅                 |

File formats support additional parameters in the `params` (like `csv_has_header`) described in [File Formats](/reference/file_format)

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
