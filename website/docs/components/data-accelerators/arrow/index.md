---
title: 'In-Memory Arrow Data Accelerator'
sidebar_label: 'In-Memory Arrow Data Accelerator'
description: 'In-Memory Arrow Data Accelerator Documentation'
sidebar_position: 2
---

The In-Memory Arrow Data Accelerator is the default data accelerator in Spice. It uses Apache Arrow to store data in-memory for fast access and query performance.

## Configuration

To use the In-Memory Arrow Data Accelerator, no additional configuration is required beyond enabling acceleration.

Example:

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      enabled: true
```

However Arrow can be specified explicitly using `arrow` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      enabled: true
      engine: arrow
```

## Hash Index

:::warning[Experimental]
Hash index is an experimental feature available in Spice v1.11.0-rc.2 and later.
:::

The In-Memory Arrow Data Accelerator supports an optional [hash index](../../features/data-acceleration/hash-index) for O(1) point lookups on primary key columns. To enable, set `hash_index: enabled` in the dataset params:

```yaml
datasets:
  - from: s3://bucket/orders.parquet
    name: orders
    acceleration:
      engine: arrow
      primary_key: order_id
      params:
        hash_index: enabled
```

See [Hash Index](../../features/data-acceleration/hash-index) for configuration details, supported data types, and performance characteristics.

## Native Upserts with Primary Key Matching

Spice supports efficient upsert (update-or-insert) operations on Arrow-accelerated tables using primary key matching. When a dataset is accelerated with Arrow and a `primary_key` is specified, incoming rows with matching primary key values will update existing records; otherwise, new records are inserted.

### Example Upsert Configuration

```yaml
datasets:
  - from: s3://bucket/orders.parquet
    name: orders
    acceleration:
      engine: arrow
      primary_key: order_id
```

- When you insert or load data, if a row's `order_id` matches an existing record, the record is updated in-place.
- If the `order_id` is new, a new record is inserted.

This enables efficient update-or-insert semantics for in-memory datasets, ideal for CDC, streaming, and real-time analytics workloads.

### Notes
- Upsert support requires a defined `primary_key`.
- Upserts are performed in-memory and are not persisted after runtime shutdown.
- For persistent upserts, use a persistent accelerator (e.g., DuckDB, Cayenne).

---

## Limitations

- The In-Memory Arrow Data Accelerator does not support persistent storage. Data is stored in-memory and will be lost when the Spice runtime is stopped.
- The In-Memory Arrow Data Accelerator does not support `Decimal256` (76 digits), as it exceeds Arrow's maximum Decimal width of 38 digits.
- The In-Memory Arrow Data Accelerator does not support traditional [indexes](../../features/data-acceleration/indexes), but does support [hash indexes](../../features/data-acceleration/hash-index) (experimental) for point lookups.
- The In-Memory Arrow Data Accelerator only supports primary-key [constraints](../../features/data-acceleration/constraints), not `unique` constraints.
- With Arrow acceleration, mathematical operations like `value1 / value2` are treated as integer division if the values are integers. For example, `1 / 2` will result in 0 instead of the expected 0.5. Use casting to FLOAT to ensure conversion to a floating-point value: `CAST(1 AS FLOAT) / CAST(2 AS FLOAT)` (or `CAST(1 AS FLOAT) / 2`).

:::warning[Memory Considerations]

When accelerating a dataset using the In-Memory Arrow Data Accelerator, some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](duckdb) and [`sqlite`](sqlite) accelerators by specifying `mode: file`.

:::

## Cookbook

- A cookbook recipe to configure In-Memory Arrow as data accelerator in Spice. [In-Memory Arrow Data Accelerator](https://github.com/spiceai/cookbook/tree/trunk/arrow#readme)
