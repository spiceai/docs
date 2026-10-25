---
title: 'ScyllaDB Performance'
sidebar_label: 'Performance'
description: 'Performance considerations for the ScyllaDB connector: partition/clustering key filters, acceleration and where to store it, datacenter locality, and connection timeouts.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Performance considerations for the [ScyllaDB connector](./index.md).

ScyllaDB answers queries efficiently only when they name a partition key. The connector pushes partition-key equality and, with it, clustering-key comparisons down to CQL; every other predicate, and every join and aggregation, is evaluated locally after the matching rows have been transferred. A query without a partition-key filter therefore reads the whole table over the network on every execution. Two levers follow: shape live queries around the keys, and accelerate the tables that cannot be queried that way.

## Filter by Partition Key

Live (federated) queries should filter on the partition key with `=`, optionally narrowing further on clustering keys with `=`, `<`, `<=`, `>`, or `>=`. Filters on regular columns, `OR` conditions, and complex expressions are not pushed down and cost a full-table read. See [Filter Pushdown](./index.md#filter-pushdown) for the exact rules and for the SQL constructs CQL cannot express.

```sql
-- Pushed down: partition key equality plus a clustering-key range
SELECT * FROM events WHERE device_id = 'dev-42' AND event_time > '2025-01-01';

-- Full table read: no partition-key filter
SELECT * FROM events WHERE event_type = 'click';
```

## Enable Acceleration

For tables that are queried by non-key columns, joined, or aggregated — the analytical pattern CQL does not serve — enable Spice acceleration so the table is read from ScyllaDB once per refresh and queried locally thereafter:

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
      mode: file
      refresh_check_interval: 1h
      params:
        duckdb_file: /nvme/spice/data/products.duckdb
```

Choose the engine by size: `duckdb` in file mode for tables under 10 GB with complex SQL, and [Spice Cayenne](../../data-accelerators/cayenne/index.md) for 10 GB and above — Cayenne needs one-third to one-half the memory of DuckDB for the same data and scales beyond a single file. See [Accelerator Selection](../../../reference/performance-tuning.md#accelerator-selection).

**Store the acceleration on local NVMe or SSD.** A file-mode acceleration runs at the per-I/O latency of the disk beneath it: Vortex's dependent segment reads and DuckDB's buffer manager each wait for the device before the query can continue, so the tens of microseconds an NVMe read takes — against a millisecond or more on network storage — is multiplied along every query. Place `duckdb_file` or `cayenne_file_path` on a local NVMe volume rather than the root disk, and never on a network file system (NFS, SMB, EFS); network block storage such as EBS works as a durable fallback, preferably a sub-millisecond tier such as `io2` Block Express. Point `runtime.query.temp_directory` at the same fast volume so large sorts and joins can spill. See [Storage](../../../reference/performance-tuning.md#storage) for the tiers, the cloud specifics, and the capacity figures.

**Refresh incrementally where the table allows it.** A full refresh re-reads the whole table from ScyllaDB on every interval. For a table whose rows carry a monotonically increasing timestamp, set `time_column` and `refresh_mode: append` so each refresh fetches only new rows; see [Data Refresh](../../../features/data-acceleration/data-refresh.md). Keep `refresh_check_interval` no shorter than the freshness the workload needs, since each refresh is a scan against the cluster.

## Configure Datacenter Locality

Set the datacenter preference to route queries to the nearest nodes:

```yaml
params:
  scylladb_datacenter: us-east-1
```

Cross-datacenter reads add the inter-region round trip to every request and, for a refresh, to every page of the scan. Run Spice in the same datacenter as the ScyllaDB nodes it reads from, and name that datacenter here so the driver does not fall back to remote replicas.

## Adjust Connection Timeout

Set connection timeouts appropriately for your network:

```yaml
params:
  connection_timeout: 30000  # 30 seconds; default 10000
```

Raise the timeout when the cluster is reached over a high-latency link or is under load; a timeout that is too short surfaces as intermittent refresh failures in the task history rather than as slow queries.

## Related Documentation

- [ScyllaDB Data Connector](./index.md) - Configuration, types, and filter pushdown rules
- [Performance Tuning](../../../reference/performance-tuning.md) - Accelerator selection, storage, spill, memory, and caching
- [Data Acceleration](../../../features/data-acceleration/index.md) - Refresh modes and acceleration configuration
