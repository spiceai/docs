---
title: 'Dremio Data Connector'
sidebar_label: 'Dremio Data Connector'
description: 'Dremio Data Connector Documentation'
---

[Dremio](https://www.dremio.com/) is a data lake engine that enables high-performance SQL queries directly on data lake storage. It provides a unified interface for querying and analyzing data from various sources without the need for complex data movement or transformation. 

This connector enables using Dremio as a data source for federated/accelerated SQL queries.

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

Currently, only up to three levels of nesting are supported for dataset names (e.g., a.b.c). Additional levels are not supported at this time.

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

| Parameter Name    | Description                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dremio_endpoint` | The endpoint used to connect to the Dremio server.                                                                                                      |
| `dremio_username` | The username to connect with.                                                                                                                           |
| `dremio_password` | The password to connect with. Use the [secret replacement syntax](#secrets) to load the password from a secret store, e.g. `${secrets:my_dremio_pass}`. |

## Examples

### Connecting to a GRPC endpoint

```yaml
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    dremio_endpoint: grpc://127.0.0.1:32010
    dremio_username: demo
    dremio_password: ${secrets:my_dremio_pass}
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).
