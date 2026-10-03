---
title: 'Write-Through Cache'
sidebar_label: 'Write-Through Cache'
sidebar_position: 1
description: 'Use Spice.ai as a write-through cache that writes data to both a local accelerator and the upstream data source.'
pagination_prev: null
pagination_next: null
---

Spice.ai functions as a write-through cache by accepting writes via SQL and propagating them to both the local accelerator and the upstream data source. Applications read from the fast local accelerator while writes flow through to the authoritative source, keeping both layers consistent without manual synchronization.

This pattern is common in operational applications that need low-latency reads alongside durable writes — for example, an application that updates user preferences through Spice and expects the changes to be reflected in both the local cache and the upstream PostgreSQL database.

```mermaid
graph LR
    App[Application] -->|Write| Spice[Spice]
    Spice -->|Persist| Source[Upstream Source]
    Source -->|Refresh| Acc[Local Accelerator]
    App -->|Read| Acc
```

## Why Spice.ai?

- **Transparent Write Path**: SQL `INSERT INTO` statements write to the upstream connector and the accelerator reflects the change on the next refresh cycle, requiring no application-level cache invalidation logic.
- **Consistent Reads**: The local accelerator serves reads at sub-millisecond latency while the source of truth stays in sync through periodic or CDC-based refresh.
- **Connector Flexibility**: Write-through works with any [write-capable connector](../../features/data-ingestion) (e.g., Apache Iceberg, AWS Glue) combined with any acceleration engine.
- **Automatic Refresh**: CDC (`refresh_mode: changes`) or periodic refresh (`refresh_check_interval`) propagates upstream changes back to the accelerator, closing the read-after-write loop.

## Example

An application writes new order records to an Iceberg table and reads from a locally accelerated copy. Writes go to the upstream Iceberg table, and the accelerator refreshes periodically to pick up the new rows.

```yaml
datasets:
  - from: iceberg:my_catalog.orders
    name: orders
    access: read_write
    acceleration:
      enabled: true
      engine: cayenne
      refresh_check_interval: 10s
```

Insert data through Spice using standard SQL:

```sql
INSERT INTO orders (order_id, customer_id, total)
VALUES (1001, 42, 99.95);
```

The write goes to the upstream Iceberg table. On the next refresh cycle (within 10 seconds in this configuration), the accelerator picks up the new row and subsequent reads return it at local-accelerator speed.

## Query Results Cache

In addition to dataset acceleration, Spice provides an in-memory SQL results cache that stores the output of repeated queries. When applications issue the same `SELECT` against the accelerated dataset within the TTL window, the result is served directly from memory without re-executing the query against the accelerator.

This is particularly effective in write-through scenarios where reads far outnumber writes — the accelerator absorbs the write-path overhead, while the results cache eliminates redundant read-path computation.

```yaml
datasets:
  - from: iceberg:my_catalog.orders
    name: orders
    access: read_write
    acceleration:
      enabled: true
      engine: cayenne
      refresh_check_interval: 10s

runtime:
  caching:
    sql_results:
      enabled: true
      item_ttl: 5s
```

With this configuration, identical queries within 5 seconds are served from the in-memory results cache. After the TTL expires, the next query re-executes against the accelerator and the result is cached again.

The `Results-Cache-Status` response header indicates whether a query was served from the cache (`HIT`), executed fresh (`MISS`), or served stale during background revalidation (`STALE`). Clients can bypass the cache for a specific request using the `Cache-Control: no-cache` header or the `--cache-control no-cache` flag in the Spice SQL REPL.

## Benefits

- **Low-Latency Reads**: The accelerator serves queries without network round-trips to the upstream source. The results cache adds a further in-memory layer for repeated queries.
- **Durable Writes**: Data is persisted in the authoritative source, not just the cache.
- **No Cache Invalidation Logic**: Refresh handles consistency automatically — no application code needed to synchronize the cache.

### Learn More

- **Data Ingestion**: [Documentation](../../features/data-ingestion) for write-capable connectors and SQL write syntax.
- **Data Acceleration**: [Documentation](../../features/data-acceleration) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README).
- **Caching**: [Documentation](../../features/caching) for SQL results cache configuration, Cache-Control directives, and response headers.
- **CDC**: [Documentation](../../features/cdc) for change data capture-based refresh.
