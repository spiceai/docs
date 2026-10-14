---
title: 'Iceberg Data Connector'
sidebar_label: 'Iceberg Data Connector'
description: 'Connect to and query Apache Iceberg tables'
tags:
  - data-connectors
  - iceberg
  - write
---

The Iceberg Data Connector helps query [Apache Iceberg](https://iceberg.apache.org/) tables using federated SQL. Iceberg table format versions V1, V2, and V3 are supported. Iceberg datasets typically read through an Iceberg catalog that provides table metadata and manages access. A table on object storage or the local filesystem can also be read without a catalog, as described in [Read a table without a catalog](#read-a-table-without-a-catalog).

When working with multiple datasets, it is recommended to use a catalog connector (instead of a data connector), such as the [Iceberg Catalog Connector](../catalogs/iceberg) or [AWS Glue Catalog Connector](../catalogs/glue) instead of configuring individual datasets.

Iceberg tables can be read in several ways:

- **Iceberg REST Catalog**: The most common and recommended approach. REST Catalogs expose Iceberg tables over HTTP(S) endpoints and are compatible with most managed Iceberg services and cloud providers.
- **AWS Glue Catalog**: Integrates with AWS Glue as a catalog provider, supporting Iceberg tables stored in S3. This is the preferred method for AWS environments.
- **Hadoop-style Catalogs or no catalog**: Reads a table directly from its root directory on object storage or the local filesystem (`file://`, `s3://`, `s3a://`, `gs://`, `gcs://`). This works for Hadoop-style tables and for tables written by other catalogs, such as AWS Glue, Athena, and REST catalogs.

:::warning[Reading without a catalog]

For production and cloud environments, REST and AWS Glue catalogs are recommended. Without a catalog, Spice finds the current metadata file from the table's files, and can read a commit that is in progress or that failed. For tables with concurrent writers, read through a catalog or pin a metadata file with `iceberg_metadata_path`.

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
For AWS Glue catalogs, the URL format is `https://glue.<region>.amazonaws.com/iceberg/v1/catalogs/<account_id>/namespaces`, where `<account_id>` is the AWS account ID. While possible to connect to Iceberg tables hosted by Glue using this generic connector, it is recommended to instead use the [AWS Glue Data Connector](./glue) for connecting to Iceberg tables managed by Glue for a better experience.

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

To read a table without a catalog, set `from` to the table root, the directory that contains `metadata/`, under the `file://`, `s3://`, `s3a://`, `gs://`, or `gcs://` scheme. The table root needs no particular directory layout. See [Read a table without a catalog](#read-a-table-without-a-catalog).

Example (S3, no catalog):

```yaml
datasets:
  - from: iceberg:s3://my-bucket/warehouse/db/taxis
    name: taxis
    params:
      iceberg_s3_region: us-east-1
```

Example (local filesystem, no catalog):

```yaml
datasets:
  - from: iceberg:file:///tmp/warehouse/db/taxis
    name: local_taxis
```

### `name`

The `name` field sets the table name within Spice. This name is used to reference the dataset in SQL queries. The name cannot be a [reserved keyword](../../reference/spicepod/keywords).

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
| `iceberg_s3_access_key_id`     | The AWS access key ID to use for S3 storage. If not provided, credentials will be loaded from environment variables or IAM roles.                                                              |
| `iceberg_s3_secret_access_key` | The AWS secret access key to use for S3 storage. If not provided, credentials will be loaded from environment variables or IAM roles.                                                          |
| `iceberg_s3_session_token`     | Session token for the S3-compatible endpoint.                                                                                                                                                  |
| `iceberg_s3_role_arn`          | ARN of the IAM role to assume when accessing the S3-compatible endpoint.                                                                                                                       |
| `iceberg_s3_role_session_name` | Session name to use when assuming the IAM role.                                                                                                                                                |
| `iceberg_s3_iam_role_source`   | Optional. IAM role credential source. `auto` (default) uses the default AWS credential chain, `metadata` uses only instance/container metadata (IMDS, ECS, EKS/IRSA), `env` uses only environment variables. |
| `iceberg_s3_connect_timeout`   | Connection timeout in seconds for the S3-compatible endpoint. Default: `60`. **Note:** This parameter is currently accepted but has no effect — it is not consumed by any code path.            |
| `iceberg_s3_path_style_access` | Controls S3 addressing style. `true` (default) uses path-style (`endpoint/bucket`), required for object stores such as MinIO; `false` uses virtual-hosted-style (`bucket.endpoint`).            |
| `iceberg_sigv4_enabled`        | Enable SigV4 (AWS Signature Version 4) authentication when connecting to the catalog. Automatically enabled if the URL in `from` is an AWS Glue catalog. Default: `false`                      |
| `iceberg_signing_region`       | Region to use for SigV4 authentication. Extracted from the URL in `from` if not specified.                                                                                                     |
| `iceberg_signing_name`         | Service name to use for SigV4 authentication. Default: `glue`.                                                                                                                                 |
| `iceberg_warehouse`            | Name of the Iceberg warehouse. Used for catalog types that support it (e.g. Lakekeeper).                                                                                                       |
| `iceberg_gcs_project_id`      | The Google Cloud project ID for GCS storage.                                                                                                                                                   |
| `iceberg_gcs_credentials`     | Base64-encoded Google Cloud service account credentials JSON for GCS storage.                                                                                                                  |
| `iceberg_gcs_token`           | OAuth2 token to use for GCS authentication.                                                                                                                                                    |
| `iceberg_gcs_service_path`    | Custom endpoint URL for GCS (for emulators or custom endpoints).                                                                                                                               |
| `iceberg_gcs_no_auth`         | Set to `true` to allow anonymous access to GCS (for public buckets).                                                                                                                           |
| `iceberg_metadata_path`        | The Iceberg metadata file to read the table from, as a path relative to the table root in `from` (for example, `/metadata/00003-8f2c.metadata.json`) or as a full URL. When set, the table is read from exactly this file. A version hint file, such as `/metadata/version-hint.text`, is read on every query instead and names the metadata file to read. Applies only when `from` is a `file://`, `s3://`, `s3a://`, `gs://`, or `gcs://` table root. See [Pin a metadata file](#pin-a-metadata-file). |
| `metadata_path`                | Deprecated. Use `iceberg_metadata_path`. Still accepted with its earlier meaning: the value is used as given, so it must be the full path to the metadata file, and a deprecation warning is logged. |

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
        "Action": ["s3:GetObject", "s3:PutObject"],
        "Resource": "arn:aws:s3:::company-bucketname-datasets/*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "glue:GetCatalog",
          "glue:GetDatabases",
          "glue:GetDatabase",
          "glue:GetTable",
          "glue:GetTables",
          "glue:UpdateTable"
        ],
        "Resource": "*"
      }
    ]
}
```

### Permission Details

| Permission          | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `s3:ListBucket`     | Required. Allows scanning all objects from the bucket          |
| `s3:GetObject`      | Required. Allows fetching objects                              |
| `s3:PutObject`      | Required for write operations. Allows writing objects          |
| `glue:GetCatalog`   | Required. Retrieve metadata about the specified catalog.       |
| `glue:GetDatabases` | Required. List the databases available in the current catalog. |
| `glue:GetDatabase`  | Required. Retrieve metadata about the specified database.      |
| `glue:GetTable`     | Required. Retrieve metadata about the specified table.         |
| `glue:GetTables`    | Required. List the tables available in the current database.   |
| `glue:UpdateTable`  | Required for write operations. Commits new table snapshots.    |

## Read a table without a catalog

An Iceberg table on object storage or the local filesystem can be read without a catalog. Set `from` to the table root, the directory that contains `metadata/`:

```yaml
datasets:
  - from: iceberg:s3://my-bucket/warehouse/db/taxis
    name: taxis
    params:
      iceberg_s3_region: us-east-1
```

The table's schema, snapshots, and data files are read from its Iceberg metadata, so no catalog service is contacted. This reads tables that have no `version-hint.text`, such as tables written by AWS Glue, Athena, or a REST catalog. A `gcs://` location is read as `gs://`. Object-storage credentials use the same `iceberg_s3_*` and `iceberg_gcs_*` parameters as catalog-backed tables.

### Find the current metadata file

Spice finds the current metadata file on every query and every acceleration refresh, so new commits are read without a restart:

1. If `metadata/version-hint.text` exists, Spice reads the metadata file it names. The hint holds a version number, such as `3`, or a file name without its suffix, such as `00003-8f2c`. For a version number, Spice looks for `v3` and then `3`, each with the metadata file suffixes listed below.
2. Otherwise, Spice lists `metadata/` and reads the file with the highest version number. The version is the leading digits of the file name, compared as numbers, so `v10` is newer than `v9`. Leading zeros are padding, and the rest of the name is ignored. If two files share the highest version, the one with the greater `last-updated-ms` is read.

| File name                                                   | Written by                         |
| ----------------------------------------------------------- | ---------------------------------- |
| `<N>-<uuid>.metadata.json`                                  | REST catalogs, AWS Glue, PyIceberg |
| `v<N>.metadata.json`                                        | Hadoop catalogs                    |
| `<N>-<uuid>.gz.metadata.json`, `v<N>.gz.metadata.json`      | The above, gzip-compressed         |
| `<N>-<uuid>.metadata.json.gz`, `v<N>.metadata.json.gz`      | The above, older gzip naming       |

Files with any other name are ignored. When Spice finds the file by listing, it logs a warning when the dataset loads, because without a catalog a commit that is in progress or that failed can be read as the current table:

```text
Dataset 'taxis' has no 'metadata/version-hint.text', so each query reads the Iceberg table at 's3://my-bucket/warehouse/db/taxis' from the metadata file with the highest version number (now 's3://my-bucket/warehouse/db/taxis/metadata/00003-8f2c.metadata.json'). Without a catalog, a commit that is in progress or that failed can be read as the current table. To read a fixed snapshot, set `iceberg_metadata_path`. See: https://spiceai.org/docs/components/data-connectors/iceberg
```

If `from` does not point at a table root, for example `s3://my-bucket/warehouse/db/taxis/metadata`, the dataset fails to load with an error that includes:

```text
No Iceberg metadata file was found in 's3://my-bucket/warehouse/db/taxis/metadata/metadata/'. The table root must contain a 'metadata/' directory with files named 'v<N>.metadata.json' or '<N>-<uuid>.metadata.json'. Verify `from` is the table root, the directory that contains 'metadata/', or set `iceberg_metadata_path` to the metadata file to read.
```

### Pin a metadata file

To read a fixed snapshot, set `iceberg_metadata_path` to the metadata file:

```yaml
datasets:
  - from: iceberg:s3://my-bucket/warehouse/db/taxis
    name: taxis
    params:
      iceberg_s3_region: us-east-1
      iceberg_metadata_path: /metadata/00003-8f2c.metadata.json
```

Spice reads the table from exactly that file and does not list the table's `metadata/` directory, so every query reads the same snapshot.

`iceberg_metadata_path` takes one of two forms:

- A path relative to the table root in `from`. The leading `/` is optional and refers to the table root, not the bucket or filesystem root. A path that contains any `..` segment is refused, even one such as `metadata/archive/../v1.metadata.json` that stays inside the table root.
- A full URL, such as `s3://my-bucket/other/location/metadata/00003-8f2c.metadata.json`, which is used as given and does not need to be under `from`.

`iceberg_metadata_path` can also name a version hint file, such as `/metadata/version-hint.text`. The hint is read on every query and names the metadata file to read from the same directory, as described in [Find the current metadata file](#find-the-current-metadata-file). This matches DuckDB's `version => 'version-hint.text'`.

If `from` names the metadata file itself instead of the table root, the dataset fails to load. When the file sits in a `metadata/` directory, the error gives the exact `from` and `iceberg_metadata_path` values to use; otherwise it asks for `from` to be set to the table's root directory and `iceberg_metadata_path` to the file relative to that root. When `from` is a REST catalog URL, `iceberg_metadata_path` has no effect and Spice logs a warning.

### Read-only access

A table read without a catalog has no catalog to commit writes to, so it is read-only. A dataset that sets `iceberg_metadata_path` (or `metadata_path`) together with `access: read_write` fails to load with this error:

```text
An Iceberg table read from its metadata file (`iceberg_metadata_path`) has no catalog to commit to, so it is read-only. Remove `access: read_write`, keep writes in the acceleration with `acceleration.write_mode: acceleration`, or read the table through an Iceberg catalog to write to it. See: https://spiceai.org/docs/components/data-connectors/iceberg
```

Without `iceberg_metadata_path`, the dataset loads, and each `INSERT INTO` fails with this error:

```text
Iceberg table 'public.taxis' is read directly from its metadata file without a catalog, so it is read-only. Writes require a catalog.
```

Writes kept in the acceleration with [`acceleration.write_mode: acceleration`](../../reference/spicepod/datasets#accelerationwrite_mode) never reach the table and are still accepted.

### Migrate from `metadata_path`

`iceberg_metadata_path` replaces `metadata_path`. The earlier name is still accepted, logs a deprecation warning, and keeps its earlier meaning: its value is used as given rather than resolved against `from`. To migrate, rename the parameter. A full URL works unchanged under the new name, and can be shortened to a path relative to `from`. If both are set, `iceberg_metadata_path` is used. When `from` is an object-storage or local-filesystem table root, a dataset that sets `metadata_path` with `access: read_write` now fails to load, as described above; such writes could not commit before this change.

## Write Support

This connector supports writing data to Iceberg tables using SQL [`INSERT INTO`](../../reference/sql/dml#insert) statements. Writes are currently append-only — inserted data is added as new data files and registered through a new Iceberg table snapshot. Schema validation ensures inserted data matches the target table schema.

To enable writes, set `access: read_write` on the dataset:

```yaml
datasets:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_namespace/tables/my_table
    name: my_table
    access: read_write
    params:
      iceberg_token: ${secrets:iceberg_token}
```

```sql
-- Insert with values
INSERT INTO my_table (id, name, amount)
VALUES (1, 'Alice', 100.0), (2, 'Bob', 200.0);

-- Insert from another table
INSERT INTO my_table
SELECT * FROM source_table;
```

Inserting into partitioned Iceberg tables is supported. `UPDATE` operations are not currently supported. A table read without a catalog is read-only; see [Read-only access](#read-only-access).

Write operations require `s3:PutObject` permission on the target S3 bucket in addition to the read permissions listed above. When the catalog is AWS Glue, writes also require `glue:UpdateTable` permission to commit the new table snapshot. For more details, see [Data Ingestion](../../features/data-ingestion).

### Deleting rows

`DELETE FROM` is supported on **Iceberg v2+ tables only** — a v1 table is refused, because a v1 snapshot has no delete files to write into.

A delete is written as an Iceberg **equality delete file**: "remove rows whose key columns equal these values". The columns that key can carry are every top-level column of the table **except**:

- **Floating-point columns** (`float`, `double`) — equality is not well defined for them (`NaN` is not equal to itself, and `-0.0` equals `0.0`).
- **Nested columns** (`struct`, `list`, `map`).
- **Any column without a Parquet field ID** — the reader resolves delete columns by ID, never by name.

Because the key covers only a subset of the row, a `WHERE` condition that reads a column outside it cannot be expressed exactly: two rows that differ only in an excluded column are indistinguishable to the delete file, so honoring the condition would delete the row beside the one selected. Spice **refuses** those statements rather than deleting more than the condition asked for:

| Statement | Result |
| --- | --- |
| `DELETE FROM t WHERE <keyable columns only>` | Deletes exactly the matching rows. |
| `DELETE FROM t` (no condition) | Deletes every row. |
| `DELETE FROM t WHERE <float or nested column>` | Refused, naming the offending column and the columns the delete *can* match on. |
| `DELETE FROM t WHERE id IN (SELECT ...)` | Refused — a subquery cannot be checked against the columns the delete matches on. Run the subquery first and delete by the values it returns. |
| `DELETE FROM t WHERE <volatile function>` | Refused — a non-deterministic condition such as `random()` is not a function of the row, so no key reproduces it. `now()` and other stable functions are fine. |
| `DELETE FROM t WHERE ...` on a table with **no** keyable column | Refused — an equality delete with no key columns imposes no condition and would empty the table. |

Row-level deletes that address rows by position, which can reproduce any predicate exactly, are a planned follow-up.

## Delete files on federated reads

Federated Iceberg scans apply Iceberg v2 **position and equality delete files** during table scan (via [iceberg-rust](https://github.com/apache/iceberg-rust)). A federated `SELECT` therefore omits rows that a delete file has removed.

The same apply-on-scan path is how [`refresh_mode: full`](../../features/data-acceleration/refresh-modes/full) stays consistent with the table: each refresh re-reads the current snapshot, so delete files that appeared since the last refresh retract those rows from the acceleration.

[`refresh_mode: append`](../../features/data-acceleration/refresh-modes/append) does **not** retract rows when delete files appear. It only pulls rows newer than the accelerated [`time_column`](../../reference/spicepod/datasets#time_column) high-water mark, so a delete of an already-accelerated row is never seen.

[`refresh_mode: changes`](../../features/data-acceleration/refresh-modes/changes) is for database CDC feeds — PostgreSQL WAL, MySQL binlog, Debezium, and the other [CDC connectors](../../features/cdc) — not for applying Iceberg delete files. Iceberg snapshot-diff into `changes` acceleration is not available yet.

Until that path exists, a workaround is **soft deletes** in the Iceberg table (a `deleted` or `deleted_at` column) plus a Spice [view](../../features/views) that filters tombstones (`WHERE deleted = false` or `WHERE deleted_at IS NULL`). The workaround is subject to change. It still lets you get fast queries by applying the soft-delete filter when creating the view. See [Current state from an append-only log](#current-state-from-an-append-only-log).

## Append refresh and table layout

An accelerated Iceberg dataset with [`refresh_mode: append`](../../features/data-acceleration/refresh-modes/append.md) and a [`time_column`](../../reference/spicepod/datasets.md#time_column) polls with a filter on that column. [`refresh_append_overlap`](../../reference/spicepod/datasets.md#accelerationrefresh_append_overlap) widens the window. The scan skips data files whose partition values or column metrics cannot match the filter, and by default it skips Parquet row groups whose statistics cannot match. Page-level statistics inside a row group are not consulted.

How much of each poll is skipped depends on how the table is laid out:

- Partitioning on a time transform of the time column drops whole partitions that fall outside the window.
- Compaction that sorts by the time column keeps each file's and each row group's minimum and maximum close together, so files and row groups of older data are skipped.
- Bin-pack compaction on an unpartitioned table does not order rows by time, so it can put old and new rows in the same file. A file or row group whose minimum is old and whose maximum is new cannot be skipped, and each poll reads it to find a few new rows.

A sort order applies within each partition, so the two combine. Benchmark a time partition, a sort order, or both on the table's real data.

## Current state from an append-only log

For an Iceberg table that records inserts and soft deletes as an append-only log:

1. Accelerate the log **once** with `refresh_mode: append`, a `time_column`, and a `primary_key`. See [End-to-End Incremental Ingestion](../../features/data-acceleration/data-refresh#end-to-end-incremental-ingestion-example).
2. Optionally accelerate a Spice view that applies the soft-delete filter (`WHERE deleted = false` or `WHERE deleted_at IS NULL`) so "current state" is a first-class dataset. The view's store sits on top of the log — roughly twice the disk if it keeps a full filtered copy — and does **not** compact history by itself. Bound disk with [`retention_period`](../../reference/spicepod/datasets#accelerationretention_period) / [`retention_sql`](../../reference/spicepod/datasets#accelerationretention_sql) on the **log** acceleration.

The [end-to-end example](../../features/data-acceleration/data-refresh.md#end-to-end-incremental-ingestion-example) uses [Spice Cayenne](../data-accelerators/cayenne/index.md#duplicate-primary-keys-in-one-write), which keeps the newest version of each key by `time_column`, including when one refresh contains several versions of a key, because the `time_column` (`updated_at`) is not part of the `primary_key`.

A log appended without a `primary_key` keeps every version, so the view must take the latest row for each key first and apply the soft-delete filter second. Filtering first removes the delete event, and the key's previous live version comes back as current:

```sql
SELECT *
FROM (
  SELECT *
  FROM events
  QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY event_time DESC) = 1
)
WHERE deleted = false
```

[Cluster acceleration](../../deployment/architectures/cluster-sidecar) plus a sidecar [SQL results cache](../../features/caching) addresses a different problem. The cache stores query results; it does not apply the soft-delete filter. It moves hot point lookups closer to the application, and it splits the deployment: the cluster holds the accelerated log, and each sidecar keeps its own result cache instead of another filtered copy of that log.

A worked DuckDB example of this log-plus-filtered-view shape is in [Sorted views](../../reference/performance-tuning#sorted-views).

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

### Table Without a Catalog Example

Read an Iceberg table from S3 without a catalog. Each query reads the latest commit. See [Read a table without a catalog](#read-a-table-without-a-catalog).

```yaml
datasets:
  - from: iceberg:s3://my-bucket/warehouse/db/taxis
    name: taxis
    params:
      iceberg_s3_region: us-east-1
      iceberg_s3_access_key_id: ${secrets:aws_access_key_id}
      iceberg_s3_secret_access_key: ${secrets:aws_secret_access_key}
```

Read a Hadoop-style table from a local warehouse:

```yaml
datasets:
  - from: iceberg:file:///tmp/hadoop_warehouse/test/my_table_1
    name: local_hadoop
```

### Pinned Metadata File Example

Read a local Iceberg table from a pinned metadata file. Every query reads the same snapshot. See [Pin a metadata file](#pin-a-metadata-file).

```yaml
datasets:
  - from: iceberg:file:///tmp/hadoop_warehouse/test/my_table_1
    name: local_pinned
    params:
      iceberg_metadata_path: /metadata/v1.metadata.json
```

Follow the table's version hint instead of listing `metadata/`:

```yaml
datasets:
  - from: iceberg:file:///tmp/hadoop_warehouse/test/my_table_1
    name: local_hint
    params:
      iceberg_metadata_path: /metadata/version-hint.text
```

## Cookbook

A cookbook recipe to configure Iceberg as a catalog connector in Spice, including write operations: [Iceberg Catalog Connector](https://github.com/spiceai/cookbook/tree/trunk/catalogs/iceberg#readme).

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Limitations

:::warning[Performance Considerations]

When querying Iceberg tables, performance depends on the size of the table, the complexity of the query, and the underlying storage system. For large tables, consider using appropriate filtering to limit the amount of data scanned.

The connector needs to access both the Iceberg catalog metadata and the underlying data files (typically stored in S3 or a compatible object store). Ensure proper network connectivity and authentication for both systems.

:::

Tables read without a catalog have these additional limitations:

- **Concurrent writers.** Without `iceberg_metadata_path` or a `version-hint.text`, a writer that failed or lost a commit race can leave a metadata file with the highest version, and Spice may read it. Read such tables through their catalog, for AWS Glue the [AWS Glue Data Connector](./glue), or pin a metadata file.
- **Listing cost.** Each query on a table without `iceberg_metadata_path` or a `version-hint.text` lists `metadata/`, so query latency grows with the number of objects in that directory. For large or frequently written tables, pin a metadata file or read through the catalog.
- **Schema changes.** The schema is fixed when the dataset loads. New commits are read on every query, but an added column stays hidden until the dataset reloads, and a renamed or dropped column causes queries to fail.
- **Moved tables.** Iceberg metadata stores absolute file paths, so a copied or moved table still reads its files from the original location.
