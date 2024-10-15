---
title: 'Flight SQL Data Connector'
sidebar_label: 'Flight SQL Data Connector'
description: 'Flight SQL Data Connector Documentation'
---

Flight SQL is a protocol for interacting with SQL databases over Apache Arrow Flight, enabling high-performance data transfer and query execution.

Connect to any Flight SQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) for federated SQL queries.

```yaml
- from: flightsql:my_catalog.good_schemas.cool_dataset
  name: cool_dataset
  params:
    flightsql_endpoint: http://127.0.0.1:50051
    flightsql_username: spicy
    flightsql_password: ${secrets:my_flightsql_pass}
```

## Configuration

### `from`

The `from` field for this connector takes the form `flightsql:catalog.schema.table`, where `catalog.schema.table` is the fully-qualified name of the table registered with the Flight SQL server.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: flightsql:my_catalog.good_schemas.cool_dataset
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

| Parameter Name       | Description                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `flightsql_endpoint` | The Apache Flight endpoint used to connect to the Flight SQL server.                                                                                                                                                                                         |
| `flightsql_username` | Optional. The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)).                                                            |
| `flightsql_password` | Optional. The password to use in the underlying Apache flight Handshake Request to authenticate to the server. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_flightsql_pass}`. |

## Examples

### Authenticating using Environment Variables

The secrets can be specified using inline variables:

```bash
MY_USERNAME=<flight_username> \
MY_PASSWORD=<flight_password> \
spice run
```

Or in a `.env` file:
```bash
MY_USERNAME=<flight_username>
MY_PASSWORD=<flight_password>
```

Then, in `spicepod.yaml`:
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

### Authenticating using Kubernetes Secrets

First, create the secrets in Kubernetes:
```bash
kubectl create secret generic flightsql \
  --from-literal=username='<flight_username>' \
  --from-literal=password='<flight_password>'
```

Then, in `spicepod.yaml`
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

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)
