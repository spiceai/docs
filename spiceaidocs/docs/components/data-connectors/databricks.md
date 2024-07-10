---
title: 'Databricks Data Connector'
sidebar_label: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Databricks as a connector for federated SQL query against Databricks using [Spark Connect](https://www.databricks.com/blog/2022/07/07/introducing-spark-connect-the-power-of-apache-spark-everywhere.html) or directly from [Delta Lake](https://delta.io/) tables.

## Configuration

`spice login databricks` can be used to configure the secrets needed for Databricks.

<Tabs>
  <TabItem value="spark_connect" label="Spark Connect" default>
    ```yaml
    params:
      endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      mode: spark_connect
      databricks_cluster_id: 1234-567890-abcde123
    ```

    ```bash
    spice login databricks --token <access-token>
    ```

  </TabItem>
  <TabItem value="delta_lake_s3" label="Delta Lake + S3">
    ```yaml
    params:
      endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      mode: delta_lake
    ```

    ```bash
    spice login databricks --token <access-token> --aws-region <aws-region> --aws-access-key-id <aws-access-key-id> --aws-secret-access-key <aws-secret-access-key>
    ```

  </TabItem>
  <TabItem value="delta_lake_azure" label="Delta Lake + Azure Blob">
    ```yaml
    params:
      endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      mode: delta_lake
    ```

    ```bash
    spice login databricks --token <access-token> --azure-storage-account-name <account-name> --azure-storage-access-key <access-key>
    ```

  </TabItem>
  <TabItem value="delta_lake_gcp" label="Delta Lake + Google Storage">
    ```yaml
    params:
      endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      mode: delta_lake
    ```

    ```bash
    spice login databricks --token <access-token> --google-service-account-path /path/to/service-account.json
    ```

  </TabItem>
</Tabs>

### Parameters

- `endpoint`: The endpoint of the Databricks instance.
- `mode`: The execution mode for querying against Databricks. The default is `spark_connect`. Possible values:
  - `spark_connect`: Use Spark Connect to query against Databricks. Requires a Spark cluster to be available.
  - `delta_lake`: Query directly from Delta Tables. Requires the object store credentials to be provided.
- `databricks_cluster_id`: The ID of the compute cluster in Databricks to use for the query. Only valid when `mode` is `spark_connect`.
- `databricks_use_ssl`: If true, use a TLS connection to connect to the Databricks endpoint. Default is `true`.

### Auth

An active personal access token for the Databricks instance is required (equivalent to `DATABRICKS_TOKEN`).

By default the Databricks connector will look for a secret named `databricks` with keys `token`.

Check [Secrets Stores](/secret-stores) for more details.

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login databricks --token <access-token>
    ```

    Learn more about [File Secret Store](/components/secret-stores/file).

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

    Learn more about [Env Secret Store](/components/secret-stores/env).

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

    Learn more about [Kubernetes Secret Store](/components/secret-stores/kubernetes).

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

    Learn more about [Keyring Secret Store](/components/secret-stores/keyring).

  </TabItem>
</Tabs>

## Example

```yaml
datasets:
  # Example for Spark Connect
  - from: databricks:spiceai.datasets.my_awesome_table  // A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      mode: spark_connect
      databricks_cluster_id: 1234-567890-abcde123
  # Example for Delta Lake
  - from: databricks:spiceai.datasets.my_awesome_table  // A reference to a table in the Databricks unity catalog
    name: my_delta_lake_table
    params:
      endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      mode: delta_lake
```
