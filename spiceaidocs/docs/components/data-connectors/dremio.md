---
title: 'Dremio Data Connector'
sidebar_label: 'Dremio Data Connector'
description: 'Dremio Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Dremio](https://www.dremio.com/) server as a connector for federated SQL queries.

By default Dremio connector will look for a secret named `dremio` with

## `params`

- `endpoint`: The endpoint used to connect to the Dremio server.

## Auth

Username and password credentials are required to log into the Dremio Server.
By default Dremio connector will look for a secret named `dremio` with keys `username` and `password`.

Check [Secrets Stores](/secret-stores) for more details.

<Tabs>
  <TabItem value="local" label="Local" default>
    ```bash
    spice login dremio -u demo -p demo1234
    ```

    Learn more about [File Secret Store](/components/secret-stores/file).

  </TabItem>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_DREMIO_USERNAME=demo \
    SPICE_SECRET_DREMIO_PASSWORD=demo1234 \
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
    kubectl create secret generic dremio \
      --from-literal=username='demo' \
      --from-literal=password='demo1234'
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
    security add-generic-password -l "Dremio Secret" \
    -a spiced -s spice_secret_dremio \
    -w $(echo -n '{"username": "demo", "password": "demo1234"}')
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
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    endpoint: grpc://127.0.0.1:32010
```
