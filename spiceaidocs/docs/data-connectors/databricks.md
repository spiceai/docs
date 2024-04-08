---
title: 'Databricks Data Connector'
sidebar_label: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Databricks as a connector for federated SQL query against Databrick's [Delta Lake](https://docs.databricks.com/en/delta/index.html). 

## Configuration

`spice login databricks` can be used to configure secrets for the Spice runtime (including AWS object store keys). 

### Parameters
- `endpoint`: The HTTPS endpoint of the Databricks host storing the desired tables.
- `timeout`: The timeout duration for calls to underlying object store in string format. Default to `300s`.

### Auth

An active personal access token for the Databricks instance is required (equivalent to `DATABRICKS_TOKEN`). 
Other keys provided in the secret are directly passed to the underlying secret store (e.g. `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if backed by AWS S3).

By default Databricks connector will look for a secret named `databricks` with keys `token` and `AWS_DEFAULT_REGION`, 
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

Check [Secrets Stores](/secret-stores) for more details.

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login databricks --token <access-token> --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>
    ```

    Learn more about [File Secret Store](/secret-stores/file).
  </TabItem>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_DATABRICKS_TOKEN=<access-token> \
    SPICE_SECRET_DATABRICKS_AWS_DEFAULT_REGION=<aws-region> \
    SPICE_SECRET_DATABRICKS_AWS_ACCESS_KEY_ID=<aws-access-key-id> \
    SPICE_SECRET_DATABRICKS_AWS_SECRET_ACCESS_KEY=<aws-secret-access-key> \
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
    kubectl create secret generic databricks \
      --from-literal=token='<access-token>' \
      --from-literal=AWS_DEFAULT_REGION='<aws-region>' \
      --from-literal=AWS_ACCESS_KEY_ID='<aws-access-key-id>' \
      --from-literal=AWS_SECRET_ACCESS_KEY='<aws-secret-access-key>'
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
    security add-generic-password -l "Databricks Secret" \
    -a spiced -s spice_secret_databricks \
    -w $(echo -n '{"token": "<access-token>", "AWS_DEFAULT_REGION": "<aws-region>", "AWS_ACCESS_KEY_ID": "<aws-access-key-id>", "AWS_SECRET_ACCESS_KEY": "<aws-secret-access-key>"}')
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
  - from: databricks:spiceai.datasets.my_awesome_table  // A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
  params:
    endpoint: "https://dbc-a1b2345c-d6e7.cloud.databricks.com"
```
