---
title: 'Databricks Data Connector'
sidebar_label: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Databricks as a connector for federated SQL query against Databricks using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html) or directly from Delta Tables in S3.

## Configuration

`spice login databricks` can be used to configure the Databricks access token for the Spice runtime. 

### Parameters
- `endpoint`: The endpoint of the Databricks instance.
- `mode`: The execution mode for querying against Databricks. The default is `spark_connect`. Possible values:
  - `spark_connect`: Use Spark Connect to query against Databricks.
  - `s3`: Query directly from Delta Tables in S3.
- `format`: The format of the data to query. The default is `deltalake`. Only valid when `mode` is `s3`. Possible values:
  - `deltalake`: Query Delta Tables.
- `databricks-cluster-id`: The ID of the compute cluster in Databricks to use for the query. Only valid when `mode` is `spark_connect`.

### Auth

An active personal access token for the Databricks instance is required (equivalent to `DATABRICKS_TOKEN`).

By default the Databricks connector will look for a secret named `databricks` with keys `token`.

Check [Secrets Stores](/secret-stores) for more details.

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login databricks --token <access-token>
    ```

    Learn more about [File Secret Store](/secret-stores/file).
  </TabItem>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_DATABRICKS_TOKEN=<access-token> \
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
      --from-literal=token='<access-token>'
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
    -w $(echo -n '{"token": "<access-token>"}')
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
    endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
    databricks-cluster-id: 1234-567890-abcde123
```
