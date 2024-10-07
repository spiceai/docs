---
title: 'In-Memory Arrow Data Accelerator'
sidebar_label: 'In-Memory Arrow Data Accelerator'
description: 'In-Memory Arrow Data Accelerator Documentation'
sidebar_position: 1
---

The In-Memory Arrow Data Accelerator is the default data accelerator in Spice. It uses Apache Arrow to store data in-memory for fast access and query performance.

## Configuration

To use the In-Memory Arrow Data Accelerator, specify `arrow` as the `engine` for acceleration.

```yaml
datasets:
  - from: spice.ai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: arrow
```

## Limitations

- The In-Memory Arrow Data Accelerator does not support persistent storage. Data is stored in-memory and will be lost when the Spice runtime is stopped.
- The In-Memory Arrow Data Accelerator does not support schemas with nested arrays/lists, UTF8/string arrays/lists, structs, nested structs, or map fields.
- The In-Memory Arrow Data Accelerator does not support `Decimal256` (76 digits), as it exceeds Arrow's maximum Decimal width of 38 digits.

:::warning[Memory Considerations]

When accelerating a dataset using the In-Memory Arrow Data Accelerator, some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](./duckdb.md) and [`sqlite`](./sqlite.md) accelerators by specifying `mode: file`.

:::
