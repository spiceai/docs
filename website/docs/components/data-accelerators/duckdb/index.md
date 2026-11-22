---
title: 'DuckDB Data Accelerator'
sidebar_label: 'DuckDB Data Accelerator'
description: 'The DuckDB data accelerator is deprecated in v2.4 and removed in v2.5. Migrate DuckDB accelerations to Spice Cayenne.'
sidebar_position: 3
tags:
  - duckdb
  - data-accelerators
---

> **Deprecated in v2.4**: The `duckdb` acceleration engine was deprecated in v2.4 and removed in v2.5. See the [v2.4 docs](https://github.com/spiceai/docs/blob/trunk/website/versioned_docs/version-2.4.x/components/data-accelerators/duckdb/index.md) for documentation of this feature.

A dataset or view that sets `acceleration.engine: duckdb` fails to load, and the other components in the Spicepod load normally:

```text
Failed to load dataset 'orders': the acceleration engine `duckdb` is no longer supported as of v2.5 and cannot be used. Set `acceleration.engine: cayenne`, or remove `engine` to use the default, which is `cayenne`, then delete the old engine's acceleration files and snapshots. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

A dataset that serves published snapshots with [`file_format: snapshot`](../../../features/data-acceleration/snapshots.md#serve-a-dataset-from-published-snapshots) fails to load with the same cause when a DuckDB acceleration published those snapshots.

Spice does not switch a DuckDB acceleration to Cayenne on its own, and Cayenne does not read DuckDB files. To migrate, set `acceleration.engine: cayenne` (or remove `engine`, since Cayenne is the default), remove the `duckdb_*` parameters and the DuckDB-only `on_refresh_sort_columns` and `on_full_refresh` parameters, and delete the old DuckDB acceleration files and snapshots. The dataset then loads its data again from its source. To keep the data clustered, replace `on_refresh_sort_columns` with Cayenne's [`sort_columns`](../cayenne/performance.md#sorted-data-and-segment-pruning).

A DuckDB acceleration can hold data its source does not have: writes made with `write_mode: acceleration`, `write_back` writes not yet delivered, or append history the source no longer keeps. A v2.5 runtime cannot read a DuckDB acceleration file, so move that data while still on v2.4. [Migrating to Spice Cayenne](../cayenne/migration.md) covers each step.

The [DuckDB data connector](../../data-connectors/duckdb/index.md) (`from: duckdb:`) and the [DuckLake connector](../../data-connectors/ducklake.md) are not affected. They read through an installed DuckDB library over ADBC, which `spiced` loads at runtime rather than compiling in.
