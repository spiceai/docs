---
title: 'Indexes'
sidebar_label: 'Indexes'
sidebar_position: 1
description: 'Learn how to add indexes to local acceleration tables in Spice.'
---

Database indexes are essential for optimizing query performance. This document explains how to add indexes to tables created by Spice for local data acceleration.

Example Spicepod:

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth.recent_blocks
    acceleration:
      enabled: true
      engine: sqlite
      indexes:
        number: enabled # Index the `number` column
        '(hash, timestamp)': unique # Add a unique index with a multicolumn key comprised of the `hash` and `timestamp` columns
```

## Column References

Column references can be used to specify which columns to index. The column reference can be a single column name or a multicolumn key. The column reference must be enclosed in parentheses if it is a multicolumn key.

Examples

- `number`: Index the `number` column
- `(hash, timestamp)`: Index the `hash` and `timestamp` columns

## Index Types

There are two types of indexes that can be specified in a Spicepod:

- `enabled`: Creates a standard index on the specified column(s).
  - Similar to specifying `CREATE INDEX my_index ON my_table (my_column)`.
- `unique`: Creates a unique index on the specified column(s). See [Constraints](./constraints) for more information on working with unique constraints on locally accelerated tables.
  - Similar to specifying `CREATE UNIQUE INDEX my_index ON my_table (my_column)`.

:::warning[Limitations]

Traditional indexes are not supported for the in-memory Arrow or [Spice Cayenne](/docs/components/data-accelerators/cayenne) acceleration engines. Use [DuckDB](/docs/components/data-accelerators/duckdb), [SQLite](/docs/components/data-accelerators/sqlite), [Turso](/docs/components/data-accelerators/turso) (when MVCC is disabled), or [PostgreSQL](/docs/components/data-accelerators/postgres/index) as the acceleration engine to enable indexing.

For Arrow acceleration, see [Hash Index](./hash-index) (experimental, v1.11.0-rc.2+) for O(1) point lookups on primary key columns.

:::

:::tip[Spice Cayenne Point Lookup Performance]

While Spice Cayenne does not support traditional indexes, [Vortex](https://github.com/vortex-data/vortex) provides [100x faster random access reads](https://bench.vortex.dev) compared to Parquet through segment statistics (similar to zone-maps), fast random access encodings ([FSST](https://www.vldb.org/pvldb/vol13/p2649-boncz.pdf), [FastLanes](https://www.vldb.org/pvldb/vol16/p2132-afroozeh.pdf)), and compute push-down on compressed data. For many point lookup workloads, Spice Cayenne matches or exceeds indexed query performance without requiring explicit index configuration. See the [Spice Cayenne documentation](/docs/components/data-accelerators/cayenne.md#point-lookups-and-random-access) for details.

:::
