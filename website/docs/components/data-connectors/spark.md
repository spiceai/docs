---
title: 'Apache Spark Connector'
sidebar_label: 'Apache Spark Connector'
description: 'Apache Spark Connector Documentation'
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Apache Spark as a connector for federated SQL query against a Spark Cluster using [Spark Connect](https://spark.apache.org/docs/latest/spark-connect-overview.html)

```yaml
datasets:
  - from: spark:spiceai.datasets.my_awesome_table
    name: my_table
    params:
      spark_remote: sc://localhost:15002
```

## Configuration

- `spark_remote`: A [spark remote](https://spark.apache.org/docs/latest/spark-connect-overview.html#set-sparkremote-environment-variable) connection URI. Refer to [spark connect client connection string](https://github.com/apache/spark/blob/master/connector/connect/docs/client-connection-string.md) for parameters in URI.

### Auth Examples

Spark clusters configured to accept authenticated requests should not set `spark_remote` as an inline dataset param, as it will contain sensitive data. For this case, use the [secret replacement syntax](../secret-stores/index.md) to load the secret from a secret store, e.g. `${secrets:my_spark_remote}`.

Check [Secrets Stores](/docs/components/secret-stores) for more details.

<Tabs>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SPARK_REMOTE=<spark-remote> \
    spice run
    # Or using the CLI to configure the secrets into an `.env` file
    spice login spark --spark_remote <spark-remote>
    ```

    `.env`
    ```bash
    SPICE_SPARK_REMOTE=<spark-remote>
    ```

    `spicepod.yaml`
    ```yaml
    version: v1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: env
        name: env

    datasets:
      - from: spark:spiceai.datasets.my_awesome_table
        name: my_table
        params:
          spark_remote: ${env:SPICE_SPARK_REMOTE}
    ```

    Learn more about [Env Secret Store](/docs/components/secret-stores/env).

  </TabItem>
  <TabItem value="k8s" label="Kubernetes">
    ```bash
    kubectl create secret generic spark \
      --from-literal=spark_remote='<spark-remote>'
    ```

    `spicepod.yaml`
    ```yaml
    version: v1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: kubernetes:spark
        name: spark

    datasets:
      - from: spark:spiceai.datasets.my_awesome_table
        name: my_table
        params:
          spark_remote: ${spark:spark_remote}
    ```

    Learn more about [Kubernetes Secret Store](/docs/components/secret-stores/kubernetes).

  </TabItem>
  <TabItem value="keyring" label="Keyring">
    Add new keychain entry (macOS) with the spark remote:

    ```bash
    security add-generic-password -l "Spark Remote" \
    -a spiced -s spice_spark_remote \
    -w <spark-remote>
    ```

    `spicepod.yaml`
    ```yaml
    version: v1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: keyring
        name: keyring

    datasets:
      - from: spark:spiceai.datasets.my_awesome_table
        name: my_table
        params:
          spark_remote: ${keyring:spice_spark_remote}
    ```

    Learn more about [Keyring Secret Store](/docs/components/secret-stores/keyring).

  </TabItem>
</Tabs>

## Limitations

- Correlated scalar subqueries are only supported in filters, aggregations, projections, and UPDATE/MERGE/DELETE commands. [Spark Docs](https://spark.apache.org/docs/latest/sql-error-conditions-unsupported-subquery-expression-category-error-class.html#unsupported_correlated_scalar_subquery)

- The Spark connector does not yet support streaming query results from Spark.

## Cookbook

- A cookbook recipe to configure Spark as a data connector in Spice. [Apache Spark Data Connector](https://github.com/spiceai/cookbook/tree/trunk/spark#readme)
