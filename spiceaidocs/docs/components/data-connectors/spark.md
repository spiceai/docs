---
title: 'Apache Spark Connector'
sidebar_label: 'Apache Spark Connector'
description: 'Apache Spark Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Apache Spark as a connector for federated SQL query against a Spark Cluster using [Spark Connect](https://spark.apache.org/docs/latest/spark-connect-overview.html)

## Configuration

The Apache Spark Connector can be used in two ways: specifying a plaintext connection string using the `spark_remote` parameter or specifying a `spark_remote` secret. The connector will fail if both configurations are set.

### Parameters

- `spark_remote`: A [spark remote](https://spark.apache.org/docs/latest/spark-connect-overview.html#set-sparkremote-environment-variable) connection URI. Refer to [spark connect client connection string](https://github.com/apache/spark/blob/master/connector/connect/docs/client-connection-string.md) for parameters in URI.

### Auth

Spark clusters configured to accept authenticated requests should not set `spark_remote` as an inline dataset param, as it will contain sensitive data. For this case, use a secret named `spark` with key `spark_remote`.

Check [Secrets Stores](/components/secret-stores) for more details.

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login spark --spark_remote <spark-remote>
    ```

    Learn more about [File Secret Store](/components/secret-stores/file).

  </TabItem>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_SPARK_SPARK_REMOTE=<spark-remote> \
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
    kubectl create secret generic spark \
      --from-literal=spark_remote='<spark-remote>'
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
    security add-generic-password -l "Spark Remote" \
    -a spiced -s spice_secret_spark \
    -w $(echo -n '{"spark_remote": "spark"}')
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
  - from: spark:spiceai.datasets.my_awesome_table
    name: my_table
    params:
      spark_remote: sc://localhost:15002
```
