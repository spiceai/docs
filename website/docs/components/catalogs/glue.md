---
title: 'Glue Catalog Connector'
sidebar_label: 'Glue'
description: 'Connect to an AWS Glue Data Catalog.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - glue
  - data-connectors
---

Connect to an [AWS Glue Data Catalog](https://docs.aws.amazon.com/glue/latest/dg/start-data-catalog.html) as a catalog provider for federated SQL query.

## Configuration

```yaml
catalogs:
  - from: glue
    name: my_glue_catalog # tables from this catalog will be available in the "my_glue_catalog" catalog in Spice
    include:
      - '*.my_table_name' # include only the "my_table_name" tables
    params:
      glue_auth: key # Authentication method to use
      glue_region: us-east-1 # Region of the AWS Glue Data Catalog.
      glue_key: ${secrets:aws_access_key_id} # Access key ID for the AWS Glue Data Catalog.
      glue_secret: ${secrets:aws_secret_access_key} # Secret access key for the AWS Glue Data Catalog.
```

### `from`

The `from` field is used to specify the catalog provider. For Glue, you need only specify `glue`. The catalog is unique for each AWS account and AWS region.

### `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the AWS Glue Data Catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

### `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

### `params`

The following parameters are supported for configuring the connection to the Databricks Unity Catalog:

| Parameter Name       | Definition                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| `glue_region`        | The AWS region for the Glue Data Catalog. E.g. `us-west-2`.                 |
| `glue_key`           | Access key (e.g. AWS_ACCESS_KEY_ID for AWS)                                 |
| `glue_secret`        | Secret key (e.g. AWS_SECRET_ACCESS_KEY for AWS)                             |
| `glue_session_token` | Session token (e.g. AWS_SESSION_TOKEN for AWS) for temporary credentials    |
| `glue_auth`          | Authentication type. Options: public, key and iam_role. Defaults to public. |

## Authentication

Uses the same authentication as the [S3 Data Connector](https://spiceai.org/docs/components/data-connectors/s3#authentication).

## Limitations

:::warning

- This catalog connector is limited to tables that use the S3 data source. Kinesis and Kafka data sources are not currently supported.
- This catalog connector is currently limited to Iceberg tables or tables with parquet data format only.

:::

## Cookbook

There is a [cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/catalogs/glue) to configure an AWS Glue Data Connector in Spice.

