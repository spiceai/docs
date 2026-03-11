---
title: 'Snowflake Catalog Connector'
sidebar_label: 'Snowflake'
description: 'Connect to a Snowflake database as a catalog provider for federated SQL query.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - snowflake
  - data-connectors
---

Connect to a [Snowflake](https://www.snowflake.com/) database as a catalog provider for federated SQL query. The Snowflake Catalog Connector automatically discovers schemas and tables within a Snowflake database and makes them available for querying in Spice.

For connecting to individual Snowflake tables, see the [Snowflake Data Connector documentation](../data-connectors/snowflake).

## Configuration

```yaml
catalogs:
  - from: snowflake:MY_DATABASE
    name: my_snowflake
    include:
      - 'MY_SCHEMA.*' # include all tables from MY_SCHEMA
    params:
      snowflake_account: myaccount
      snowflake_username: ${secrets:SNOWFLAKE_USERNAME}
      snowflake_password: ${secrets:SNOWFLAKE_PASSWORD}
      snowflake_warehouse: COMPUTE_WH
      snowflake_role: ACCOUNTADMIN
```

## `from`

The `from` field specifies the Snowflake database to use as a catalog. Use `snowflake:<database_name>`, where `database_name` is the name of the Snowflake database.

:::info[Hint]
Unquoted identifiers in Snowflake are stored as uppercase. Use uppercase database names in the `from` field. See [Snowflake Identifier Resolution](https://docs.snowflake.com/en/sql-reference/identifiers-syntax#label-identifier-casing).
:::

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the Snowflake database will be available under this catalog name. The schema hierarchy of the Snowflake database is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `params`

| Parameter Name                     | Description                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `snowflake_account`                | The Snowflake [account identifier](https://docs.snowflake.com/en/user-guide/admin-account-identifier).   |
| `snowflake_username`               | The Snowflake username for authentication.                                                               |
| `snowflake_password`               | The Snowflake password for authentication. Use the [secret replacement syntax](../secret-stores).        |
| `snowflake_warehouse`              | The Snowflake [warehouse](https://docs.snowflake.com/en/user-guide/warehouses-tasks) to use for queries. |
| `snowflake_role`                   | The Snowflake [role](https://docs.snowflake.com/en/user-guide/security-access-control-overview) to use.  |
| `snowflake_auth_type`              | Authentication type: `snowflake` (default) or `keypair`.                                                 |
| `snowflake_private_key`            | The private key content for key pair authentication. Used when `auth_type` is `keypair`.                 |
| `snowflake_private_key_path`       | Path to a private key file for key pair authentication. Used when `auth_type` is `keypair`.              |
| `snowflake_private_key_passphrase` | Passphrase for the private key file, if encrypted.                                                       |

## Authentication

### Password authentication (default)

```yaml
catalogs:
  - from: snowflake:MY_DATABASE
    name: my_snowflake
    params:
      snowflake_account: myaccount
      snowflake_username: ${secrets:SNOWFLAKE_USERNAME}
      snowflake_password: ${secrets:SNOWFLAKE_PASSWORD}
```

### Key pair authentication

```yaml
catalogs:
  - from: snowflake:MY_DATABASE
    name: my_snowflake
    params:
      snowflake_account: myaccount
      snowflake_username: ${secrets:SNOWFLAKE_USERNAME}
      snowflake_auth_type: keypair
      snowflake_private_key_path: /path/to/rsa_key.p8
      snowflake_private_key_passphrase: ${secrets:SNOWFLAKE_KEY_PASSPHRASE}
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
