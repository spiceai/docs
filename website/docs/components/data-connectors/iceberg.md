---
title: 'Iceberg Data Connector'
sidebar_label: 'Iceberg Data Connector'
description: 'Connect to and query Apache Iceberg tables'
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

The `from` field specifies the Iceberg table to connect to, in the format `iceberg:<table_path>`. The `table_path` is the URL to the Iceberg table in the catalog provider. For REST Catalogs, use the format `http[s]://<iceberg_catalog_host>/v1/{prefix}/namespaces/<namespace_name>/tables/<table_name>`. For AWS Glue, use the format `https://glue.<region>.amazonaws.com/iceberg/v1/catalogs/<account_id>/namespaces/<namespace_name>/tables/<table_name>`, where `<account_id>` is your AWS account ID.

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
| `iceberg_s3_access_key_id`     | Access key ID for the S3-compatible endpoint.                                                                                                                                                  |
| `iceberg_s3_secret_access_key` | Secret access key for the S3-compatible endpoint.                                                                                                                                              |
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
