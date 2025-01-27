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
---

Connect to an [Iceberg](https://iceberg.apache.org/) catalog provider and query Iceberg tables.

## Configuration

```yaml
catalogs:
  - from: iceberg:https://iceberg-catalog-host.com/v1/namespaces/my_catalog
    name: ice # tables from this catalog will be available in the "ice" catalog in Spice
    include:
      - "*.my_table_name" # include only the "my_table_name" tables
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

  # AWS Glue Catalog
  - from: iceberg:https://glue.us-east-1.amazonaws.com/iceberg/v1/catalogs/123456789012/namespaces
    name: glue
    params:
      iceberg_sigv4_enabled: true
```

## `from`

The `from` field is used to specify the catalog provider. For Iceberg, use `iceberg:<namespace_path>`. The `namespace_path` is the URL to the Iceberg namespace in the catalog provider to load the tables from. It is formatted as `http[s]://<iceberg_catalog_host>/v1/{prefix}/namespaces/<namespace_name>`.

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

## `name`

The `name` field is used to specify the name of the catalog in Spice. Tables from the Iceberg catalog will be available in the schema with this name in Spice. The schema hierarchy of the external catalog is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

## `params`

The following parameters are supported for configuring the connection to the Iceberg catalog/tables:

| Parameter Name | Definition |
|---------------|------------|
| `iceberg_token` | Bearer token value to use for Authorization header. |
| `iceberg_oauth2_credential` | Credential to use for OAuth2 client credential flow when initializing the catalog. Format: `<client_id>:<client_secret>` |
| `iceberg_oauth2_scope` | Scope to use for OAuth2 client credential flow when initializing the catalog. Default: `catalog` |
| `iceberg_oauth2_server_url` | URL of the OAuth2 server tokens endpoint for the client credential flow. |
| `iceberg_s3_endpoint` | S3-compatible endpoint where the Iceberg tables are stored. |
| `iceberg_s3_region` | Region of the S3-compatible endpoint. |
| `iceberg_s3_access_key_id` | Access key ID for the S3-compatible endpoint. |
| `iceberg_s3_secret_access_key` | Secret access key for the S3-compatible endpoint. |
| `iceberg_s3_session_token` | Session token for the S3-compatible endpoint. |
| `iceberg_s3_role_arn` | ARN of the IAM role to assume when accessing the S3-compatible endpoint. |
| `iceberg_s3_role_session_name` | Session name to use when assuming the IAM role. |
| `iceberg_s3_connect_timeout` | Connection timeout in seconds for the S3-compatible endpoint. Default: `60` |
| `iceberg_sigv4_enabled` | Enable SigV4 (AWS Signature Version 4) authentication when connecting to the catalog. Automatically enabled if the URL in `from` is an AWS Glue catalog. Default: `false` |
| `iceberg_signing_region` | Region to use for SigV4 authentication. Extracted from the URL in `from` if not specified. |
| `iceberg_signing_name` | Service name to use for SigV4 authentication. Default: `glue`. |

## Cookbook

- A cookbook recipe to configure Iceberg as a catalog connector in Spice. [Iceberg Catalog Connector](https://github.com/spiceai/cookbook/tree/trunk/catalogs/iceberg#readme)
