---
title: 'Glue Data Connector'
sidebar_label: 'Glue Data Connector'
description: 'Glue Data Connector Documentation'
---

The Glue Data Connector enables federated SQL querying on tables in an AWS Glue Data Catalog.

```yaml
datasets:
  - from: glue:tpch.lineitem
    name: lineitem
    params:
      glue_region: us-east-1
      glue_key: ${env:SPICE_AWS_KEY}
      glue_secret: ${env:SPICE_AWS_SECRET}
```

## Configuration

### `from`

Specify a table using the format, `glue:<database>.<table>` by replacing `<database>` with the name of the Glue database and `<table>`with the name of the table inside of the `<database>`.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```sql
SELECT COUNT(*) FROM lineitem;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

The following parameters are supported for configuring the connection to the Glue Data Catalog:

| Parameter Name       | Definition                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| `glue_region`        | The AWS region for the Glue Data Catalog. E.g. `us-west-2`.                 |
| `glue_key`           | Access key (e.g. AWS_ACCESS_KEY_ID for AWS)                                 |
| `glue_secret`        | Secret key (e.g. AWS_SECRET_ACCESS_KEY for AWS)                             |
| `glue_session_token` | Session token (e.g. AWS_SESSION_TOKEN for AWS) for temporary credentials    |

## Authentication

Uses the same authentication as the [S3 Data Connector](https://spiceai.org/docs/components/data-connectors/s3#authentication).

## Limitations

:::warning[Performance Considerations]

This catalog connector is limited to tables that use the S3 data source. Kinesis and Kafka data sources are not currently supported. Additionally, this catalog connector is currently limited to Iceberg tables, tables with parquet or CSV data format only.

When using the Glue Data connector without acceleration, data is loaded into memory during query execution. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

Memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](../data-accelerators/duckdb.md) and [`sqlite`](../data-accelerators/sqlite.md) accelerators by specifying `mode: file`.

Each query retrieves data from the S3 source, which might result in significant network requests and bandwidth consumption. This can affect network performance and incur costs related to data transfer from S3.

:::

## Cookbook

- A cookbook recipe to configure S3 as a data connector in Spice. [S3 Data Connector](https://github.com/spiceai/cookbook/tree/trunk/s3#readme)
