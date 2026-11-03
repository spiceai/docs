---
title: 'DuckDB Vector Engine'
sidebar_label: 'DuckDB'
description: 'The DuckDB vector engine is deprecated in v2.4 and removed in v2.5. Use a Spice Cayenne acceleration for vector search instead.'
sidebar_position: 3
pagination_next: null
---

> **Deprecated in v2.4**: The DuckDB vector engine (`vectors.engine: duckdb`) was deprecated in v2.4 and removed in v2.5. See the [v2.4 docs](https://spiceai.org/docs/v2.4/components/vectors/duckdb) for documentation of this feature.

A dataset or view that selects the DuckDB vector engine, through `vectors.engine: duckdb` or a column's `embeddings[].engine: duckdb`, fails to load, and the other components in the Spicepod load normally:

```text
Failed to load dataset 'products': the vector engine `duckdb` is no longer supported as of v2.5 and cannot be used. Remove the `vectors` block and use `acceleration.engine: cayenne`, which indexes embedding columns for `vector_search` itself. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration#migrating-the-duckdb-vector-engine
```

To migrate, remove the `vectors` block and accelerate the dataset or view with [Spice Cayenne](../data-accelerators/cayenne/index.md), which indexes embedding columns for `vector_search` and `/v1/search` without a vector engine. [Migrating the DuckDB vector engine](../data-accelerators/cayenne/migration.md#migrating-the-duckdb-vector-engine) covers the configuration change, the distance metric, and the `_score` scale.
