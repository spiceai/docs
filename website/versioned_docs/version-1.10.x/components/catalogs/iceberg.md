---
title: 'Iceberg Catalog Connector'
sidebar_label: 'Iceberg'
description: 'Connect to an Iceberg catalog provider.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - iceberg
  - data-connectors
  - write
---

The Iceberg Catalog Connector helps connect Spice to an [Apache Iceberg](https://iceberg.apache.org/) catalog, making Iceberg tables and schemas available for federated SQL queries. Every Iceberg table must be registered in a catalog, which manages table metadata and access. Using a catalog connector is the recommended approach for working with multiple Iceberg datasets, as it helps organize tables and schemas efficiently and mirrors the structure of the source catalog provider.

For connecting to a single Iceberg table, see the [Iceberg Data Connector documentation](/docs/components/data-connectors/iceberg.md). For AWS Glue-based catalogs, see the [AWS Glue Catalog Connector documentation](/docs/components/catalogs/glue.md).

Iceberg catalogs can be of several types:

- **Iceberg REST Catalog**: The most common and recommended approach. REST Catalogs expose Iceberg table metadata over HTTP(S) endpoints and are compatible with most managed Iceberg services and cloud providers.
- **AWS Glue Catalog**: Integrates with AWS Glue as a catalog provider, supporting Iceberg tables stored in S3. This is the preferred method for AWS environments.
- **Hadoop-style Catalogs**: Use file-based storage (e.g., `file://`, `s3://`, `s3a://`) to manage table metadata. This approach is typically used for local development or legacy deployments.

:::warning[Hadoop-style Catalogs]
For production and cloud environments, REST and AWS Glue catalogs are recommended. Hadoop-style catalogs are supported but less common and not recommended for most new deployments.
:::

## Configuration

```yaml
catalogs:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_catalog
    name: ice # tables from this catalog will be available in the "ice" catalog in Spice
    include:
      - '*.my_table_name' # include only the "my_table_name" tables
    params:
      iceberg_token: ${secrets:iceberg_token} # Optional. Bearer token value to use for Authorization header.
      iceberg_oauth2_credential: ${secrets:client_id}:${secrets:client_secret} # Optional. Credential to use for OAuth2 client credential flow when initializing the catalog. Separated by a colon as <client_id>:<client_secret>.
      iceberg_oauth2_scope: catalog # Optional. Scope to use for OAuth2 client credential flow when initializing the catalog (default: catalog).
      iceberg_oauth2_server_url: https://iceberg-catalog-host.com/oauth2/token # Optional. URL of the OAuth2 server tokens endpoint for the client credential flow.
      iceberg_s3_endpoint: http://localhost:9000 # Optional. S3-compatible endpoint where the Iceberg tables are stored.
      iceberg_s3_region: us-west-2 # Optional. Region of the S3-compatible endpoint.
      iceberg_s3_access_key_id: ${secrets:aws_access_key_id} # Optional. Access key ID for the S3-compatible endpoint.
      iceberg_s3_secret_access_key: ${secrets:aws_secret_access_key} # Optional. Secret access key for the S3-compatible endpoint.
      iceberg_s3_session_token: ${secrets:aws_session_token} # Optional. Session token for the S3-compatible endpoint.
      iceberg_s3_role_arn: arn:aws:iam::123456789012:role/my-role # Optional. ARN of the IAM role to assume when accessing the S3-compatible endpoint.
      iceberg_s3_role_session_name: my-session # Optional. Session name to use when assuming the IAM role.
      iceberg_s3_connect_timeout: 60 # Optional. Connection timeout for the S3-compatible endpoint (default: 60).

  # AWS Glue Catalog (see also the [AWS Glue Catalog Connector documentation](/docs/components/catalogs/glue.md))
  - from: iceberg:https://glue.us-east-1.amazonaws.com/iceberg/v1/catalogs/123456789012/namespaces
    name: glue
    params:
      iceberg_sigv4_enabled: true
```

## `from`

The `from` field specifies the catalog provider. For Iceberg, use `iceberg:<namespace_path>`, where `namespace_path` is the URL to the Iceberg namespace in the catalog provider. The format is `http[s]://<iceberg_catalog_host>/v1/{prefix}/namespaces/<namespace_name>`.

For AWS Glue catalogs, the URL format is `https://glue.<region>.amazonaws.com/iceberg/v1/catalogs/<account_id>/namespaces`, where `<account_id>` is the AWS account ID. While possible to connect to Iceberg tables hosted by Glue using this generic connector, it is recommended to instead use the [AWS Glue Catalog Connector](/docs/components/catalogs/glue.md) for connecting to Iceberg tables managed by Glue for a better experience.

The selected namespace must have sub-namespaces where the tables are stored.

Example: With this Iceberg catalog structure:

```shell
.
├── blockchain
│   └── eth
│       ├── blocks
│       └── transactions
├── spice
│   ├── tpch
│   │   ├── orders
│   │   └── customers
│   ├── info
│   └── extra
│       └── tpch_orders_metadata
└── unity
    └── very
        └── nested
            └── namespace
                └── foobar
```

A valid `from` value would be `iceberg:https://iceberg-catalog-host.com/v1/namespaces/spice`, and would load the following tables:

- `<name>.tpch.orders`
- `<name>.tpch.customers`
- `<name>.extra.tpch_orders_metadata`

For loading a multi-part namespace, separate the namespace parts with the `%1F` character. For example, `/v1/namespaces/unity%1Fvery%1Fnested` would load the `foobar` table from the `unity/very/nested/namespace` namespace as `<name>.namespace.foobar`.

To connect to a single Iceberg table directly, see the [Iceberg Data Connector documentation](/docs/components/data-connectors/iceberg.md).

## `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the Iceberg catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

## `params`

The following parameters are supported for configuring the connection to the Iceberg catalog, file, or S3 storage:

| Parameter Name                 | Description                                                                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iceberg_token`                | Bearer token value to use for Authorization header.                                                                                                                                                  |
| `iceberg_oauth2_credential`    | Credential to use for OAuth2 client credential flow when initializing the catalog. Separated by a colon as `<client_id>:<client_secret>`.                                                            |
| `iceberg_oauth2_token_url`     | The URL to use for OAuth2 token endpoint.                                                                                                                                                            |
| `iceberg_oauth2_scope`         | The scope to use for OAuth2 token endpoint (default: `catalog`).                                                                                                                                     |
| `iceberg_oauth2_server_url`    | URL of the OAuth2 server tokens endpoint.                                                                                                                                                            |
| `iceberg_sigv4_enabled`        | Enable SigV4 authentication for the catalog (for connecting to AWS Glue).                                                                                                                            |
| `iceberg_signing_region`       | The region to use when signing the request for SigV4. Defaults to the region in the catalog URL if available.                                                                                        |
| `iceberg_signing_name`         | The name to use when signing the request for SigV4. Default: `glue`.                                                                                                                                 |
| `iceberg_s3_endpoint`          | Configure an alternative endpoint for the S3 service. This can be any S3-compatible object storage service (e.g., Minio, R2).                                                                        |
| `iceberg_s3_access_key_id`     | The AWS access key ID to use for S3 storage. If not provided, credentials will be loaded from environment variables or IAM roles.                                                                                                                                                         |
| `iceberg_s3_secret_access_key` | The AWS secret access key to use for S3 storage. If not provided, credentials will be loaded from environment variables or IAM roles.                                                                                                                                                     |
| `iceberg_s3_session_token`     | Configure the static session token used for S3 storage.                                                                                                                                              |
| `iceberg_s3_region`            | The AWS S3 region to use.                                                                                                                                                                            |
| `iceberg_s3_role_session_name` | An optional identifier for the assumed role session for auditing purposes.                                                                                                                           |
| `iceberg_s3_role_arn`          | The Amazon Resource Name (ARN) of the role to assume. If provided instead of iceberg_s3_access_key_id and iceberg_s3_secret_access_key, temporary credentials will be fetched by assuming this role. |
| `iceberg_s3_connect_timeout`   | Configure socket connection timeout, in seconds (default: `60`).                                                                                                                                     |

The Iceberg Catalog Connector supports both REST and Hadoop-style Catalogs. In both cases, the warehouse path (for example, s3://bucket/warehouse/) specifies the object store location where tables are physically stored. With a Hadoop-style Catalog, the metadata is resolved directly from the filesystem using the Hadoop convention (by reading a `version-hint.txt`), rather than through a catalog service. The warehouse path itself does not change between using a REST Catalog and a Hadoop-style Catalog — only how the metadata is discovered and managed differs. The warehouse path is discovered automatically from the catalog service, but must be explicitly specified when using Hadoop-style Iceberg tables. Hadoop-style catalogs are most commonly used for local development or legacy deployments.

Example using Hadoop Catalog with a local warehouse:

```yaml
catalogs:
  - from: iceberg:file:///tmp/hadoop_warehouse/
    name: local_hadoop
```

Example using Hadoop Catalog with S3:

```yaml
catalogs:
  - from: iceberg:s3a://my-bucket/hadoop_warehouse/
    name: s3_hadoop
```

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

## Required IAM Permissions

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

## Cookbook

- A cookbook recipe to configure Iceberg as a catalog connector in Spice. [Iceberg Catalog Connector](https://github.com/spiceai/cookbook/tree/trunk/catalogs/iceberg#readme)
