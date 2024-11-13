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

## Limitations

- The In-Memory Arrow Data Accelerator does not support persistent storage. Data is stored in-memory and will be lost when the Spice runtime is stopped.
- The In-Memory Arrow Data Accelerator does not support `Decimal256` (76 digits), as it exceeds Arrow's maximum Decimal width of 38 digits.
- The In-Memory Arrow Data Accelerator does not support [constraints](/features/data-acceleration/constraints) and [indexes](/features/data-acceleration/indexes).
- With Arrow acceleration, mathematical operations like `value1 / value2` are treated as integer division if the values are integers. For example, `1 / 2` will result in 0 instead of the expected 0.5. Use casting to FLOAT to ensure conversion to a floating-point value: `CAST(1 AS FLOAT) / CAST(2 AS FLOAT)` (or `CAST(1 AS FLOAT) / 2`).

:::warning[Memory Considerations]

When accelerating a dataset using the In-Memory Arrow Data Accelerator, some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](./duckdb.md) and [`sqlite`](./sqlite.md) accelerators by specifying `mode: file`.

:::
