---
title: 'Data Connectors'
sidebar_label: 'Data Connectors'
description: ''
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication.

Currently supported Data Connectors include:

| Name            | Description | Status | Protocol/Format                     | Refresh Modes    | Supports Inserts | Supports Documents |
| --------------- | ----------- | ------ | ----------------------------------- | ---------------- | ---------------- | ------------------ |
| `clickhouse`    | Clickhouse  | Alpha  |                                     | `full`           | ❌               | ❌                |
| `databricks`    | Databricks  | Alpha  | Spark Connect <br/> S3 / Delta Lake | `full`           | ❌               | ❌                |
| `delta_lake`    | Delta Lake  | Alpha  | Delta Lake                          | `full`           | ❌               | ❌                |
| `dremio`        | Dremio      | Alpha  | Arrow Flight SQL                    | `full`           | ❌               | ❌                |
| `file`          | File        | Alpha  | Parquet, CSV                        | `full`           | ❌               | ✅                |
| `flightsql`     | FlightSQL   | Alpha  | Arrow Flight SQL                    | `full`           | ❌               | ❌                |
| `ftp`, `sftp`   | FTP/SFTP    | Alpha  | Parquet, CSV                        | `full`           | ❌               | ✅                |
| `graphql`       | GraphQL     | Alpha  | GraphQL                             | `full`           | ❌               | ❌                |
| `github`        | GitHub      | Alpha  | GraphQL, REST                       | `full`           | ❌               | ❌                |
| `http`, `https` | HTTP(s)     | Alpha  | Parquet, CSV                        | `full`           | ❌               | ❌                |
| `mysql`         | MySQL       | Alpha  |                                     | `full`           | ❌               | ❌                |
| `odbc`          | ODBC        | Alpha  | ODBC                                | `full`           | ❌               | ❌                |
| `postgres`      | PostgreSQL  | Alpha  |                                     | `full`           | ❌               | ❌                |
| `snowflake`     | Snowflake   | Alpha  | Arrow                               | `full`           | ❌               | ❌                |
| `spiceai`       | Spice.ai    | Alpha  | Arrow Flight                        | `append`, `full` | ✅               | ❌                |
| `s3`            | S3          | Alpha  | Parquet, CSV                        | `full`           | ❌               | ✅                |
| `sharepoint`    | SharePoint  | Alpha  |                                     | `full`           | ❌               | ✅                |
| `spark`         | Spark       | Alpha  | Spark Connect                       | `full`           | ❌               | ❌                |

## Object Store File Formats
For data connectors that are object store compatible, if a folder is provided, the file format must be specified with `params.file_format`. This is unnecessary for a single file.

File formats currently supported are:

| Name                                          | Parameter               | Supported | Is Document Format |
| --------------------------------------------- | ----------------------- | --------- | ------------------ |
| [Apache Parquet](https://parquet.apache.org/) | `file_format: parquet`  | ✅        | ❌                |
| [CSV](/reference/file_format.md#csv)          | `file_format: csv`      | ✅        | ❌                |
| [Apache Iceberg](https://iceberg.apache.org/) | `file_format: iceberg`  | Roadmap   | ❌                |
| JSON                                          | `file_format: json`     | Roadmap   | ❌                |
| Microsoft Excel                               | `file_format: xlsx`     | Roadmap   | ❌                |
| Markdown                                      | `file_format: md`       | Roadmap   | ✅                |
| Text                                          | `file_format: txt`      | Roadmap   | ✅                |
| PDF                                           | `file_format: pdf`      | Roadmap   | ✅                |
| Microsoft Word                                | `file_format: doc`      | Roadmap   | ✅                |

File formats support additional parameters in the `params` (like `csv_has_header`) described in [File Formats](/reference/file_format)

If a format is a document format, each file will be treated as a document, as per [document support](#document-support) below.

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
