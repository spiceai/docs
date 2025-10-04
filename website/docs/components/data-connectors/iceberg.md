---
title: 'Iceberg Data Connector'
sidebar_label: 'Iceberg Data Connector'
description: 'Connect to and query Apache Iceberg tables'
tags:
  - data-connectors
  - iceberg
  - write
---

The Iceberg Data Connector helps query [Apache Iceberg](https://iceberg.apache.org/) tables using federated SQL. Every Iceberg dataset requires an Iceberg catalog to provide table metadata and manage access.

When working with multiple datasets, it is recommended to use a catalog connector (instead of a data connector), such as the [Iceberg Catalog Connector](/docs/components/catalogs/iceberg.md) or [AWS Glue Catalog Connector](/docs/components/catalogs/glue.md) instead of configuring individual datasets.

Iceberg catalogs can be of several types:

- **Iceberg REST Catalog**: The most common and recommended approach. REST Catalogs expose Iceberg tables over HTTP(S) endpoints and are compatible with most managed Iceberg services and cloud providers.
- **AWS Glue Catalog**: Integrates with AWS Glue as a catalog provider, supporting Iceberg tables stored in S3. This is the preferred method for AWS environments.
- **Hadoop-style Catalogs**: Use file-based storage (e.g., `file://`, `s3://`, `s3a://`) to manage table metadata. This approach is typically used for local development or legacy deployments.

:::warning[Hadoop-style Catalogs]

For production and cloud environments, REST and AWS Glue catalogs are recommended. Hadoop-style catalogs are supported but less common and not recommended for most new deployments.

:::

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: my_table
```

## Configuration

### `from`

The `from` field specifies the Iceberg table to connect to, in the format `iceberg:<table_path>`. The `table_path` is the URL to the Iceberg table in the catalog provider.
For REST Catalogs, use the format `http[s]://<iceberg_catalog_host>/v1/{prefix}/namespaces/<namespace_name>/tables/<table_name>`.
For AWS Glue catalogs, the URL format is `https://glue.<region>.amazonaws.com/iceberg/v1/catalogs/<account_id>/namespaces`, where `<account_id>` is the AWS account ID. While possible to connect to Iceberg tables hosted by Glue using this generic connector, it is recommended to instead use the [AWS Glue Data Connector](/docs/components/data-connectors/glue.md) for connecting to Iceberg tables managed by Glue for a better experience.

Example (REST Catalog):

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: my_table
```

Example (AWS Glue Catalog):

```yaml
datasets:
  - from: iceberg:https://glue.us-east-1.amazonaws.com/iceberg/v1/catalogs/123456789012/namespaces/my_namespace/tables/my_table
    name: glue_table
```

Hadoop-style catalogs use file-based paths such as `file://`, `s3://`, or `s3a://`. For these, specify the warehouse path as the table location. This is typically only used for local development or legacy setups.

Example (Hadoop Catalog, local):

```yaml
datasets:
  - from: iceberg:file:///tmp/hadoop_warehouse/test/my_table_1
    name: local_hadoop
```

Example (Hadoop Catalog, S3):

```yaml
datasets:
  - from: iceberg:s3a://my-bucket/hadoop_warehouse/test/my_table_2
    name: s3_hadoop
```

### `name`

The `name` field sets the table name within Spice. This name is used to reference the dataset in SQL queries. The name cannot be a [reserved keyword](/docs/reference/spicepod/keywords.md).

Example:

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: transactions
    params:
      iceberg_token: ${secrets:iceberg_token}
```

```sql
SELECT COUNT(*) FROM transactions;
```

```shell
+----------+
| count(*) |
+----------+
| 1234567  |
+----------+
```

### `params`

| Parameter Name                 | Description                                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iceberg_token`                | Bearer token value to use for Authorization header.                                                                                                                                            |
| `iceberg_oauth2_credential`    | Credential to use for OAuth2 client credential flow when connecting to the table. Format: `<client_id>:<client_secret>`                                                                        |
| `iceberg_oauth2_scope`         | Scope to use for OAuth2 client credential flow when connecting to the table. Default: `catalog`                                                                                                |
| `iceberg_oauth2_server_url`    | URL of the OAuth2 server tokens endpoint for the client credential flow.                                                                                                                       |
| `iceberg_s3_endpoint`          | S3-compatible endpoint where the Iceberg table data is stored.                                                                                                                                 |
| `iceberg_s3_region`            | Region of the S3-compatible endpoint.                                                                                                                                                          |
| `iceberg_s3_access_key_id`     | The AWS access key ID to use for S3 storage. If not provided, credentials will be loaded from environment variables or IAM roles.                                                                                                                                                         |
| `iceberg_s3_secret_access_key` | The AWS secret access key to use for S3 storage. If not provided, credentials will be loaded from environment variables or IAM roles.                                                                                                                                                     |
| `iceberg_s3_session_token`     | Session token for the S3-compatible endpoint.                                                                                                                                                  |
| `iceberg_s3_role_arn`          | ARN of the IAM role to assume when accessing the S3-compatible endpoint.                                                                                                                       |
| `iceberg_s3_role_session_name` | Session name to use when assuming the IAM role.                                                                                                                                                |
| `iceberg_s3_connect_timeout`   | Connection timeout in seconds for the S3-compatible endpoint. Default: `60`                                                                                                                    |
| `iceberg_sigv4_enabled`        | Enable SigV4 (AWS Signature Version 4) authentication when connecting to the catalog. Automatically enabled if the URL in `from` is an AWS Glue catalog. Default: `false`                      |
| `iceberg_signing_region`       | Region to use for SigV4 authentication. Extracted from the URL in `from` if not specified.                                                                                                     |
| `iceberg_signing_name`         | Service name to use for SigV4 authentication. Default: `glue`.                                                                                                                                 |
| `metadata_path`                | The path including scheme to the metadata file for the Hadoop table. Must specify a path to a `.json` file. For example, `s3a://my-bucket/warehouse/namespace/table/metadata/v1.metadata.json` |

## Authentication

Authentication to the Iceberg catalog. Supported methods include:

- **Bearer Token**: Use `iceberg_token` for Authorization header.
- **OAuth2 Client Credentials**: Use `iceberg_oauth2_credential`, `iceberg_oauth2_scope`, and `iceberg_oauth2_server_url`.
- **AWS SigV4**: For AWS Glue, set `iceberg_sigv4_enabled: true` (or use a Glue URL).
- **S3 Authentication**: Use `iceberg_s3_*` parameters for S3 data access.

### AWS Authentication

If AWS credentials are not explicitly provided in the configuration, the connector will automatically load credentials from the following sources in order. These credentials will be used to connect to the S3 bucket as well as the Glue catalog (if configured).

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
Regardless of the credential source, the IAM role or user must have appropriate S3/Glue permissions (e.g., `s3:ListBucket`, `s3:GetObject`) to access the tables. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
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
        Resource: "*"
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

## Examples

### Basic Example (REST Catalog)

Connect to an Iceberg table with token authentication:

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: my_table
    params:
      iceberg_token: ${secrets:iceberg_token}
```

### AWS Glue Catalog Example

Connect to an Iceberg table in AWS Glue catalog:

```yaml
datasets:
  - from: iceberg:https://glue.us-east-1.amazonaws.com/iceberg/v1/catalogs/123456789012/namespaces/my_namespace/tables/my_table
    name: glue_table
    params:
      iceberg_sigv4_enabled: true
```

### OAuth2 Authentication Example

Connect to an Iceberg table using OAuth2 authentication:

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: oauth_table
    params:
      iceberg_oauth2_credential: ${secrets:client_id}:${secrets:client_secret}
      iceberg_oauth2_scope: catalog
      iceberg_oauth2_server_url: https://iceberg-catalog-host.com/oauth2/token
```

### S3 Storage Example

Connect to an Iceberg table with custom S3 storage configuration:

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: s3_table
    params:
      iceberg_token: ${secrets:iceberg_token}
      iceberg_s3_endpoint: http://localhost:9000
      iceberg_s3_region: us-west-2
      iceberg_s3_access_key_id: ${secrets:aws_access_key_id}
      iceberg_s3_secret_access_key: ${secrets:aws_secret_access_key}
```

### Hadoop Catalog Example

Connect to an Iceberg table using Hadoop Catalog with a local warehouse:

```yaml
datasets:
  - from: iceberg:file:///tmp/hadoop_warehouse/test/my_table_1
    name: local_hadoop
    params:
      metadata_path: file:///tmp/hadoop_warehouse/test/my_table_1/metadata/v1.metadata.json
```

Connect to an Iceberg table using Hadoop Catalog with S3:

```yaml
datasets:
  - from: iceberg:s3a://my-bucket/hadoop_warehouse/test/my_table_2
    name: s3_hadoop
    params:
      metadata_path: s3a://my-bucket/hadoop_warehouse/test/my_table_2/metadata/v1.metadata.json
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/docs/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/docs/components/secret-stores#using-secrets).

## Limitations

:::warning[Performance Considerations]

When querying Iceberg tables, performance depends on the size of the table, the complexity of the query, and the underlying storage system. For large tables, consider using appropriate filtering to limit the amount of data scanned.

The connector needs to access both the Iceberg catalog metadata and the underlying data files (typically stored in S3 or a compatible object store). Ensure proper network connectivity and authentication for both systems.

:::
