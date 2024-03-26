---
title: 'FlightSQL Data Connector'
sidebar_label: 'FlightSql Data Connector'
description: 'FlightSQL Data Connector Documentation'
---

Connect to any FlightSQL compatible server (e.g. Influx 3.0, CnosDB, other Spice runtimes!) as a connector for federated SQL queries.

## `params`

- `endpoint`: The Apache Flight endpoint used to connect to the FlightSQL server. 

## `auth`

Check [Secrets Stores](/secret-stores) for details on how to configure.

Attributes:
- `username` (optional): The username to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)). 
- `password` (optional): The password to use in the underlying Apache flight Handshake Request to authenticate to the server (see [reference](https://arrow.apache.org/docs/format/Flight.html#authentication)). 

## Example

```yaml
- from: flightsql:my_catalog.good_schemas.cool_dataset
  name: cool_dataset
  params:
    endpoint: http://127.0.0.1:50051 
```