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

The `from` field is used to specify the catalog provider. For Glue, use either `glue` (which targets the default Glue catalog for the AWS account and region) or `glue:<catalog_id>` to target a specific Glue catalog.

The catalog id appears after the first `:` in the `from` value. For [Amazon S3 Tables](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-tables.html), use the format `glue:<account_id>:s3tablescatalog/<table_bucket_name>`. The catalog id is otherwise the AWS account id when overriding the default catalog explicitly.

Examples:

```yaml
catalogs:
  # Default Glue catalog for the configured AWS account and region.
  - from: glue
    name: glue_default
  # Specific S3 Tables-backed Glue catalog.
  - from: glue:123456789012:s3tablescatalog/my_table_bucket
    name: glue_s3_tables
```

### `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the AWS Glue Data Catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

### `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

### `exclude`

Optional. Use the `exclude` field to omit tables that would otherwise be included. It is matched against the same table name as `include`, using the same glob syntax, and multiple `exclude` patterns are OR'ed together. `exclude` takes precedence over `include`: a table is registered only when it matches `include` (or no `include` is set) **and** matches no `exclude` pattern.

### `params`

The following parameters are supported for configuring the connection to the Glue Data Catalog:

| Parameter Name       | Definition                                                                                                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `glue_region`        | The AWS region for the Glue Data Catalog. E.g. `us-west-2`.                                                                                                                 |
| `glue_key`           | Access key (e.g. AWS_ACCESS_KEY_ID for AWS). If not provided, credentials will be loaded from environment variables or IAM roles.                                           |
| `glue_secret`        | Secret key (e.g. AWS_SECRET_ACCESS_KEY for AWS). If not provided, credentials will be loaded from environment variables or IAM roles.                                       |
| `glue_session_token` | Session token (e.g. AWS_SESSION_TOKEN for AWS) for temporary credentials                                                                                                    |
| `glue_iam_role_source` | Optional. IAM role credential source. `auto` (default) uses the default AWS credential chain, `metadata` uses only instance/container metadata (IMDS, ECS, EKS/IRSA), `env` uses only environment variables. |

The following parameters control how the embedded S3 reader fetches Parquet/ORC/CSV data files referenced by Glue table metadata. They are inherited from the [S3 data connector](../data-connectors/s3/). `glue_endpoint` and `glue_url_style` also apply to Iceberg-format tables, whose object I/O is handled by the Iceberg client. The other parameters do not apply to Iceberg-format tables.

| Parameter Name    | Definition                                                                                                                                                                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `glue_endpoint`   | Optional. Custom S3-compatible endpoint URL used when reading Parquet/ORC/CSV data files and Iceberg table files (e.g. `https://s3.us-east-1.amazonaws.com`, `http://minio.local:9000`). Leave unset for AWS S3.                                                                                                                         |
| `glue_url_style`  | Optional. S3 URL addressing style for Parquet/ORC/CSV and Iceberg files. One of `vhost` or `path`. When unset, Parquet/ORC/CSV reads use the S3 connector's [automatic detection](../data-connectors/s3/index.md#s3_url_style), and Iceberg tables use `path` when the bucket in the table's Iceberg `metadata_location` contains a dot. |
| `glue_versioning` | Optional. Enables S3 object versioning support for Parquet/ORC/CSV data files when set to `enabled`. Defaults to `enabled`.                                                                                                                                                                                                              |
| `client_timeout`  | Optional. Timeout for the underlying S3 client used to fetch Parquet/ORC/CSV data files. E.g. `30s`.                                                                                                                                                                                                                                     |
| `allow_http`      | Optional. Set to `true` to allow insecure HTTP for the S3 endpoint used to read Parquet/ORC/CSV data files. Defaults to `false`. Required when `glue_endpoint` uses an `http://` scheme.                                                                                                                                                 |
To target a non-default Glue catalog (for example, an S3 Tables catalog), specify the catalog id in the `from` field as `glue:<catalog_id>` — see [`from`](#from) above.

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

For an Iceberg table, the Glue and S3 clients resolve credentials from the credential source on each request. A source that renews temporary credentials, such as IAM roles for service accounts (IRSA), EKS Pod Identity, an assumed role, or an SSO session, supplies new credentials when the old ones expire, so refreshes keep working without a restart. Temporary credentials supplied directly, with `glue_session_token` or the `AWS_SESSION_TOKEN` environment variable, are not renewed: once they expire, refreshes fail until the credentials are replaced and Spice restarts. In v2.4.3 and earlier, credentials for an Iceberg table were resolved once when the dataset loaded, so every refresh after they expired failed with `ExpiredTokenException` until Spice restarted. That includes v2.4.1 and v2.4.2. The change that resolves credentials on each request is [spiceai/spiceai#15667](https://github.com/spiceai/spiceai/pull/15667), and it is not in any v2.4 release. On those releases, read the table with the [Iceberg catalog connector](./iceberg.md) instead of this catalog. That path does not capture keys at load: its Glue requests and its S3 reads each get credentials from the AWS credential chain and load new ones when the old ones expire.

:::note[IAM Permissions]
Regardless of the credential source, the IAM role or user must have appropriate S3/Glue permissions (e.g., `s3:ListBucket`, `glue:GetTable`) to access the tables. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

### Required IAM Permissions

Scope each policy to the Glue catalog, database, and table ARNs and the S3 prefixes of the tables the Spicepod uses. Keep `glue:UpdateTable` and `s3:PutObject` out of the read policy, and attach the write policy only to a role that runs a Spicepod with `access: read_write`.

#### Read IAM Permissions

The following policy grants read access to the `my_table` table in the `my_database` database, stored under the `my_database/my_table/` prefix of the `company-bucketname-datasets` bucket. Replace the region, account ID, bucket, prefix, database, and table with the values for each table the Spicepod queries. To read every table in a database, use `table/my_database/*` as the table ARN and the database's S3 prefix for `s3:GetObject`.

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
        "Resource": "arn:aws:s3:::company-bucketname-datasets/my_database/my_table/*"
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
        "Resource": [
          "arn:aws:glue:us-east-1:123456789012:catalog",
          "arn:aws:glue:us-east-1:123456789012:database/my_database",
          "arn:aws:glue:us-east-1:123456789012:table/my_database/my_table"
        ]
      }
    ]
}
```

#### Write IAM Permissions

Writes need the following policy in addition to the read policy. It permits new snapshot commits for `my_table` only, and object writes only under that table's S3 prefix. List each table that accepts writes by its own table ARN and S3 prefix. A wildcard such as `table/my_database/*`, `company-bucketname-datasets/*`, or `"Resource": "*"` gives the role write access to every matching table.

```json
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:PutObject"],
        "Resource": "arn:aws:s3:::company-bucketname-datasets/my_database/my_table/*"
      },
      {
        "Effect": "Allow",
        "Action": ["glue:UpdateTable"],
        "Resource": [
          "arn:aws:glue:us-east-1:123456789012:catalog",
          "arn:aws:glue:us-east-1:123456789012:database/my_database",
          "arn:aws:glue:us-east-1:123456789012:table/my_database/my_table"
        ]
      }
    ]
}
```

### Permission Details

| Permission          | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `s3:ListBucket`     | Required. Allows scanning all objects from the bucket          |
| `s3:GetObject`      | Required. Allows fetching objects                              |
| `s3:PutObject`      | Write policy only. Writes objects under the table prefix.      |
| `glue:GetCatalog`   | Required. Retrieve metadata about the specified catalog.       |
| `glue:GetDatabases` | Required. List the databases available in the current catalog. |
| `glue:GetDatabase`  | Required. Retrieve metadata about the specified database.      |
| `glue:GetTable`     | Required. Retrieve metadata about the specified table.         |
| `glue:GetTables`    | Required. List the tables available in the current database.   |
| `glue:UpdateTable`  | Write policy only. Commits new table snapshots.                |

## Write Support

This catalog supports writing data to Glue-managed Iceberg tables using SQL [`INSERT INTO`](../../reference/sql/dml#insert) statements. Writes are currently append-only — inserted data is added as new data files and registered through a new Iceberg table snapshot. Schema validation ensures inserted data matches the target table schema.

To enable writes for all tables in the catalog, set `access: read_write` on the catalog:

```yaml
catalogs:
  - from: glue
    name: my_glue_catalog
    access: read_write
    params:
      glue_region: us-east-1
```

```sql
-- Insert with values
INSERT INTO my_glue_catalog.my_database.my_table (id, name, amount)
VALUES (1, 'Alice', 100.0);

-- Insert from another table
INSERT INTO my_glue_catalog.my_database.my_table
SELECT * FROM staging_table;
```

Inserting into partitioned Iceberg tables is supported. `UPDATE` and `DELETE` operations are not currently supported.

Write operations require the [write policy](#write-iam-permissions) in addition to the read policy: `s3:PutObject` on the target table's S3 prefix, and `glue:UpdateTable` on the target table, its database, and the catalog to commit the new table snapshot to the Glue Data Catalog. For more details, see [Data Ingestion](../../features/data-ingestion).

## Limitations

:::warning

- This catalog connector is limited to tables that use the S3 data source. Kinesis and Kafka data sources are not currently supported.
- The location of a Parquet, ORC, or CSV table must be an `s3://` URL. The catalog skips a table whose location uses another scheme, including `s3a://`, `http://`, `https://`, or `file://`, before any request is sent, and names it in the skipped-tables warning below. A dataset that reads the same table through the [AWS Glue Data Connector](../data-connectors/glue#limitations) fails to load with an error that names the table and its location.
- This catalog connector is limited to Iceberg tables and tables whose data format is Parquet, ORC, or CSV. A Hive ACID/transactional ORC table (the Glue table property `transactional` set to `true`, `yes`, or `1`) is refused at registration — Spice does not implement Hive ACID snapshot semantics (`base_*`, `delta_*`, `delete_delta_*`). Export or materialize the current snapshot to a non-transactional ORC location and register that instead.

:::

Tables with unsupported formats or locations are skipped. A warning summarizes skipped tables per database;
debug logs provide each reason. Warnings are rate-limited unless the set of skipped tables changes.

### Tables That Fail to Load

A table or database that fails to load does not fail the catalog. The catalog loads each database and table on its own, leaves out one that fails, and registers the rest:

- At startup, a table that fails to load is not registered. The skipped-tables warning names it and quotes the error of a failed load. A database whose tables cannot be listed is not registered, with a warning that names the database and the error.
- On a refresh, a table that was registered before and now fails to load stays registered with the definition it was last loaded with. Queries against it still need the source to answer: a table whose source refuses access fails its queries until access returns. A warning per database names the tables that kept their earlier definition. A database whose tables cannot be listed on a refresh keeps the tables it had. Tables added to or dropped from Glue are still picked up.
- When every database, or every table, that a load tries fails, the load fails, as an error that affects the whole catalog, such as missing credentials or permissions, does. At startup, the catalog is not registered empty, and the runtime does not report ready. On a refresh, the catalog keeps the tables it has, Spice logs an error that names the catalog, and the refresh is tried again at the next interval; readiness does not change.

In v2.4.3 and earlier, one table or database that failed to load, such as a table at an `s3a://` location, failed the whole catalog: at startup the catalog was not registered and the runtime did not report ready, and on a running catalog every refresh failed, so tables added or dropped in Glue were not picked up.

## Cookbook

There is a [cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/catalogs/glue) to configure the AWS Glue Catalog Connector in Spice.
