---
title: 'ScyllaDB Performance'
sidebar_label: 'Performance'
description: 'Performance considerations for the ScyllaDB connector: partition/clustering key filters, acceleration, and datacenter locality.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Performance considerations for the [ScyllaDB connector](./index.md).

Partition key and clustering key filters reduce the amount of data transferred from ScyllaDB, but queries without these filters fetch all table data. Consider the following optimizations:

## Enable Acceleration

For frequently queried data, enable Spice acceleration to cache data locally:

```yaml
datasets:
  - from: scylladb:products
    name: products
    params:
      scylladb_host: ${env:SCYLLADB_HOST}
      scylladb_keyspace: catalog
    acceleration:
      enabled: true
      engine: duckdb
      refresh_check_interval: 1h
```

## Configure Datacenter Locality

Set the datacenter preference to route queries to the nearest nodes:

```yaml
params:
  scylladb_datacenter: us-east-1
```

## Adjust Connection Timeout

Set connection timeouts appropriately for your network:

```yaml
params:
  connection_timeout: 30000  # 30 seconds
```

