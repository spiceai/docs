---
title: 'Flight SQL Data Connector'
sidebar_label: 'Flight SQL Data Connector'
description: 'Flight SQL Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Connect to any Flight SQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) as a connector for federated SQL queries.

## `params`

- `endpoint`: The Apache Flight endpoint used to connect to the Flight SQL server.

## Auth

Username and password credentials can be specified to connect to the Flight SQL server:

- `username` (optional): The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)).
- `password` (optional): The password to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)).

By default Flight SQL connector will look for a secret named `flightsql` with keys `username` and `password`.

Check [Secrets Stores](/components/secret-stores) for more details.

<Tabs>
  <TabItem value="env" label="Env">
    ```bash
    SPICE_SECRET_FLIGHTSQL_USERNAME=<flight_username> \
    SPICE_SECRET_FLIGHTSQL_PASSWORD=<flight_password> \
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
    kubectl create secret generic flightsql \
      --from-literal=username='<flight_username>' \
      --from-literal=password='<flight_password>'
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
    security add-generic-password -l "Flight SQL Secret" \
    -a spiced -s spice_secret_flightsql \
    -w $(echo -n '{"username": "<flight_username>", "password": "<flight_password>"}')
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
- from: flightsql:my_catalog.good_schemas.cool_dataset
  name: cool_dataset
  params:
    endpoint: http://127.0.0.1:50051
```
