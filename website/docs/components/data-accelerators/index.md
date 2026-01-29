---
title: 'Data Accelerators'
sidebar_label: 'Data Accelerators'
description: ''
image: /img/og/data-accelerators.png
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

Data sourced by Data Connectors can be locally materialized and accelerated using a Data Accelerator.

A Data Accelerator will query/fetch data from a connected data source and store/update it locally in an embedded acceleration engine, such as DuckDB or SQLite. To set data refresh behavior, such as refreshing data on an interval see [Data Refresh](../../features/data-acceleration/data-refresh.md).

Dataset acceleration is enabled by setting the acceleration configuration. E.g.

```yaml
datasets:
  - name: accelerated_dataset
    acceleration:
      enabled: true
```

For the complete reference specification see [datasets](../../reference/spicepod/datasets).

By default, datasets will be locally materialized using in-memory Arrow records.

A choice of DuckDB, SQLite, or PostgreSQL engines can be used to materialize data, in-memory, on disk, or in attached databases.

Supported Data Accelerators include:

| Name       | Description                     | Status               | Engine Modes     |
| ---------- | ------------------------------- | -------------------- | ---------------- |
| `arrow`    | In-Memory Arrow Records         | Stable               | `memory`         |
| `cayenne`  | [Cayenne][cayenne]              | Alpha (v1.9.0-rc.1+) | `file`           |
| `duckdb`   | Embedded [DuckDB][duckdb]       | Stable               | `memory`, `file` |
| `postgres` | Attached [PostgreSQL][postgres] | Release Candidate    | N/A              |
| `sqlite`   | Embedded [SQLite][sqlite]       | Release Candidate    | `memory`, `file` |

[cayenne]: /docs/components/data-accelerators/cayenne
[duckdb]: /docs/components/data-accelerators/duckdb
[postgres]: /docs/components/data-accelerators/postgres
[sqlite]: /docs/components/data-accelerators/sqlite

## Data Types

Data Accelerators may not support all possible Apache Arrow data types. For complete compatibility, see [specifications](../../reference/datatypes/accelerators).

:::warning[Memory Considerations]

When accelerating a dataset using `mode: memory` (the default), some or all of the dataset is loaded into memory. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

In-memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`duckdb`](./duckdb) and [`sqlite`](./sqlite) accelerators by specifying `mode: file`.

:::

## Data Accelerator Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
