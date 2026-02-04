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
  - write
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
      glue_region: us-east-1 # Region of the AWS Glue Data Catalog.
      glue_key: ${secrets:aws_access_key_id} # Optional. Access key ID for the AWS Glue Data Catalog.
      glue_secret: ${secrets:aws_secret_access_key} # Optional. Secret access key for the AWS Glue Data Catalog.
```

### `from`

The `from` field is used to specify the catalog provider. For Glue, you need only specify `glue`. The catalog is unique for each AWS account and AWS region.

### `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the AWS Glue Data Catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

### `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

### `params`

The following parameters are supported for configuring the connection to the Glue Data Catalog:

| Parameter Name       | Definition                                                                  |
| -------------------- | --------------------------------------------------------------------------- |
| `glue_region`        | The AWS region for the Glue Data Catalog. E.g. `us-west-2`.                 |
| `glue_key`           | Access key (e.g. AWS_ACCESS_KEY_ID for AWS). If not provided, credentials will be loaded from environment variables or IAM roles.                                 |
| `glue_secret`        | Secret key (e.g. AWS_SECRET_ACCESS_KEY for AWS). If not provided, credentials will be loaded from environment variables or IAM roles.                             |
| `glue_session_token` | Session token (e.g. AWS_SESSION_TOKEN for AWS) for temporary credentials    |

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

## Write Support

This catalog supports [data ingestion](../../features/data-ingestion) using [SQL INSERT statements](../../reference/sql/dml#insert). Configure with `access: read_write` to enable writes.

## Limitations

:::warning

- This catalog connector is limited to tables that use the S3 data source. Kinesis and Kafka data sources are not currently supported.
- This catalog connector is currently limited to Iceberg tables, tables with parquet or CSV data format only.

:::

## Cookbook

There is a [cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/catalogs/glue) to configure an AWS Glue Data Connector in Spice.
