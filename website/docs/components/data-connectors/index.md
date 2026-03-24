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

Each connector is configured using the `from` field in a dataset definition. For example:

```yaml
datasets:
  - from: postgres:public.orders    # Database connector
    name: orders
    params:
      pg_host: localhost
      pg_db: mydb
      pg_user: reader
      pg_pass: ${secrets:PG_PASS}

  - from: s3://my-bucket/events/    # Object storage connector
    name: events
    params:
      file_format: parquet
      s3_auth: iam_role
```

Supported Data Connectors include:

| Name                               | Description                           | Status            | Protocol/Format              |
| ---------------------------------- | ------------------------------------- | ----------------- | ---------------------------- |
| `postgres`                         | PostgreSQL, Amazon Redshift           | Stable            | PostgreSQL-wire              |
| `mysql`                            | MySQL                                 | Stable            |                              |
| `s3`                               | [S3][s3]                              | Stable            | Parquet, CSV, JSON           |
| `file`                             | File                                  | Stable            | Parquet, CSV, JSON           |
| `duckdb`                           | DuckDB                                | Stable            | Embedded                     |
| `dremio`                           | [Dremio][dremio]                      | Stable            | Arrow Flight                 |
| `spice.ai`                         | [Spice.ai OSS & Cloud][spiceai]       | Stable            | Arrow Flight                 |
| `databricks (mode: delta_lake)`    | [Databricks][databricks]              | Stable            | S3/Delta Lake                |
| `delta_lake`                       | Delta Lake                            | Stable            | Delta Lake                   |
| `github`                           | GitHub                                | Stable            | GitHub API                   |
| `graphql`                          | GraphQL                               | Release Candidate | JSON                         |
| `dynamodb`                         | DynamoDB                              | Release Candidate |                              |
| `databricks (mode: spark_connect)` | [Databricks][databricks]              | Beta              | [Spark Connect][spark]       |
| `flightsql`                        | FlightSQL                             | Beta              | Arrow Flight SQL             |
| `mssql`                            | Microsoft SQL Server                  | Beta              | Tabular Data Stream (TDS)    |
| `odbc`                             | ODBC                                  | Beta              | ODBC                         |
| `snowflake`                        | Snowflake                             | Beta              | Arrow                        |
| `spark`                            | Spark                                 | Beta              | [Spark Connect][spark]       |
| `iceberg`                          | [Apache Iceberg][iceberg]             | Stable            | Parquet                      |
| `abfs`                             | Azure BlobFS                          | Alpha             | Parquet, CSV, JSON           |
| `ftp`, `sftp`                      | FTP/SFTP                              | Alpha             | Parquet, CSV, JSON           |
| `smb`                              | SMB                                   | Alpha             | Parquet, CSV, JSON           |
| `nfs`                              | NFS                                   | Alpha             | Parquet, CSV, JSON           |
| `glue`                             | [Glue][glue]                          | Alpha             | Iceberg, Parquet, CSV        |
| `http`, `https`                    | HTTP(s)                               | Alpha             | Parquet, CSV, JSON           |
| `imap`                             | IMAP                                  | Alpha             | IMAP Emails                  |
| `localpod`                         | [Local dataset replication][localpod] | Alpha             |                              |
| `oracle`                           | Oracle                                | Alpha             | [Oracle ODPI-C][ODPIC]       |
| `sharepoint`                       | Microsoft SharePoint                  | Alpha             | Unstructured UTF-8 documents |
| `clickhouse`                       | Clickhouse                            | Alpha             |                              |
| `debezium`                         | Debezium CDC                          | Alpha             | Kafka + JSON                 |
| `kafka`                            | Kafka                                 | Alpha             | Kafka + JSON                 |
| `mongodb`                          | MongoDB                               | Alpha             |                              |
| `ducklake`                         | DuckLake                              | Alpha             | Parquet                      |
| `scylladb`                         | ScyllaDB                              | Alpha             | CQL, Alternator (DynamoDB)   |
| `adbc`                             | [ADBC][adbc]                          | Alpha             | Arrow (ADBC)                 |
| `elasticsearch`                    | ElasticSearch                         | Roadmap           |                              |

[databricks]: https://github.com/spiceai/cookbook/tree/trunk/databricks#readme
[spark]: https://spark.apache.org/docs/latest/spark-connect-overview.html
[s3]: https://github.com/spiceai/cookbook/tree/trunk/s3#readme
[spiceai]: https://github.com/spiceai/cookbook/tree/trunk/spiceai#readme
[dremio]: https://github.com/spiceai/cookbook/tree/trunk/dremio#readme
[localpod]: https://github.com/spiceai/cookbook/blob/trunk/localpod/README.md
[iceberg]: https://github.com/spiceai/cookbook/tree/trunk/catalogs/iceberg#readme
[glue]: https://github.com/spiceai/cookbook/tree/trunk/glue#readme
[adbc]: https://arrow.apache.org/adbc/
[ODPIC]: https://oracle.github.io/odpi/

## File Formats

Data connectors that read files from object stores (S3, Azure Blob, GCS) or network-attached storage (FTP, SFTP, SMB, NFS) support a variety of file formats. These connectors work with both structured data formats (Parquet, CSV) and document formats (Markdown, PDF).

### Specifying File Format

When connecting to a **directory**, specify the file format using `params.file_format`:

```yaml
datasets:
  - from: s3://bucket/data/sales/
    name: sales
    params:
      file_format: parquet
```

When connecting to a **specific file**, the format is inferred from the file extension:

```yaml
datasets:
  - from: sftp://files.example.com/reports/quarterly.parquet
    name: quarterly_report
```

### Supported Formats

| Name                                          | Parameter              | Status  | Description                                                                                                    |
| --------------------------------------------- | ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| [Apache Parquet](https://parquet.apache.org/) | `file_format: parquet` | Stable  | Columnar format optimized for analytics                                                                        |
| [CSV](../reference/file_format#csv)           | `file_format: csv`     | Stable  | Comma-separated values                                                                                         |
| JSON                                          | `file_format: json`    | Stable  | JavaScript Object Notation                                                                                     |
| [Delta Lake](https://delta.io/)               | `file_format: delta`   | Stable  | Open table format with ACID transactions. Object stores only.                                                  |
| [Apache Iceberg](https://iceberg.apache.org/) | `file_format: iceberg` | Stable  | Open table format for large analytic datasets. Object stores only. Requires a [catalog](../catalogs/index.md). |
| Microsoft Excel                               | `file_format: xlsx`    | Roadmap | Excel spreadsheet format                                                                                       |
| Markdown                                      | `file_format: md`      | Stable  | Plain text with formatting (document format)                                                                   |
| Text                                          | `file_format: txt`     | Stable  | Plain text files (document format)                                                                             |
| PDF                                           | `file_format: pdf`     | Beta    | Portable Document Format (document format)                                                                     |
| Microsoft Word                                | `file_format: docx`    | Alpha   | Word document format (document format)                                                                         |

### Format-Specific Parameters

File formats support additional parameters for fine-grained control. Common examples include:

| Parameter        | Applies To | Description                                      |
| ---------------- | ---------- | ------------------------------------------------ |
| `csv_has_header` | CSV        | Whether the first row contains column headers    |
| `csv_delimiter`  | CSV        | Field delimiter character (default: `,`)         |
| `csv_quote`      | CSV        | Quote character for fields containing delimiters |

For complete format options, see [File Formats Reference](../reference/file_format).

### Applicable Connectors {#object-store-file-formats}

The following data connectors support file format configuration:

| Connector Type               | Connectors                             |
| ---------------------------- | -------------------------------------- |
| **Object Stores**            | S3, Azure Blob (ABFS), GCS, HTTP/HTTPS |
| **Network-Attached Storage** | FTP, SFTP, SMB, NFS                    |
| **Local Storage**            | File                                   |

### Hive Partitioning

File-based connectors support Hive-style partitioning, which extracts partition columns from folder names. Enable with `hive_partitioning_enabled: true`.

Given a folder structure:

```text
/data/
  year=2024/
    month=01/
      data.parquet
    month=02/
      data.parquet
```

Configure the dataset:

```yaml
datasets:
  - from: s3://bucket/data/
    name: partitioned_data
    params:
      file_format: parquet
      hive_partitioning_enabled: true
```

Query with partition filters:

```sql
SELECT * FROM partitioned_data WHERE year = '2024' AND month = '01';
```

Partition pruning improves query performance by reading only the relevant files.

### Metadata Columns

File-based connectors can expose per-file object store metadata as virtual columns in the dataset schema. These columns are not stored in the data files — they are derived from object store file metadata at query time.

#### Available Columns

| Column           | Type                   | Description                     |
| ---------------- | ---------------------- | ------------------------------- |
| `_location`      | `Utf8`                 | Full URI of the source file     |
| `_last_modified` | `Timestamp(µs, "UTC")` | When the file was last modified |
| `_size`          | `UInt64`               | File size in bytes              |

#### Enabling Metadata Columns

Metadata columns are enabled by adding a `metadata` section to the dataset definition with each desired column set to `enabled`:

```yaml
datasets:
  - from: s3://bucket/data/
    name: my_data
    params:
      file_format: parquet
    metadata:
      _location: enabled
      _last_modified: enabled
      _size: enabled
```

Each column can be individually enabled or omitted:

```yaml
metadata:
  _location: enabled     # Only add the _location column
```

:::note
If the data files already contain a column with the same name as a metadata column (e.g., a Parquet file with a `_size` column), the metadata column is not added to avoid conflicts.
:::

#### Querying Metadata Columns

Once enabled, metadata columns appear alongside the regular data columns:

```sql
SELECT * FROM my_data LIMIT 3;
```

```shell
+----+---------+------+-------+-----+----------------------+--------------------------------------------------------------+-------+
| id | value   | year | month | day | _last_modified       | _location                                                    | _size |
+----+---------+------+-------+-----+----------------------+--------------------------------------------------------------+-------+
| 0  | value_0 | 2022 | 1     | 1   | 2024-10-10T05:36:59Z | s3://bucket/data/year=2022/month=1/day=1/data_0.parquet      | 2317  |
| 1  | value_1 | 2022 | 1     | 1   | 2024-10-10T05:36:59Z | s3://bucket/data/year=2022/month=1/day=1/data_0.parquet      | 2317  |
| 2  | value_2 | 2022 | 1     | 1   | 2024-10-10T05:36:59Z | s3://bucket/data/year=2022/month=1/day=1/data_0.parquet      | 2317  |
+----+---------+------+-------+-----+----------------------+--------------------------------------------------------------+-------+
```

Metadata columns can be used in filters, projections, aggregations, and joins like any other column:

```sql
-- Filter by file location
SELECT id, value FROM my_data
WHERE _location = 's3://bucket/data/year=2022/month=1/day=1/data_0.parquet';

-- Find recently modified files
SELECT DISTINCT _location, _last_modified FROM my_data
WHERE _last_modified > '2024-01-01T00:00:00Z';

-- Aggregate by file
SELECT _location, COUNT(*) AS row_count, _size
FROM my_data
GROUP BY _location, _size
ORDER BY _location;
```

#### Applicable Connectors

Metadata columns are supported by all file-based connectors:

| Connector Type               | Connectors                        |
| ---------------------------- | --------------------------------- |
| **Object Stores**            | S3, Azure Blob (ABFS), HTTP/HTTPS |
| **Network-Attached Storage** | FTP, SFTP, SMB, NFS               |
| **Local Storage**            | File                              |

## Schema Inference

Spice infers the schema for each dataset from its data source at startup. The inferred schema defines the column names, data types, and nullability used by the dataset for the lifetime of that runtime process.

Schema inference happens once, when the dataset is first registered. Some connectors support tuning the inference behavior with connector-specific parameters:

| Connector                             | Parameter                          | Default | Description                                         |
| ------------------------------------- | ---------------------------------- | ------- | --------------------------------------------------- |
| [Kafka](data-connectors/kafka)        | `schema_infer_max_records`         | 10      | Number of messages sampled to infer the JSON schema |
| [DynamoDB](data-connectors/dynamodb)  | `schema_infer_max_records`         | 10      | Number of items sampled to infer the schema         |
| [MongoDB](data-connectors/mongodb)    | `mongodb_num_docs_to_infer_schema` | 400     | Number of documents sampled to infer the schema     |
| [CSV files](../reference/file_format) | `csv_schema_infer_max_records`     | 1000    | Number of rows sampled to infer the CSV schema      |

For connectors that read self-describing formats (Parquet, Arrow, Avro), the schema is read directly from file metadata and does not require sampling.

### Runtime Schema Changes

Spice does not apply schema changes at runtime. If the source schema changes while the runtime is running — for example, new columns are added, columns are removed, or data types change — subsequent data refreshes will fail with an error such as:

```
Failed to load data for dataset <name>: Cannot cast struct field ...
```

This behavior is by design. Blocking runtime schema evolution protects accelerated tables from unintentional or breaking schema changes that could corrupt data or produce unexpected query results.

To apply a new source schema, restart the Spice runtime. On startup, Spice re-infers the schema from the source and re-initializes the dataset with the updated column definitions.

:::tip[Recommendation]
Pin a known-good schema version in the data source or use the [`columns`](../reference/spicepod/datasets#columns) configuration to explicitly define the expected columns. This makes schema expectations explicit and produces clear errors if the source drifts.
:::

:::note
Runtime schema evolution controls are planned for a future release. When available, schema evolution will remain off by default.
:::
| Name                                          | Parameter              | Supported | Is Document Format |
| --------------------------------------------- | ---------------------- | --------- | ------------------ |
| [Apache Parquet](https://parquet.apache.org/) | `file_format: parquet` | ✅         | ❌                  |
| [CSV](../reference/file_format#csv)           | `file_format: csv`     | ✅         | ❌                  |
| [Delta Lake](https://delta.io/)               | `file_format: delta`   | ✅         | ❌                  |
| [Apache Iceberg](https://iceberg.apache.org/) | `file_format: iceberg` | ✅         | ❌                  |
| JSON                                          | `file_format: json`    | ✅         | ❌                  |
| Microsoft Excel                               | `file_format: xlsx`    | Roadmap   | ❌                  |
| Markdown                                      | `file_format: md`      | ✅         | ✅                  |
| Text                                          | `file_format: txt`     | ✅         | ✅                  |
| PDF                                           | `file_format: pdf`     | Beta      | ✅                  |
| Microsoft Word                                | `file_format: docx`    | Alpha     | ✅                  |

### Document Formats {#document-formats}

<!-- Backwards compatibility anchor for older versioned docs -->
<a id="document-support"></a>

Document formats (Markdown, Text, PDF, Word) are handled differently from structured data formats. Each file becomes a row in the resulting table, with the file contents stored in a `content` column.

:::warning[Note]
Document formats in Alpha (DOCX) may not parse all structure or text from the underlying documents correctly.
:::

#### Document Table Schema

| Column     | Type   | Description                       |
| ---------- | ------ | --------------------------------- |
| `location` | String | Path to the source file           |
| `content`  | String | Full text content of the document |

#### Example

Consider a local filesystem:

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
