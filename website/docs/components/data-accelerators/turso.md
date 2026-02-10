---
title: 'Turso Data Accelerator'
sidebar_label: 'Turso Data Accelerator'
description: 'Turso (libSQL) Data Accelerator Documentation'
sidebar_position: 6
tags:
  - turso
  - libsql
  - data-accelerators
---

:::info Beta
The Turso Data Accelerator is in Beta. Features and configuration may change.
:::

The Turso Data Accelerator uses [Turso](https://turso.tech/) (built on [libSQL](https://github.com/tursodatabase/libsql), a fork of SQLite) as the acceleration engine for caching and accelerating query performance. Turso provides native async support and modern improvements over traditional SQLite while maintaining SQLite compatibility.

To enable Turso acceleration, set the dataset's `acceleration.engine` to `turso`:

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: turso
```

## Modes

### Memory Mode

By default, Turso acceleration uses `mode: memory`, creating an in-memory database for fast temporary caching:

```yaml
datasets:
  - from: postgres:transactions
    name: transactions
    acceleration:
      enabled: true
      engine: turso
```

### File Mode

When using `mode: file`, datasets are stored by default in a Turso database file on disk in the `.spice/data` directory relative to the spicepod.yaml. Specify the `turso_file` parameter to store the database file in a different location:

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: turso
      mode: file
      params:
        turso_file: /my/chosen/location/data.turso
```

## Configuration Parameters

Turso acceleration supports the following optional parameters under `acceleration.params`:

- `turso_file` (string, default: `.spice/data/{dataset_name}.turso`): Path to the Turso database file. Only applies if `mode` is `file`. If the file does not exist, Spice creates it automatically.
- `turso_mvcc` (string, default: `disabled`): Enable Multi-Version Concurrency Control (MVCC) for improved concurrent read/write performance. Values: `enabled`, `disabled`.
- `internal_timestamp_format` (string, default: `rfc3339`): Internal timestamp storage format. See [Timestamp Storage](#timestamp-storage) section. Values: `rfc3339`, `integer_millis`.

### Example Configuration

```yaml
datasets:
  - from: mysql:orders
    name: orders
    acceleration:
      enabled: true
      engine: turso
      mode: file
      refresh_mode: full
      refresh_check_interval: 10m
      params:
        turso_file: ./orders.turso
        turso_mvcc: enabled
```

Refer to the [datasets configuration reference](../../reference/spicepod/datasets#acceleration) for additional supported fields.

## Timestamp Storage

Turso supports two timestamp storage formats to accommodate different use cases:

### RFC3339 Format (Default)

By default, timestamps are stored as **RFC3339 TEXT strings** (e.g., `"2024-01-01T00:00:00.123456789Z"`). This format preserves all timestamp information:

- ✅ Full nanosecond precision preserved
- ✅ Timezone information preserved
- ✅ All Arrow timestamp types supported (Second, Millisecond, Microsecond, Nanosecond)
- ✅ Human-readable in database tools

### Integer Milliseconds Format

For performance-critical use cases, set `internal_timestamp_format: "integer_millis"` to store timestamps as integers (milliseconds since Unix epoch):

```yaml
acceleration:
  engine: turso
  params:
    internal_timestamp_format: integer_millis
```

- ✅ Higher performance (direct integer operations)
- ✅ Compact storage (8 bytes vs ~30 bytes for RFC3339)
- ⚠️ Millisecond precision only (sub-millisecond data is truncated)
- ⚠️ No timezone preservation (UTC assumed)
- ⚠️ Limited to Second and Millisecond timestamp types

## Features

### MVCC Support

Multi-Version Concurrency Control (MVCC) can be enabled for improved concurrent read/write performance:

```yaml
acceleration:
  engine: turso
  params:
    turso_mvcc: enabled
```

When MVCC is enabled:

- Concurrent reads and writes perform better
- Indexes are not yet supported (a warning is logged if indexes are configured)

### Indexes

Turso supports index creation for improved query performance (when MVCC is disabled):

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: turso
      indexes:
        id: enabled
        '(created_at, status)': unique
```

See [Indexes](../../features/data-acceleration/indexes) for more details.

### Connection Pooling

Turso uses connection pooling for efficient database access. Connection pools are shared across datasets using the same database file.

### Query Federation

Turso supports query federation, allowing queries to span multiple data sources. The accelerator pushes down filters, projections, and limits when possible for improved performance.

## Limitations

- **Remote databases not supported**: Only local Turso databases (file-based or in-memory) are supported as accelerators. Remote Turso databases using `turso_url` and `turso_auth_token` are not supported in this accelerator context. Remote Turso support will be available when Turso is implemented as a data connector.
- **Indexes with MVCC**: Indexes are not yet supported when MVCC is enabled.
- **Arrow Interval types**: Not supported, as SQLite/libSQL doesn't have a native interval type.
- **Complex List types**: Only Arrow `List` types of primitive data types are supported; lists with structs are not supported.
- **Dictionary and Map types**: Not supported.
- **Hot-reload federation**: Updating a dataset with Turso acceleration while the Spice Runtime is running (hot-reload) may disable query federation until the runtime is restarted.
- **ROLLUP and GROUPING**: Advanced grouping features are not supported.

## Comparison with SQLite

Turso is built on libSQL (a fork of SQLite) and offers several advantages:

| Feature          | Turso                                  | SQLite                          |
| ---------------- | -------------------------------------- | ------------------------------- |
| Async Support    | Native async via libSQL                | Synchronous with spawn_blocking |
| Connection Model | Modern async pooling                   | Traditional sync connections    |
| Performance      | Optimized for modern workloads         | Traditional SQLite performance  |
| File Extensions  | `.turso`, `.db`, `.sqlite`, `.sqlite3` | `.db`, `.sqlite`, `.sqlite3`    |

Choose Turso when you need:

- Native async database operations
- Modern connection pooling
- Better performance for concurrent workloads

Choose SQLite when you need:

- Maximum compatibility with existing SQLite tools
- Simpler deployment without additional dependencies

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk using `mode: file`.

:::

## Building Spice with Turso Support

Turso is an optional feature in Spice. To build with Turso support:

```bash
# Build spiced with Turso support
cargo build --release --features turso

# Or for development
cargo build --features turso
```

## Related Documentation

- [Data Acceleration](../../features/data-acceleration) - Data acceleration overview
- [Data Refresh](../../features/data-acceleration/data-refresh) - Refresh mode configuration
- [Indexes](../../features/data-acceleration/indexes) - Index configuration
- [SQLite Data Accelerator](./sqlite) - Alternative SQLite-based acceleration
