---
title: 'Glue Data Connector'
sidebar_label: 'Glue Data Connector'
description: 'Glue Data Connector Documentation'
tags:
  - data-connectors
  - glue
  - write
---

The Glue Data Connector enables federated SQL querying on tables in an AWS Glue Data Catalog.

```yaml
datasets:
  - from: glue:tpch.lineitem
    name: lineitem
    params:
      glue_region: us-east-1
      glue_key: ${env:SPICE_AWS_KEY} # Optional.
      glue_secret: ${env:SPICE_AWS_SECRET} # Optional.
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

The dataset name cannot be a [reserved keyword](/docs/reference/spicepod/keywords.md).

### `params`

The following parameters are supported for configuring the connection to the Glue Data Catalog:

| Parameter Name       | Definition                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| `glue_region`        | The AWS region for the Glue Data Catalog. E.g. `us-west-2`.                 |
| `glue_catalog_id`    | The Glue catalog ID. For Amazon S3 Tables, use the format `<account_id>:s3tablescatalog/<table_bucket_name>`. If not provided, the default catalog for the account is used. |
| `glue_key`           | Access key (e.g. AWS_ACCESS_KEY_ID for AWS). If not provided, credentials will be loaded from environment variables or IAM roles.                                 |
| `glue_secret`        | Secret key (e.g. AWS_SECRET_ACCESS_KEY for AWS). If not provided, credentials will be loaded from environment variables or IAM roles.                             |
| `glue_session_token` | Session token (e.g. AWS_SESSION_TOKEN for AWS) for temporary credentials    |

## Examples

### Basic Glue Table

```yaml
datasets:
  - from: glue:tpch.lineitem
    name: lineitem
    params:
      glue_region: us-east-1
      glue_key: ${env:AWS_ACCESS_KEY_ID}
      glue_secret: ${env:AWS_SECRET_ACCESS_KEY}
```

### Amazon S3 Tables

Connect to tables in [Amazon S3 Tables](https://aws.amazon.com/s3/features/tables/) using the `glue_catalog_id` parameter with the S3 Tables catalog format:

```yaml
datasets:
  - from: glue:my_namespace.orders
    name: orders
    params:
      glue_catalog_id: 123635965758:s3tablescatalog/my-table-bucket
      glue_region: us-east-2
      glue_key: ${env:AWS_ACCESS_KEY_ID}
      glue_secret: ${env:AWS_SECRET_ACCESS_KEY}
```

## Authentication

If AWS credentials are not explicitly provided in the configuration, the connector will automatically load credentials from the following sources in order. These credentials will be used to connect to the S3 bucket as well as the Glue catalog.

1. **Environment Variables**:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (if using temporary credentials)

2. **Shared AWS Config/Credentials Files**:
   - Config file: `~/.aws/config` (Linux/Mac) or `%UserProfile%\.aws\config` (Windows)
   - Credentials file: `~/.aws/credentials` (Linux/Mac) or `%UserProfile%\.aws\credentials` (Windows)
   - The `AWS_PROFILE` environment variable can be used to specify a named profile, otherwise the `[default]` profile is used.
   - Supports both static credentials and SSO sessions
   - Example credentials file:

     ```ini
     # Static credentials
     [default]
     aws_access_key_id = YOUR_ACCESS_KEY
     aws_secret_access_key = YOUR_SECRET_KEY

     # SSO profile
     [profile sso-profile]
     sso_start_url = https://my-sso-portal.awsapps.com/start
     sso_region = us-west-2
     sso_account_id = 123456789012
     sso_role_name = MyRole
     region = us-west-2
     ```

   :::tip
   To set up SSO authentication:
   1. Run `aws configure sso` to configure a new SSO profile
   2. Use the profile by setting `AWS_PROFILE=sso-profile`
   3. Run `aws sso login --profile sso-profile` to start a new SSO session
   :::

3. **AWS STS Web Identity Token Credentials**:
   - Used primarily with OpenID Connect (OIDC) and OAuth
   - Common in Kubernetes environments using IAM roles for service accounts (IRSA)

4. **ECS Container Credentials**:
   - Used when running in Amazon ECS containers
   - Automatically uses the task's IAM role
   - Retrieved from the ECS credential provider endpoint
   - Relies on the environment variable `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` or `AWS_CONTAINER_CREDENTIALS_FULL_URI` which are automatically injected by ECS.

5. **AWS EC2 Instance Metadata Service (IMDSv2)**:
   - Used when running on EC2 instances.
   - Automatically uses the instance's IAM role.
   - Retrieved securely using [IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).

The connector will try each source in order until valid credentials are found. If no valid credentials are found, an authentication error will be returned.

:::note[IAM Permissions]
Regardless of the credential source, the IAM role or user must have appropriate S3/Glue permissions (e.g., `s3:ListBucket`, `glue:GetTable`) to access the tables. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

### Required IAM Permissions

The IAM role or user needs the following permissions to access Iceberg tables in S3/Glue:

```json
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:ListBucket"],
        "Resource": "arn:aws:s3:::company-bucketname-datasets"
      },
      {
        "Effect": "Allow",
        "Action": ["s3:GetObject"],
        "Resource": "arn:aws:s3:::company-bucketname-datasets/*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "glue:GetCatalog",
          "glue:GetDatabases",
          "glue:GetDatabase",
          "glue:GetTable",
          "glue:GetTables"
        ],
        "Resource": "*"
      }
    ]
}
```

### Permission Details

| Permission | Purpose |
|------------|---------|
| `s3:ListBucket` | Required. Allows scanning all objects from the bucket |
| `s3:GetObject` | Required. Allows fetching objects |
| `glue:GetCatalog` | Required. Retrieve metadata about the specified catalog. |
| `glue:GetDatabases` | Required. List the databases available in the current catalog. |
| `glue:GetDatabase` | Required. Retrieve metadata about the specified database. |
| `glue:GetTable` | Required. Retrieve metadata about the specified table. |
| `glue:GetTables` | Required. List the tables available in the current database. |

## Limitations

:::warning[Data Source/Data Format Restrictions]

This catalog connector is limited to tables that use the S3 data source. Kinesis and Kafka data sources are not currently supported. Additionally, this catalog connector is currently limited to Iceberg tables, tables with parquet or CSV data format only.

:::

:::warning[Performance Considerations]

When using the Glue Data connector without acceleration, data is loaded into memory during query execution. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

Memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](../data-accelerators/duckdb.md) and [`sqlite`](../data-accelerators/sqlite.md) accelerators by specifying `mode: file`.

Each query retrieves data from the S3 source, which might result in significant network requests and bandwidth consumption. This can affect network performance and incur costs related to data transfer from S3.

:::

## Cookbook

- A cookbook recipe to configure Glue as a data connector in Spice. [Glue Data Connector](https://github.com/spiceai/cookbook/tree/trunk/glue/README.md)
