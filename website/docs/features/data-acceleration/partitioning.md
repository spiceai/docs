---
title: 'Partitioning'
sidebar_label: 'Partitioning'
description: 'Partition accelerated datasets to make filtered queries faster by reading only the relevant partitions.'
sidebar_position: 4
---

Partitioning splits an accelerated dataset into multiple physical units (files or in-memory tables) keyed by an expression evaluated per row. Queries that filter on the partitioning expression — or on a column it references — only read the partitions that can match, dramatically reducing the data scanned.

```yaml
datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: taxi_trips
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      partition_by:
        - bucket(50, PULocationID)
```

This config writes 50 separate partitions, each containing the rows whose `PULocationID` hashes to the same bucket. A query like `WHERE PULocationID = 132` only reads the single bucket partition that could contain `132`.

## How partitioning works

1. **At refresh time**, Spice evaluates each `partition_by` expression for every row and routes the row to a partition keyed by the expression's value.
2. **At query time**, Spice rewrites filters that reference the partition column or expression into a partition selection, and only reads partitions that could satisfy the filter ([partition pruning](#partition-pruning)).
3. **Composite partitioning** (Arrow and Cayenne) layers multiple expressions hierarchically — e.g. `year` then `month` — to combine pruning across dimensions.

Partitioning is most useful when:

- Queries reliably filter on a small subset of values (`region = 'EU'`, `tenant_id IN (...)`, `created_at >= today() - INTERVAL '7 days'`).
- A single column has high cardinality and partitioning by it directly would create too many tiny files — `bucket(N, col)` collapses to `N` partitions.
- The dataset grows large enough that scanning the whole acceleration on every query is expensive.

## Configuration

### `partition_by`

Lives directly under `acceleration:` (not under `acceleration.params:`). It's a list of expressions; each entry is either a plain string or a single-entry `{ name: expression }` mapping:

```yaml
acceleration:
  enabled: true
  engine: arrow
  partition_by:
    # Anonymous expression — auto-named "expr0", "expr1", …
    - "YEAR(created_at)"
    # Named expression
    - month: "MONTH(created_at)"
```

Multi-entry mappings (`- year: "…", month: "…"` on one list item) are rejected at load time.

### Supported engines

| Engine    | Required `mode:` | Multi-expression | Layout                                          |
| --------- | ---------------- | ---------------- | ----------------------------------------------- |
| `arrow`   | (memory; default)| Yes              | One Arrow `MemTable` per partition value.       |
| `cayenne` | `file`           | Yes              | One Vortex table per partition; catalog in a SQLite metadata file. |

`duckdb`, `sqlite`, `postgres`, and `turso` accelerators do **not** support `partition_by`; configuring it on those engines is rejected at load time. Use `arrow` or `cayenne` for partitioned acceleration.

## Partition transforms

`partition_by` accepts any DataFusion-compatible scalar SQL expression that returns a String, integer, Boolean, or Timestamp and references exactly one column from the dataset. The most common partition transforms are:

### `bucket(num_buckets, column)`

Hashes `column` into `num_buckets` deterministic buckets.

- `num_buckets` must be a positive integer literal `≤ 1,000,000`.
- The return type matches `num_buckets` — `bucket(50, …)` (Int64 literal) returns `Int64`; `bucket(50::int32, …)` returns `Int32`.
- Same input always maps to the same bucket for a given `num_buckets` (uses ahash with a fixed seed).
- Use for: high-cardinality columns where direct partitioning would create too many partitions (`user_id`, `account_id`, `device_id`).

```yaml
partition_by:
  - bucket(100, user_id)
```

See the [`bucket` reference](../../reference/sql/scalar_functions#bucket) for the full SQL signature.

### `truncate(width, value)`

Truncates to the next-lower multiple of `width`. Iceberg's truncate transform.

- `width` must be a positive `Int64` literal.
- `value` may be any signed/unsigned integer, `Decimal128`/`Decimal256`, `Utf8` (string), or `Binary`. For strings/binary, returns the first `width` units.
- Returns the same type as `value`.
- Use for: floor-bucketing wide numeric ranges (`truncate(1000, amount)`), or grouping strings by prefix (`truncate(2, country_code)`).

```yaml
partition_by:
  - truncate(1000, amount)
```

See the [`truncate` reference](../../reference/sql/scalar_functions#truncate) for examples.

### `date_part(unit, column)` and `date_trunc(unit, column)`

Built-in DataFusion datetime functions. Useful for time-based partitioning at year, month, day, or hour granularity.

- `date_part('year', col)` returns the integer year (e.g. `2026`).
- `date_trunc('day', col)` returns the timestamp truncated to the start of the day.

```yaml
partition_by:
  - date_part('year', l_shipdate)
```

```yaml
partition_by:
  - day: "date_trunc('day', created_at)"
```

`YEAR(col)`, `MONTH(col)`, `DAY(col)`, etc. are aliases of `date_part(...)` and work identically.

:::note Filter pruning for `date_part()` is not yet implemented
A `date_part('year', l_shipdate)` partition still produces correctly-distributed partitions, but a filter like `WHERE l_shipdate >= '2026-01-01'` does not currently translate to a partition pruning. Queries return correct results — they just scan more partitions than necessary. If your filter is on the bare partition expression (`WHERE date_part('year', l_shipdate) = 2026`), the equality form does prune.
:::

### Modulo (`column % N`)

A plain modulo expression also produces stable, partition-prunable buckets:

```yaml
partition_by:
  - "id % 16"
```

Range filters on the base column (`id BETWEEN 0 AND 1000`) are pruned for `%` partitions.

### Plain column reference

A bare column name partitions one partition per distinct value — useful for low-cardinality columns:

```yaml
partition_by:
  - region
```

Pruning supports equality, `IN`, `NOT IN`, and range filters on the column.

## Composite partitioning (Arrow + Cayenne)

Arrow and Cayenne accelerations accept multiple `partition_by` expressions. Spice partitions hierarchically — first by the leftmost expression, then by the next, and so on.

```yaml
acceleration:
  enabled: true
  engine: cayenne
  mode: file
  partition_by:
    - year: "date_part('year', created_at)"
    - month: "date_part('month', created_at)"
    - region: region
```

A query with `WHERE region = 'EU' AND date_part('year', created_at) = 2026` prunes on both axes.

## Partition pruning

Spice attempts to translate query-time filters into a partition selection. The matrix below summarizes which filter shapes prune which partition transforms:

| Filter shape                         | Plain column / `truncate` / `date_trunc` / `% N` | `bucket(N, col)`                              |
| ------------------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `col = X`                            | ✓                                                | ✓ (filter substituted into bucket expression) |
| `col != X`                           | ✓                                                | ✗ (no pruning)                                |
| `col IN (a, b, …)`                   | ✓                                                | ✓                                             |
| `col NOT IN (a, b, …)`               | ✓                                                | ✗ (no pruning)                                |
| `col < X` / `<= X` / `> X` / `>= X`  | ✓                                                | ✓ only for **bounded** ranges (both lower and upper) |
| `col BETWEEN a AND b`                | ✓                                                | ✓ (when range expands to ≤ a few thousand Int32 values) |
| `col = a OR col = b OR …`            | ✓                                                | ✓                                             |
| `partition_expr = X` (e.g. `bucket(50, c) = 7`) | ✓                                     | ✓                                             |
| `expr1_filter AND expr2_filter` (composite partitions) | ✓                              | ✓                                             |

Pruning notes:

- **Filter on the base column is substituted into the partition expression.** `WHERE user_id = 42` against a `bucket(100, user_id)` partition evaluates `bucket(100, 42)` once and reads only that partition.
- **Bucket inequality pruning** enumerates candidate values within a bounded `Int32` range (capped at `MAX_BUCKET_ENUMERATION_I32` candidate values). Open-ended ranges (`col < X` with no lower bound) and non-`Int32` types fall back to no pruning.
- **`date_part()` filter pruning is not yet implemented** for time-range filters. Equality on the partition expression still prunes; range filters on the base column do not.
- **Filters that don't fully resolve at the partition layer** are passed through to the data layer — pruning is best-effort and never returns wrong rows.

## Engine-specific behavior

### Arrow (`engine: arrow`)

In-memory MemTable per partition value. Partitions are rebuilt on every refresh. The simplest engine to start with for moderate datasets that fit in RAM. `hash_index` and `sort_columns` are propagated per partition.

### Cayenne (`engine: cayenne`)

Each partition is a separate Cayenne (Vortex) table; the partition catalog is tracked in a SQLite metadata file. Cayenne supports composite partitioning natively and is the right pick for very large datasets where Arrow would not fit in memory.

Requires `mode: file`.

## Changing `partition_by` after refresh

Once partitions exist on disk, changing `partition_by` is rejected:

> The `partition_by` expressions are different from the expressions used to create the existing partition files. Revert the `partition_by` expressions, delete the partition files, or change the location the partition files are stored to create new partitions.

To re-partition:

1. Stop the runtime.
2. Delete the partitioned acceleration directory or point `accelerator_dir` at a fresh location.
3. Update `partition_by`.
4. Restart — Spice will rebuild from the source.

There is no automatic in-place re-partitioning.

## Validation rules

A `partition_by` expression is rejected at startup if any of the following hold:

- Result type is not `String`, an integer (signed or unsigned), `Boolean`, or `Timestamp`.
- Expression references zero or multiple dataset columns.
- Expression contains a subquery, `OUTER REFERENCE`, `UNNEST`, window function, aggregate function, `EXISTS`, `GROUPING SET`, or `PLACEHOLDER`.
- Expression aliases the column (`col AS partition_key`).

For the `cayenne` engine, `mode:` must be `file`.

## Examples

### High-cardinality hash partitioning

Partition events by user, collapsing millions of users into 100 stable buckets:

```yaml
datasets:
  - from: s3://my-bucket/events/
    name: events
    params:
      file_format: parquet
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      partition_by:
        - bucket(100, user_id)
```

```sql
-- Reads the single bucket that hashes user_id 42:
SELECT COUNT(*) FROM events WHERE user_id = 42;

-- Reads at most 4 bucket partitions:
SELECT * FROM events WHERE user_id IN (1, 2, 3, 4);
```

### Time-based partitioning by year

```yaml
acceleration:
  enabled: true
  engine: cayenne
  mode: file
  partition_by:
    - date_part('year', l_shipdate)
```

```sql
-- Equality on the partition expression prunes:
SELECT * FROM lineitem WHERE date_part('year', l_shipdate) = 2026;
```

### Composite year/month partitioning (Cayenne)

```yaml
acceleration:
  enabled: true
  engine: cayenne
  mode: file
  partition_by:
    - year: "date_part('year', created_at)"
    - month: "date_part('month', created_at)"
```

### Truncate-based numeric partitioning

```yaml
acceleration:
  enabled: true
  engine: arrow
  partition_by:
    - "truncate(1000, order_total_cents)"
```

```sql
-- Range pruning works because truncate is monotonic:
SELECT * FROM orders WHERE order_total_cents BETWEEN 5000 AND 9999;
```

### Plain column partitioning by region

```yaml
acceleration:
  enabled: true
  engine: arrow
  partition_by:
    - region
```

```sql
-- One partition read:
SELECT * FROM events WHERE region = 'EU';
```

## Related

- [`bucket` SQL reference](../../reference/sql/scalar_functions#bucket)
- [`truncate` SQL reference](../../reference/sql/scalar_functions#truncate)
- [`date_part` SQL reference](../../reference/sql/scalar_functions#date_part)
- [`date_trunc` SQL reference](../../reference/sql/scalar_functions#date_trunc)
- [Data refresh modes](./data-refresh) — `time_partition_column` for time-pruned refreshes
- [Sharded deployment](../../deployment/architectures/sharded) — partitioning across multiple Spice instances rather than within one acceleration
