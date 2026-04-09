---
title: 'Snowflake Data Connector'
sidebar_label: 'Snowflake Data Connector'
description: 'Snowflake Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Snowflake Data Connector enables federated SQL queries across datasets in the [Snowflake Cloud Data Warehouse](https://www.snowflake.com/).

```yaml
datasets:
  - from: snowflake:DATABASE.SCHEMA.TABLE
    name: table
    params:
      snowflake_warehouse: COMPUTE_WH
      snowflake_role: accountadmin
```

:::info[Hint]
Unquoted identifiers are normalized to lowercase by Spice. Snowflake normalizes unquoted identifiers to uppercase, so unquoted identifiers in the `from` field should be UPPERCASED (e.g. `snowflake:MY_DATABASE.MY_SCHEMA.MY_TABLE`). To reference a table created with mixed-case in Snowflake, wrap it in double quotes: `snowflake:MY_DATABASE.MY_SCHEMA."mixedCaseTable"`. See [Snowflake identifier resolution](https://docs.snowflake.com/en/sql-reference/identifiers-syntax#label-identifier-casing) and [Identifier Case Sensitivity](./index.md#identifier-case-sensitivity-and-quoting).
:::

## Configuration

### `from`

A Snowflake fully qualified table name (database.schema.table). For instance `snowflake:SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM` or `snowflake:TAXI_DATA."2024".TAXI_TRIPS`

### `name`

The dataset name. This will be used as the table name within Spice. The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords) or any of the following keywords that are reserved by Snowflake:

- `START`
- `CONNECT`
- `MATCH_RECOGNIZE`
- `SAMPLE`
- `TABLESAMPLE`
- `FROM`

### `params`

| Parameter Name                     | Description                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `snowflake_warehouse`              | Optional, specifies the [Snowflake Warehouse](https://docs.snowflake.com/en/user-guide/warehouses-tasks) to use |
| `snowflake_role`                   | Optional, specifies the role to use for accessing Snowflake data                                                |
| `snowflake_account`                | Required, specifies the Snowflake account-identifier                                                            |
| `snowflake_username`               | Required, specifies the Snowflake username to use for accessing Snowflake data                                  |
| `snowflake_auth_type`              | Optional, specifies the authentication type: `snowflake` (default, password-based) or `keypair`                 |
| `snowflake_password`               | Required when `snowflake_auth_type` is `snowflake` (default). Specifies the Snowflake password for authentication |
| `snowflake_private_key`            | Optional, specifies the Snowflake private key content as a string (for key-pair auth)                           |
| `snowflake_private_key_path`       | Optional, specifies the path to Snowflake private key file (for key-pair auth)                                  |
| `snowflake_private_key_passphrase` | Optional, specifies the Snowflake private key passphrase (for encrypted keys)                                   |

## Auth

The connector supports password-based and [key-pair](https://docs.snowflake.com/en/user-guide/key-pair-auth) authentication that must be configured using `spice login snowflake` or using [Secrets Stores](../secret-stores/). Login requires the account identifier ('orgname-accountname' format) - use [Finding the organization and account name for an account](https://docs.snowflake.com/en/user-guide/admin-account-identifier#finding-the-organization-and-account-name-for-an-account) instructions.

<img width="800" src="/img/snowflake/ui-snowsight-account-identifier.png" />

<Tabs>
  <TabItem value="env" label="Env">

    ```bash
    # Password-based
    SPICE_SECRET_SNOWFLAKE_ACCOUNT=<account-identifier> \
    SPICE_SECRET_SNOWFLAKE_USERNAME=<username> \
    SPICE_SECRET_SNOWFLAKE_PASSWORD=<password> \
    spice run
    # Key-pair using private key file (the `<private-key-passphrase>` is optional, used for encrypted keys only)
    SPICE_SECRET_SNOWFLAKE_ACCOUNT=<account-identifier> \
    SPICE_SECRET_SNOWFLAKE_USERNAME=<username> \
    SPICE_SECRET_SNOWFLAKE_PRIVATE_KEY_PATH=<path-to-private-key> \
    SPICE_SECRET_SNOWFLAKE_PRIVATE_KEY_PASSPHRASE=<private-key-passphrase> \
    spice run
    # Key-pair using private key content (the `<private-key-passphrase>` is optional, used for encrypted keys only)
    SPICE_SECRET_SNOWFLAKE_ACCOUNT=<account-identifier> \
    SPICE_SECRET_SNOWFLAKE_USERNAME=<username> \
    SPICE_SECRET_SNOWFLAKE_PRIVATE_KEY=<private-key-pem-content> \
    SPICE_SECRET_SNOWFLAKE_PRIVATE_KEY_PASSPHRASE=<private-key-passphrase> \
    spice run
    ```

    or using the Spice CLI:

    ```bash
    # Password-based
    spice login snowflake -a <account-identifier> -u <username> -p <password>
    # Key-pair (the `<private-key-passphrase>` is an optional parameter and is used for encrypted private key only)
    spice login snowflake -a <account-identifier> -u <username> -k <path-to-private-key> -s <private-key-passphrase>
    ```

    The CLI will create or update an `.env` file that looks like:
    ```bash
    SPICE_SNOWFLAKE_ACCOUNT="account"
    SPICE_SNOWFLAKE_PASSWORD="pass"
    SPICE_SNOWFLAKE_USERNAME="user"
    ```

    Configure the spicepod to load secrets from the `env` secret store: (Note: This is the default setting)

    `spicepod.yaml`
    ```yaml
    version: v1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: env
        name: env

    datasets:
      - from: snowflake:DATABASE.SCHEMA.TABLE
        name: table
        params:
          snowflake_warehouse: COMPUTE_WH
          snowflake_role: accountadmin
          snowflake_username: ${env:SPICE_SNOWFLAKE_USERNAME}
          snowflake_password: ${env:SPICE_SNOWFLAKE_PASSWORD}
          snowflake_account: ${env:SPICE_SNOWFLAKE_ACCOUNT}
    ```

    Learn more about [Env Secret Store](../secret-stores/env/).

  </TabItem>
  <TabItem value="k8s" label="Kubernetes">
  
    ```bash
    # Password-based
    kubectl create secret generic snowflake \
      --from-literal=account='<account-identifier>' \
      --from-literal=username='<username>' \
      --from-literal=password='<password>'

    # Key-pair using private key file (the `<private-key-passphrase>` is optional, used for encrypted keys only)
    kubectl create secret generic snowflake \
      --from-literal=account='<account-identifier>' \
      --from-literal=username='<username>' \
      --from-literal=private_key_path='<path-to-private-key>' \
      --from-literal=private_key_passphrase='<private-key-passphrase>'

    # Key-pair using private key content (the `<private-key-passphrase>` is optional, used for encrypted keys only)
    kubectl create secret generic snowflake \
      --from-literal=account='<account-identifier>' \
      --from-literal=username='<username>' \
      --from-file=private_key='<path-to-private-key>' \
      --from-literal=private_key_passphrase='<private-key-passphrase>'
    ```

    `spicepod.yaml` (password-based)
    ```yaml
    version: v1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: kubernetes:snowflake
        name: snowflake

    datasets:
      - from: snowflake:DATABASE.SCHEMA.TABLE
        name: table
        params:
          snowflake_warehouse: COMPUTE_WH
          snowflake_role: accountadmin
          snowflake_username: ${snowflake:username}
          snowflake_password: ${snowflake:password}
          snowflake_account: ${snowflake:account}
    ```

    Learn more about [Kubernetes Secret Store](../secret-stores/kubernetes/).

  </TabItem>
  <TabItem value="keyring" label="Keyring">
    Add new keychain entries (macOS) for user and password:

    ```bash
    # Password-based
    security add-generic-password -l "Snowflake Secret" \
    -a spiced -s spice_snowflake_password\
    -w <password>

    # Key-pair using private key content (the `<private-key-passphrase>` is optional, used for encrypted keys only)
    security add-generic-password -l "Snowflake Secret" \
    -a spiced -s spice_snowflake_private_key\
    -w $(cat '<path-to-private-key>')
    ```

    `spicepod.yaml` (key-pair)
    ```yaml
    version: v1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: keyring
        name: keyring

    datasets:
      - from: snowflake:DATABASE.SCHEMA.TABLE
        name: table
        params:
          snowflake_warehouse: COMPUTE_WH
          snowflake_role: accountadmin
          snowflake_auth_type: keypair
          snowflake_username: user_name
          snowflake_private_key: ${keyring:spice_snowflake_private_key}
          snowflake_account: account_identifier
    ```

    Learn more about [Keyring Secret Store](../secret-stores/keyring/).

  </TabItem>
</Tabs>

## Example

```yaml
datasets:
  - from: snowflake:SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM
    name: lineitem
    params:
      snowflake_warehouse: COMPUTE_WH
      snowflake_role: accountadmin
```

:::warning[Limitations]

1. Account identifier does not support the [Legacy account locator in a region format](https://docs.snowflake.com/en/user-guide/admin-account-identifier#format-2-legacy-account-locator-in-a-region). Use [Snowflake preferred name in organization format](https://docs.snowflake.com/en/user-guide/admin-account-identifier#format-1-preferred-account-name-in-your-organization).
1. The connector supports password-based and [key-pair](https://docs.snowflake.com/en/user-guide/key-pair-auth) authentication.

:::

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](../secret-stores/). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](../secret-stores/#using-secrets).

## Cookbook

- A cookbook recipe to configure Snowflake as a data connector in Spice. [Snowflake Data Connector](https://github.com/spiceai/cookbook/tree/trunk/snowflake#readme)
