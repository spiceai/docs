---
description: Learn how to use Data Connector to query external data.
---

# Data Connectors

Data Connectors provide connections to databases, data warehouses, and data lakes for federated SQL queries and data replication.

Supported Data Connectors include:

| Name                               | Description          | Protocol/Format              |
| ---------------------------------- | -------------------- | ---------------------------- |
| `databricks (mode: delta_lake)`    | Databricks           | S3/Delta Lake                |
| `delta_lake`                       | Delta Lake           | Delta Lake                   |
| `dremio`                           | Dremio               | Arrow Flight                 |
| `duckdb`                           | DuckDB               | Embedded                     |
| `github`                           | GitHub               | GitHub API                   |
| `postgres`                         | PostgreSQL           |                              |
| `s3`                               | S3                   | Parquet, CSV                 |
| `mysql`                            | MySQL                |                              |
| `delta_lake`                       | Delta Lake           | Delta Lake                   |
| `graphql`                          | GraphQL              | JSON                         |
| `databricks (mode: spark_connect)` | Databricks           | Spark Connect                |
| `flightsql`                        | FlightSQL            | Arrow Flight SQL             |
| `mssql`                            | Microsoft SQL Server | Tabular Data Stream (TDS)    |
| `snowflake`                        | Snowflake            | Arrow                        |
| `spark`                            | Spark                | Spark Connect                |
| `spice.ai`                         | Spice.ai             | Arrow Flight                 |
| `iceberg`                          | Apache Iceberg       | Parquet                      |
| `abfs`                             | Azure BlobFS         | Parquet, CSV                 |
| `clickhouse`                       | Clickhouse           |                              |
| `debezium`                         | Debezium CDC         | Kafka + JSON                 |
| `dynamodb`                         | DynamoDB             |                              |
| `ftp`, `sftp`                      | FTP/SFTP             | Parquet, CSV                 |
| `http`, `https`                    | HTTP(s)              | Parquet, CSV                 |
| `sharepoint`                       | Microsoft SharePoint | Unstructured UTF-8 documents |

## Object Store File Formats

For data connectors that are object store compatible, if a folder is provided, the file format must be specified with `params.file_format`.

If a file is provided, the file format will be inferred, and `params.file_format` is unnecessary.

File formats currently supported are:

| Name                                           | Parameter              | Supported | Is Document Format |
| ---------------------------------------------- | ---------------------- | --------- | ------------------ |
| [Apache Parquet](https://parquet.apache.org/)  | `file_format: parquet` | ✅         | ❌                  |
| [CSV](../../docs/reference/file_format.md#csv) | `file_format: csv`     | ✅         | ❌                  |
| [Apache Iceberg](https://iceberg.apache.org/)  | `file_format: iceberg` | Roadmap   | ❌                  |
| JSON                                           | `file_format: json`    | Roadmap   | ❌                  |
| Microsoft Excel                                | `file_format: xlsx`    | Roadmap   | ❌                  |
| Markdown                                       | `file_format: md`      | ✅         | ✅                  |
| Text                                           | `file_format: txt`     | ✅         | ✅                  |
| PDF                                            | `file_format: pdf`     | Alpha     | ✅                  |
| Microsoft Word                                 | `file_format: docx`    | Alpha     | ✅                  |

File formats support additional parameters in the `params` (like `csv_has_header`) described in [File Formats](../../docs/reference/file_format/)

If a format is a document format, each file will be treated as a document, as per [document support](./#document-support) below.

:::info
**Note** Document formats in Alpha (e.g. pdf, docx) may not parse all structure or text from the underlying documents correctly.
:::
