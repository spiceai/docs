---
title: 'Snowflake Data Conector'
sidebar_label: 'Snowflake Data Conector'
description: 'Snowflake Data Conector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Snowflake Data Connector enables federated SQL query across datasets in the [Snowflake Cloud Data Warehouse](https://www.snowflake.com/).

```yaml
datasets:
  - from: snowflake:database.schema.table
    name: lineitem
    params: 
      account: ztyvxzt-vgb77424
      warehouse: COMPUTE_WH
```

### Parameters
- `from`: a Snowflake fully qualified table name (database.schema.table). For instance `snowflake:snowflake_sample_data.tpch_sf1.lineitem` or `snowflake:TAXI_DATA."2024".TAXI_TRIPS`
- `account`: a [Snowflake account identifier](https://docs.snowflake.com/en/user-guide/admin-account-identifier) of an organization the table belongs to, for exampple `ztyvxzt-vgb77424`
- `warehouse`: a [Snowflake warehouse](https://docs.snowflake.com/en/user-guide/warehouses-tasks) the table belongs to, for example `COMPUTE_WH`

### Auth

Data connector supports Snowflake basic authentication (username and password) that must be configured using `spice login snowflake` or using [Secrets Stores](/secret-stores).

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login snowflake -u <username> -p <password>
    ```

    Learn more about [File Secret Store](/secret-stores/file).
  </TabItem>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_SNOWFLAKE_USERNAME=<username> \
    SPICE_SECRET_SNOWFLAKE_PASSWORD=<password> \
    spice run
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      store: env
    
    # <...>
    ```

    Learn more about [Env Secret Store](/secret-stores/env).
  </TabItem>
  <TabItem value="k8s" label="Kubernetes">
    ```bash
    kubectl create secret generic snowflake \
      --from-literal=username='<username>' \
      --from-literal=password='<password>'
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      store: kubernetes
    
    # <...>
    ```

    Learn more about [Kubernetes Secret Store](/secret-stores/kubernetes).
  </TabItem>
  <TabItem value="keyring" label="Keyring">
    Add new keychain entry (macOS), with user and password in JSON string

    ```bash
    security add-generic-password -l "Snowflake Secret" \
    -a spiced -s spice_secret_snowflake\
    -w $(echo -n '{"username": "<username>", "password": "<password>"}')
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      store: keyring
    
    # <...>
    ```

    Learn more about [Keyring Secret Store](/secret-stores/keyring).
  </TabItem>
</Tabs>

## Example

```yaml
datasets:
  - from: snowflake:snowflake_sample_data.tpch_sf1.lineitem
    name: lineitem
    params: 
      account: ztyvxzt-vgb77424
      warehouse: COMPUTE_WH
```
