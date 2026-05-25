---
title: 'Oracle Catalog Connector'
sidebar_label: 'Oracle'
description: 'Connect to an Oracle database as a catalog provider for federated SQL query.'
sidebar_position: 11
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - oracle
  - data-connectors
---

Connect to an [Oracle](https://www.oracle.com/database/) database as a catalog provider for federated SQL query. The Oracle Catalog Connector automatically discovers schemas and tables within an Oracle database and makes them available for querying in Spice. Supports on-premises instances, Oracle Cloud User-Managed Databases, and Oracle Cloud Autonomous Databases (ADB).

For connecting to individual Oracle tables, see the [Oracle Data Connector documentation](../data-connectors/oracle).

## Configuration

```yaml
catalogs:
  - from: oracle
    name: my_oracle
    include:
      - 'HR.*' # include all tables from the HR schema
    params:
      oracle_host: localhost
      oracle_port: '1521'
      oracle_username: ${secrets:ORACLE_USER}
      oracle_password: ${secrets:ORACLE_PASS}
      oracle_service_name: XEPDB1
```

## `from`

The `from` field specifies the catalog provider. For Oracle, use `oracle`.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the Oracle database will be available under this catalog name. The schema hierarchy of the Oracle database is preserved in Spice.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `params`

Connection can be configured using a connection string or individual parameters. In both cases, `oracle_username` and `oracle_password` are required.

### Connection string

| Parameter Name             | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| `oracle_connection_string` | An Oracle connection string. E.g. `//myhost:1521/ORCLPDB1`. |
| `oracle_username`          | The Oracle username for authentication.                     |
| `oracle_password`          | The Oracle password for authentication.                     |

### Individual parameters

| Parameter Name        | Description                                 |
| --------------------- | ------------------------------------------- |
| `oracle_host`         | The Oracle host address.                    |
| `oracle_port`         | The Oracle port number. Default: `1521`.    |
| `oracle_service_name` | The Oracle service name. Default: `XEPDB1`. |
| `oracle_username`     | The Oracle username for authentication.     |
| `oracle_password`     | The Oracle password for authentication.     |

### Wallet parameters (for Oracle Cloud ADB)

| Parameter Name           | Description                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oracle_wallet`          | Path to the Oracle wallet directory used for mTLS connections. Also used as the destination directory when `oracle_wallet_sso_cert` is set. Default: `.oracle`. |
| `oracle_wallet_sso_cert` | Base64-encoded `cwallet.sso` (wallet auto-login certificate) content. The runtime writes the decoded certificate to `oracle_wallet`.                     |

## Authentication

### Basic authentication

```yaml
catalogs:
  - from: oracle
    name: my_oracle
    params:
      oracle_host: localhost
      oracle_port: '1521'
      oracle_username: ${secrets:ORACLE_USER}
      oracle_password: ${secrets:ORACLE_PASS}
      oracle_service_name: ORCLPDB1
```

### Connection string

```yaml
catalogs:
  - from: oracle
    name: my_oracle
    params:
      oracle_connection_string: //myhost:1521/ORCLPDB1
      oracle_username: ${secrets:ORACLE_USER}
      oracle_password: ${secrets:ORACLE_PASS}
```

### Oracle Cloud Autonomous Database (mTLS)

```yaml
catalogs:
  - from: oracle
    name: my_oracle
    params:
      oracle_connection_string: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=abc_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
      oracle_username: ${secrets:ORACLE_USER}
      oracle_password: ${secrets:ORACLE_PASS}
      oracle_wallet: /path/to/wallet
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores#using-secrets).
