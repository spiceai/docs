---
title: 'Dremio Data Connector'
sidebar_label: 'Dremio Data Connector'
description: 'Dremio Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Dremio](https://www.dremio.com/) server as a connector for federated SQL queries.

```yaml
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    dremio_endpoint: grpc://127.0.0.1:32010
    dremio_username: demo
    dremio_password: ${secrets:my_dremio_pass}
```

## Configuration

- `dremio_endpoint`: The endpoint used to connect to the Dremio server.
- `dremio_username`: The username to connect with.
- `dremio_password`: The password to connect with. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_dremio_pass}`.

## Auth Example

Check [Secrets Stores](/components/secret-stores) for more details.

<Tabs>
  <TabItem value="env" label="Env">

    ```bash
    SPICE_DREMIO_USERNAME=demo \
    SPICE_DREMIO_PASSWORD=demo1234 \
    spice run
    # Or using the CLI to configure the secrets into an `.env` file
    spice login dremio -u demo -p demo1234
    ```

    `.env`
    ```bash
    SPICE_DREMIO_USERNAME=demo
    SPICE_DREMIO_PASSWORD=demo1234
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: env
        name: env

    datasets:
      - from: dremio:datasets.dremio_dataset
        name: dremio_dataset
        params:
          dremio_endpoint: grpc://1.2.3.4:32010
          dremio_username: ${env:SPICE_DREMIO_USERNAME}
          dremio_password: ${env:SPICE_DREMIO_PASSWORD}
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
      - from: kubernetes:dremio
        name: dremio
    
    datasets:
      - from: dremio:datasets.dremio_dataset
        name: dremio_dataset
        params:
          dremio_endpoint: grpc://1.2.3.4:32010
          dremio_username: ${dremio:username}
          dremio_password: ${dremio:password}
    ```

    Learn more about [Kubernetes Secret Store](/components/secret-stores/kubernetes).

  </TabItem>
  <TabItem value="keyring" label="Keyring">
    Add new keychain entries (macOS) for the user and password:

    ```bash
    # Add Username to keychain
    security add-generic-password -l "Dremio Username" \
    -a spiced -s spice_dremio_username \
    -w demo
    # Add Password to keychain
    security add-generic-password -l "Dremio Password" \
    -a spiced -s spice_dremio_password \
    -w demo1234
    ```

    `spicepod.yaml`
    ```yaml
    version: v1beta1
    kind: Spicepod
    name: spice-app

    secrets:
      - from: keyring
        name: keyring

    datasets:
      - from: dremio:datasets.dremio_dataset
        name: dremio_dataset
        params:
          dremio_endpoint: grpc://1.2.3.4:32010
          dremio_username: ${keyring:spice_dremio_username}
          dremio_password: ${keyring:spice_dremio_password}
    ```

    Learn more about [Keyring Secret Store](/components/secret-stores/keyring).

  </TabItem>
</Tabs>
