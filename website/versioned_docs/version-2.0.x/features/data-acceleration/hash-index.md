---
title: 'Hash Index for Arrow Acceleration'
sidebar_label: 'Hash Index'
sidebar_position: 3
description: 'Learn how to use hash indexes for O(1) point lookups on Arrow-accelerated datasets.'
---

:::warning[Experimental]
Hash index is an experimental feature available in Spice v1.11.0-rc.2 and later.
:::

The hash index is an optional, high-performance indexing feature for Arrow-accelerated datasets. It provides O(1) point lookups on primary key and secondary index columns, dramatically improving query performance for equality predicates.

## Key Features

- **O(1) Point Lookups**: Direct row access via primary key or secondary indexes without full table scans
- **Secondary Indexes**: Optional indexes on non-primary-key columns for fast lookups
- **256-Shard Design**: Minimizes lock contention for concurrent reads
- **SIMD-Optimized Hashing**: Uses XXH3_64 for fast, high-quality hashing
- **Built-in Bloom Filter**: Fast negative lookups to skip unnecessary hash table probes

## Configuration

Hash indexing activates automatically on Arrow-accelerated datasets when a `primary_key` or [secondary index](./indexes) is configured. No additional parameter is required.

```yaml
datasets:
  - from: s3://bucket/orders.parquet
    name: orders
    acceleration:
      engine: arrow
      primary_key: order_id
```

The hash index activates whenever:

- `engine` is `arrow` or `partitioned_arrow`,
- `acceleration.enabled` is `true`,
- and either `indexes` is set, or `primary_key` is set with a non-`caching` `refresh_mode`.

### Secondary Indexes

Secondary indexes can be added on non-primary-key columns to accelerate equality lookups on those columns. Define them using the [`indexes`](./indexes) field in the acceleration configuration:

```yaml
datasets:
  - from: s3://bucket/users.parquet
    name: users
    acceleration:
      engine: arrow
      primary_key: user_id
      indexes:
        email: unique
        status: enabled
        '(region, category)': unique
```

Index types:

- **`unique`** — Enforces uniqueness and enables O(1) indexed lookups.
- **`enabled`** — Permits duplicates. The index is built and maintained but does not currently accelerate queries (queries fall back to a full scan).

Compound secondary indexes can be defined with a multicolumn key in parentheses, e.g. `'(col1, col2)': unique`, but are not yet used for query optimization.

:::note
Only single-column `unique` secondary indexes currently accelerate queries. Non-unique and compound secondary indexes are maintained for future use.
:::

### Configuration Options

| Parameter     | Type           | Required                                 | Default | Description                                  |
| ------------- | -------------- | ---------------------------------------- | ------- | -------------------------------------------- |
| `primary_key` | string or list | Yes (unless `indexes` is set)            | None    | Column(s) for the primary key index          |
| `indexes`     | YAML map       | No                                       | None    | Secondary indexes (see [indexes](./indexes)) |

:::note `hash_index` parameter is ignored
The legacy `hash_index: enabled` parameter is accepted but no longer activates indexing on its own. When set, the runtime logs a warning and falls back to the automatic rules above. Remove `hash_index` from `params` to clear the warning.
:::

## Supported Data Types

The hash index supports the following primary key column types:

### Primitive Types

- `Int8`, `Int16`, `Int32`, `Int64`
- `UInt8`, `UInt16`, `UInt32`, `UInt64`

### String Types

- `Utf8`, `LargeUtf8`

### Binary Types

- `Binary`, `LargeBinary`

## Query Optimization

The hash index automatically accelerates queries with equality predicates on indexed columns.

### Optimized Queries

```sql
-- Primary key lookup (uses primary key index)
SELECT * FROM my_dataset WHERE id = 123;

-- Multiple key lookups (uses primary key index for each key)
SELECT * FROM my_dataset WHERE id IN (1, 2, 3);

-- Secondary index lookup (uses unique secondary index)
SELECT * FROM my_dataset WHERE email = 'user@example.com';

-- Primary key lookup with additional filter (index + post-filter)
SELECT * FROM my_dataset WHERE id = 123 AND status = 'active';
```

When a primary key lookup is combined with additional filters (e.g. `WHERE id = 123 AND status = 'active'`), the index is used for the primary key lookup and the remaining filters are applied afterward by DataFusion.

### Non-Optimized Queries

```sql
-- Range queries (full scan)
SELECT * FROM my_dataset WHERE id > 100 AND id < 200;

-- Pattern matching (full scan)
SELECT * FROM my_dataset WHERE id LIKE 'A%';

-- Composite primary keys (full scan, not yet supported)
SELECT * FROM my_dataset WHERE region = 'US' AND customer_id = 42;

-- Non-unique secondary index (full scan, not yet optimized)
SELECT * FROM my_dataset WHERE status = 'active';
```

## Index Size

There is no minimum row count. Whenever the [activation rules](#configuration) are met, the index is built for the dataset regardless of size — including for an empty table, which is indexed at load and rebuilt as rows arrive. The row count is used only to pre-size the hash table and bloom filter, not to decide whether to index at all, so budget the [memory](#memory-usage) below for every indexed dataset.

## Performance

### Bloom Filter Performance

The built-in bloom filter provides:

- ~0.82% false positive rate (10 bits/item, 7 hash functions)
- O(1) negative lookup confirmation
- Reduced unnecessary hash table probes for non-existent keys

## Memory Usage

| Component    | Memory per Entry                         |
| ------------ | ---------------------------------------- |
| Hash slot    | 16 bytes (8-byte hash + 8-byte location) |
| Bloom filter | ~1.25 bytes                              |
| **Total**    | ~17.25 bytes per indexed row             |

### Estimating Memory

For a 10 million row dataset:

```text
Index memory ≈ 10M × 17.25 bytes ≈ 165 MB
```

## Architecture

### Sharded Hash Table

The index uses 256 independent shards to minimize lock contention:

```text
┌────────────────────────────────────────────────┐
│                  HashIndex                     │
├────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐      ┌─────────┐      │
│  │ Shard 0 │ │ Shard 1 │ ...  │Shard 255│      │
│  │ RwLock  │ │ RwLock  │      │ RwLock  │      │
│  └────┬────┘ └────┬────┘      └────┬────┘      │
│       │           │                │           │
│       ▼           ▼                ▼           │
│  ┌─────────┐ ┌─────────┐      ┌─────────┐      │
│  │  Hash   │ │  Hash   │ ...  │  Hash   │      │
│  │  Table  │ │  Table  │      │  Table  │      │
│  └─────────┘ └─────────┘      └─────────┘      │
├────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐   │
│  │        Optional Bloom Filter            │   │
│  │        (Fast Negative Lookups)          │   │
│  └─────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Shard Selection**: Uses XOR-folded hash bits: `((hash >> 56) ^ (hash >> 48) ^ hash) & 0xFF`

### Row Location

Each indexed key maps to a `RowLocation`:

```rust
RowLocation {
    partition: u32,  // Partition index
    batch: u32,      // Batch index within partition
    row: u32,        // Row index within batch
}
```

### Hash Function

Uses XXH3_64 with a fixed seed (`0x5370_6963_6541_4920` = "SpiceAI ") for:

- Deterministic hashing across instances
- High-quality distribution (passes SMHasher)
- SIMD acceleration on arm64/amd64

## Limitations

1. **Arrow Engines Only**: Hash index is only available for `engine: arrow` and `engine: partitioned_arrow` acceleration
2. **Single-Column Primary Keys Only**: Composite primary keys are not yet supported for indexed lookups; only single-column primary keys use the index
3. **Experimental**: API and behavior may change in future releases
4. **No Persistence**: Index is rebuilt on restart (data persists, index is in-memory)
5. **Duplicate Keys**: Primary key columns must have unique values
6. **Secondary Index Limitations**: Only single-column `unique` secondary indexes accelerate queries. Non-unique and compound secondary indexes are built and maintained but do not yet optimize queries

## Troubleshooting

### "No index available for point lookup"

**Cause**: A direct point lookup was issued against an indexed table that has no primary key index — `primary_key` is not set, so only the configured secondary indexes exist.

**Solution**: Set `primary_key` on the acceleration to build the primary key index. Dataset size is not a factor: the index is built at any row count once the [activation rules](#configuration) are met.

### Warning: "The hash_index acceleration parameter is ignored for Arrow acceleration"

**Cause**: `hash_index: enabled` is set in `params` but no longer activates indexing on its own.

**Solution**: Remove `hash_index` from `params`. Hash indexing activates automatically when `primary_key` or `indexes` is configured on an Arrow-accelerated dataset (see [Configuration](#configuration)).

### Hash index not active despite `primary_key` being set

**Cause**: `refresh_mode: caching` disables hash indexing even when `primary_key` is set; the caching path uses its own lookup strategy.

**Solution**: Use a non-caching `refresh_mode` (e.g. `full`, `append`, `changes`) for datasets that need point-lookup acceleration via the hash index.

### High Memory Usage

**Cause**: Index consumes ~17 bytes per row.

**Solution**:

- Remove `primary_key` for datasets where point lookups are rare (hash indexing stops being applied)
- Consider using a different acceleration engine for very large datasets
