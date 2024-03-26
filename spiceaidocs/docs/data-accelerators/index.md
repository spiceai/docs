---
title: 'Data Accelerators'
sidebar_label: 'Data Accelerators'
description: ''
sidebar_position: 7
---

Data sourced by Data Connectors can be locally materialized and accelerated using a Data Accelerator.

Acceleration is enabled on a dataset by setting the acceleration configuration. E.g.

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
```

For the complete reference specification see [datasets](../reference/spicepod/datasets.md).

By default, datasets will be locally materialized using in-memory Arrow records.

Data Accelerators using DuckDB, SQLite, or PostgreSQL engines can be used to materialize data in files or attached databases.

Currently supported Data Accelerators include:

| Engine Name                                          | Description             | Status | Engine Modes     |
| ---------------------------------------------------- | ----------------------- | ------ | ---------------- |
| `arrow`                                              | In-Memory Arrow Records | Alpha  | `memory`         |
| `duckdb`                                             | Embedded DuckDB         | Alpha  | `memory`, `file` |
| [`sqlite`](./sqlite.md)     | Embedded SQLite         | Alpha  | `memory`, `file` |
| [`postgres`](./postgres/index.md) | Attached PostgreSQL     | Alpha  |                  |