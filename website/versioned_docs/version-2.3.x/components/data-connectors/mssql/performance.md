---
title: 'Microsoft SQL Server Performance'
sidebar_label: 'Performance'
description: 'Performance tuning for the Microsoft SQL Server connector: TopK / ORDER BY ... LIMIT pushdown and NULL ordering, read-only routing, and acceleration on local NVMe.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Performance tuning for the [Microsoft SQL Server connector](./index.md).

Federated queries run against SQL Server on every execution and transfer their result set over the network; how much they transfer depends on how much of the query SQL Server can execute itself. This page covers the pushdown rule that most often decides that, where to send federated reads, and how to take hot tables off the server entirely with acceleration.

## TopK / ORDER BY ... LIMIT pushdown

Spice pushes `ORDER BY ... LIMIT N` queries down to SQL Server as `SELECT TOP N ... ORDER BY ...`, avoiding transferring unnecessary rows over the network. This pushdown is applied when the sort can be satisfied exactly by SQL Server — which depends on NULL ordering.

SQL Server treats `NULL` as the smallest possible value, so its native ordering is:

| Direction | NULLs position |
| --------- | -------------- |
| `ASC`     | First          |
| `DESC`    | Last           |

Most SQL clients and tools (including Spice's default planner) use the opposite convention (`ASC NULLS LAST`, `DESC NULLS FIRST`). When the requested NULL ordering doesn't match SQL Server's native behavior, Spice falls back to fetching all matching rows and applying the limit locally.

**To guarantee TopK pushdown on nullable columns**, explicitly specify the NULL ordering that matches SQL Server's native behavior:

```sql
-- Pushed down: DESC NULLS LAST matches SQL Server native ordering
SELECT id, value FROM my_dataset ORDER BY value DESC NULLS LAST LIMIT 10;

-- Pushed down: ASC NULLS FIRST matches SQL Server native ordering
SELECT id, value FROM my_dataset ORDER BY value ASC NULLS FIRST LIMIT 10;
```

:::tip
Sorting on `NOT NULL` columns (e.g. primary keys) always pushes the limit down regardless of the `NULLS` clause, since there are no NULLs to order.
:::

Confirm what was pushed down with `EXPLAIN`: a plan whose SQL Server scan carries the `TOP` and `ORDER BY` transfers `N` rows; one that sorts and limits above the scan transfers every matching row first.

## Route Federated Reads to a Readable Secondary

When SQL Server runs in an Always On availability group, federated reads and acceleration refreshes can be directed at a readable secondary so they do not compete with the primary's transactional load. Set `ApplicationIntent=ReadOnly` in `mssql_connection_string` — the only place it can be set — and connect through the availability group listener. See [Availability groups and read-only routing](./index.md#availability-groups-and-read-only-routing).

## Accelerate Hot Tables

Tables that are queried repeatedly, joined, or aggregated are best served from a local acceleration, which reads the table from SQL Server once per refresh and answers queries locally:

```yaml
datasets:
  - from: mssql:dbo.orders
    name: orders
    params:
      mssql_connection_string: ${secrets:mssql_connection_string}
    time_column: modified_at
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      refresh_mode: append
      refresh_check_interval: 5m
      params:
        cayenne_file_path: /nvme/spice/data/orders/
```

Choose the engine by size: `duckdb` in file mode for tables under 10 GB with complex SQL, and [Spice Cayenne](../../data-accelerators/cayenne/index.md) for 10 GB and above — Cayenne needs one-third to one-half the memory of DuckDB for the same data. See [Accelerator Selection](../../../reference/performance-tuning.md#accelerator-selection).

**Store the acceleration on local NVMe or SSD.** A file-mode acceleration runs at the per-I/O latency of the disk beneath it: each dependent read and each synchronous write waits for the device before the query can continue, so the tens of microseconds an NVMe read takes — against a millisecond or more on network storage — is multiplied along every query. Place `cayenne_file_path`, `duckdb_file`, or `sqlite_file` on a local NVMe volume rather than the root disk, and never on a network file system (NFS, SMB, EFS, Azure Files); network block storage such as EBS or Azure Managed Disks works as a durable fallback, preferably a sub-millisecond tier such as `io2` Block Express or Premium SSD v2. Point `runtime.query.temp_directory` at the same fast volume so large sorts and joins can spill instead of failing. See [Storage](../../../reference/performance-tuning.md#storage) for the tiers, the cloud specifics, and the capacity figures.

**Refresh incrementally.** A full refresh re-reads the table on every interval and, for the duration, doubles the acceleration's memory or disk footprint. Where a table carries a monotonically increasing timestamp or identity column, set `time_column` and `refresh_mode: append` so each refresh fetches only new rows; see [Data Refresh](../../../features/data-acceleration/data-refresh.md). For row-level change data capture from SQL Server, stream changes through Debezium's SQL Server connector into the [Debezium data connector](../../../features/cdc/debezium.md) with `refresh_mode: changes`.

## Related Documentation

- [Microsoft SQL Server Data Connector](./index.md) - Configuration, availability groups, and secrets
- [Performance Tuning](../../../reference/performance-tuning.md) - Accelerator selection, storage, spill, memory, and caching
- [Data Acceleration](../../../features/data-acceleration/index.md) - Refresh modes and acceleration configuration
