---
title: 'Flight SQL Data Connector'
sidebar_label: 'Flight SQL Data Connector'
description: 'Flight SQL Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Connect to any Flight SQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) as a connector for federated SQL queries.

```yaml
- from: flightsql:my_catalog.good_schemas.cool_dataset
  name: cool_dataset
  params:
    flightsql_endpoint: http://127.0.0.1:50051
    flightsql_username: spicy
    flightsql_password: ${secrets:my_flightsql_pass}
```

## `params`

- `flightsql_endpoint`: The Apache Flight endpoint used to connect to the Flight SQL server.
- `flightsql_username`: Optional. The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)).
- `flightsql_password` (optional): The password to use in the underlying Apache flight Handshake Request to authenticate to the server. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_flightsql_pass}`.

## Auth Example

Check [Secrets Stores](/components/secret-stores) for more details.

<Tabs>
  <TabItem value="env" label="Env">

    ```bash
    MY_USERNAME=<flight_username> \
    MY_PASSWORD=<flight_password> \
    spice run
    ```

    `.env`
    ```bash
    MY_USERNAME=<flight_username>
    MY_PASSWORD=<flight_password>
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
      - from: flightsql:my_catalog.good_schemas.cool_dataset
        name: cool_dataset
        params:
          flightsql_endpoint: http://1.2.3.4:50051
          flightsql_username: ${env:MY_USERNAME}
          flightsql_password: ${env:MY_PASSWORD}
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
      - from: kubernetes:flightsql
        name: flightsql

    datasets:
      - from: flightsql:my_catalog.good_schemas.cool_dataset
        name: cool_dataset
        params:
          flightsql_endpoint: http://1.2.3.4:50051
          flightsql_username: ${flightsql:username}
          flightsql_password: ${flightsql:password}
    ```

    Learn more about [Kubernetes Secret Store](/components/secret-stores/kubernetes).

  </TabItem>
  <TabItem value="keyring" label="Keyring">
    Add new keychain entries (macOS) for the user and password:

    ```bash
    # Add Username to keychain
    security add-generic-password -l "FlightSQL Username" \
    -a spiced -s spice_flightsql_username \
    -w <flight_username>
    # Add Password to keychain
    security add-generic-password -l "FlightSQL Password" \
    -a spiced -s spice_flightsql_password \
    -w <flight_password>
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
      - from: flightsql:my_catalog.good_schemas.cool_dataset
        name: cool_dataset
        params:
          flightsql_endpoint: http://1.2.3.4:50051
          flightsql_username: ${keyring:spice_flightsql_username}
          flightsql_password: ${keyring:spice_flightsql_password}
    ```

    Learn more about [Keyring Secret Store](/components/secret-stores/keyring).

  </TabItem>
</Tabs>
