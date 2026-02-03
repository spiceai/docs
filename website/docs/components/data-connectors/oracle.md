---
title: 'Oracle Data Connector'
sidebar_label: 'Oracle Data Connector'
description: 'Oracle Data Connector Documentation'
tags:
  - data-connectors
  - oracle
---

The Oracle Data Connector enables SQL queries on data stored in Oracle databases, including on-premises instances, Oracle Cloud User-Managed Databases, and Oracle Cloud Autonomous Databases (ADB).

```yaml
datasets:
  - from: oracle:"SH"."PRODUCTS"
    name: my_dataset
    params:
      oracle_host: localhost
      oracle_port: 1521
      oracle_username: scott
      oracle_password: ${secrets:oracle_password}
      oracle_service_name: XEPDB1
```

:::warning[Limitations]

1. Only basic filter predicates are currently pushed down to the Oracle database. Full query federation is not currently supported. Joins, subqueries, and complex query constructs are not pushed down to the Oracle database; these operations are performed in-memory after data retrieval. **Enable [Data Acceleration](../../features/data-acceleration) for full federation support**.
2. The Oracle connector does not support filter push-down optimization for datetime columns. Filtering on these columns is performed in-memory after data retrieval.
3. The following Oracle data types are not currently supported; columns with these types will be ignored: `INTERVAL YEAR TO MONTH` (Code 182), `INTERVAL DAY TO SECOND` (Code 183), `UROWID` (Code 208), `BFILE` (Code 114), `JSON` (Code 119).

:::

## Configuration

### `from`

The `from` field takes the form `oracle:"schema_name"."table_name"` where both schema and table names should be quoted to handle case sensitivity properly.

Example:

```yaml
datasets:
  - from: oracle:"SH"."PRODUCTS"
    name: products
    params:
      oracle_host: localhost
      oracle_username: scott
      oracle_password: ${secrets:ORACLE_PASSWORD}
```

### `name`

The dataset name. This will be used as the table name within Spice.

Example:

```yaml
datasets:
  - from: oracle:"SH"."PRODUCTS"
    name: products
    params: ...
```

```sql
SELECT COUNT(*) FROM products;
```

```shell
+----------+
| count(*) |
+----------+
|  10500   |
+----------+
```

### `params`

The Oracle data connector can be configured by providing the following `params`. Use the [secret replacement syntax](../secret-stores) to load the secret from a secret store, e.g. `${secrets:MY_ORACLE_PASSWORD}`.

| Parameter Name             | Description                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `oracle_connection_string` | The connection string to use to connect to the Oracle server. This can be a TNS alias from `tnsnames.ora` for local mTLS/Wallet connections or an [Easy Connect](https://download.oracle.com/ocomdocs/global/Oracle-Net-Easy-Connect-Plus.pdf) string. |
| `oracle_host`              | The hostname or IP address of the Oracle Database instance. Required when not using `oracle_connection_string`.                                                                                                                                        |
| `oracle_port`              | Optional. The port of the Oracle Database server. Default: `1521`                                                                                                                                                                                      |
| `oracle_username`          | The Oracle username. Required.                                                                                                                                                                                                                         |
| `oracle_password`          | The password to connect with. Required.                                                                                                                                                                                                                |
| `oracle_service_name`      | The Oracle Database service name to connect to. Default: `XEPDB1`                                                                                                                                                                                      |
| `oracle_wallet_sso_cert`   | The base64-encoded `cwallet.sso` (wallet auto-login certificate) to use for mTLS authentication with Oracle Cloud.                                                                                                                                     |
| `oracle_wallet`            | Specifies the Oracle wallet location used to save the provided mTLS certificate (`oracle_wallet_sso_cert`) or retrieve an existing/pre-downloaded certificate.                                                                                         |

## Types

The table below shows the Oracle data types supported, along with the type mapping to Apache Arrow types in Spice.

| Oracle Type                      | Arrow Type                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `ROWID`                          | `Utf8`                                                                           |
| `CHAR`                           | `Utf8`                                                                           |
| `NCHAR`                          | `Utf8`                                                                           |
| `VARCHAR2`                       | `Utf8`                                                                           |
| `NVARCHAR2`                      | `Utf8`                                                                           |
| `LONG`                           | `Utf8`                                                                           |
| `CLOB`                           | `LargeUtf8`                                                                      |
| `NCLOB`                          | `LargeUtf8`                                                                      |
| `NUMBER`                         | `Int64` for integer types (scale=0, precision≤18), otherwise `Decimal128`        |
| `FLOAT`                          | `Float32` for precision≤24, otherwise `Float64`                                  |
| `BINARY_FLOAT`                   | `Float32`                                                                        |
| `BINARY_DOUBLE`                  | `Float64`                                                                        |
| `BOOLEAN`                        | `Boolean`                                                                        |
| `DATE`                           | `Date32`                                                                         |
| `TIMESTAMP`                      | `Timestamp(Second)` for precision=0, otherwise `Timestamp(Nanosecond)`           |
| `TIMESTAMP WITH TIME ZONE`       | `Timestamp(Second, UTC)` for precision=0, otherwise `Timestamp(Nanosecond, UTC)` |
| `TIMESTAMP WITH LOCAL TIME ZONE` | `Timestamp(Second, UTC)` for precision=0, otherwise `Timestamp(Nanosecond, UTC)` |
| `RAW`                            | `Binary`                                                                         |
| `LONG RAW`                       | `Binary`                                                                         |
| `BLOB`                           | `LargeBinary`                                                                    |

:::note

- The Oracle `TIMESTAMP WITH LOCAL TIME ZONE` value is retrieved as a UTC time value.

:::

## Examples

### Connecting to On-Premises Oracle Database

```yaml
datasets:
  - from: oracle:"SH"."PRODUCTS"
    name: products
    params:
      oracle_host: localhost
      oracle_port: 1521
      oracle_username: scott
      oracle_password: ${secrets:ORACLE_PASSWORD}
      oracle_service_name: XEPDB1
```

### Connecting to Oracle Cloud Autonomous Database with mTLS (Wallet-based)

### Wallet Folder Exists Locally

If your Oracle Cloud Autonomous Database wallet folder is available locally, specify its path using the `oracle_wallet` parameter. Set the `oracle_connection_string` to the TNS alias defined in your wallet's `tnsnames.ora` file.

Example:

```yaml
datasets:
  - from: oracle:"SALES"
    name: sales
    params:
      oracle_username: admin
      oracle_password: ${secrets:ORACLE_PASSWORD}
      oracle_connection_string: 'fgp1tqs1e_low'  # TNS alias from tnsnames.ora
      oracle_wallet: '/path/to/wallet_folder'
```

### Wallet Auto-Login (SSO) Certificate Provided via Application Secret

If your Oracle Cloud Autonomous Database wallet folder is not available locally, provide the base64-encoded wallet auto-login (SSO) certificate (`cwallet.sso`) using the `oracle_wallet_sso_cert` parameter. Set the `oracle_connection_string` to the Easy Connect string from the _Database connection_ section.

```yaml
datasets:
  - from: oracle:"SALES"
    name: sales
    params:
      oracle_username: admin
      oracle_password: ${secrets:ORACLE_PASSWORD}
      oracle_wallet_sso_cert: ${secrets:oracle_wallet_sso_cert}
      oracle_connection_string: 'tcps://adb.us-sanjose-1.oraclecloud.com:1522/g81f1d1d5c853_fgc1e_low.adb.oraclecloud.com?ssl_server_dn_match=yes'
```

To generate a base64-encoded wallet certificate for use as a secret:

```shell
base64 -i cwallet.sso > cwallet.b64.txt
```

### Connecting with Easy Connect string (TLS-only, no wallet required)

```yaml
datasets:
  - from: oracle:"SALES"
    name: sales
    params:
      oracle_username: admin
      oracle_password: ${secrets:ORACLE_PASSWORD}
      oracle_connection_string: 'tcps://adb.us-sanjose-1.oraclecloud.com:1522/g81f1d1d5c853_fgc1e_low.adb.oraclecloud.com?ssl_server_dn_match=yes'
```

## Installation Requirements

The Oracle data connector requires the Oracle Instant Client or Oracle Database Client libraries to be installed on the system where Spice is running. Follow the [Oracle installation guide](https://oracle.github.io/odpi/) for your platform.

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../../components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../../components/secret-stores#using-secrets).

## Cookbook

- A cookbook recipe to connect to and accelerate data from an Oracle database in Spice. [Oracle Data Connector](https://github.com/spiceai/cookbook/blob/trunk/oracle/README)
