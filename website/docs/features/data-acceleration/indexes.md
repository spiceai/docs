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
- `unique`: Creates a unique index on the specified column(s). See [Constraints](./constraints.md) for more information on working with unique constraints on locally accelerated tables.
  - Similar to specifying `CREATE UNIQUE INDEX my_index ON my_table (my_column)`.

:::warning[Limitations]

- **Not supported for in-memory Arrow:** The default in-memory Arrow acceleration engine does not support indexes. Use [DuckDB](/components/data-accelerators/duckdb.md), [SQLite](/components/data-accelerators/duckdb.md), or [PostgreSQL](/components/data-accelerators/postgres/index.md) as the acceleration engine to enable indexing.

:::
