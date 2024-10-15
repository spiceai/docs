---
title: 'Dremio Data Connector'
sidebar_label: 'Dremio Data Connector'
description: 'Dremio Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Dremio](https://www.dremio.com/) is a data lake engine that enables high-performance SQL queries directly on data lake storage. It provides a unified interface for querying and analyzing data from various sources without the need for complex data movement or transformation. This connector enables using Dremio as a Data source for federated SQL queries.

```yaml
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    dremio_endpoint: grpc://127.0.0.1:32010
    dremio_username: demo
    dremio_password: ${secrets:my_dremio_pass}
```

## Configuration

### `from`

The `from` field takes the form `dremio:dataset` where `dataset` is the fully qualified name of the dataset to read from.

:::warning [Limitations]

Only three nested levels of a dataset name is currently supported, e.g `a.b.c`. Any futher than that is not supported at this time.

:::

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: dremio:datasets.dremio_dataset
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

| Parameter Name    | Description                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dremio_endpoint` | The endpoint used to connect to the Dremio server.                                                                                                                       |
| `dremio_username` | The username to connect with.                                                                                                                                            |
| `dremio_password` | The password to connect with. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_dremio_pass}`. |

## Examples

### Auth Example

You can specify the connection parameters as inline variables:
```bash
SPICE_DREMIO_USERNAME=demo \
SPICE_DREMIO_PASSWORD=demo1234 \
spice run
```


Or using the CLI to configure the secrets into an `.env` file
```bash
spice login dremio -u demo -p demo1234
```

`.env`
```bash
SPICE_DREMIO_USERNAME=demo
SPICE_DREMIO_PASSWORD=demo1234
```

Then configure your `spicepod.yaml`:
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

## Using secrets

There are currently three supported [secret stores](/components/secret-stores/index.md):

* [Environment variables](/components/secret-stores/env)
* [Kubernetes Secret Store](/components/secret-stores/kubernetes)
* [Keyring Secret Store](/components/secret-stores/keyring)