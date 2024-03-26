---
title: 'Dremio Data Connector'
sidebar_label: 'Dremio Data Connector'
description: 'Dremio Data Connector Documentation'
---

[Dremio](https://www.dremio.com/) server as a connector for federated SQL queries.

## `params`

- `endpoint`: The endpoint used to connect to the Dremio server.

## `auth`

Username and password credentials are required to log into the Dremio Server. `spice login dremio` can be used to configure secrets for the Spice runtime. 

Check [Secrets Stores](/secret-stores) for details on how to configure.

## Example

```yaml
- from: dremio:datasets.dremio_dataset
  name: dremio_dataset
  params:
    endpoint: grpc://127.0.0.1:32010