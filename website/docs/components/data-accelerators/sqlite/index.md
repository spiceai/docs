---
title: 'SQLite Data Accelerator'
sidebar_label: 'SQLite Data Accelerator'
description: 'The SQLite data accelerator is deprecated in v2.4 and removed in v2.5. Migrate SQLite accelerations to Spice Cayenne.'
sidebar_position: 4
pagination_next: null
tags:
  - data-accelerators
---

> **Deprecated in v2.4**: The `sqlite` acceleration engine was deprecated in v2.4 and removed in v2.5. See the [v2.4 docs](https://github.com/spiceai/docs/blob/trunk/website/versioned_docs/version-2.4.x/components/data-accelerators/sqlite/index.md) for documentation of this feature.

A dataset or view that sets `acceleration.engine: sqlite` fails to load, and the other components in the Spicepod load normally:

```text
Failed to load dataset 'orders': the acceleration engine `sqlite` is no longer supported as of v2.5 and cannot be used. Set `acceleration.engine: cayenne`, or remove `engine` to use the default, which is `cayenne`, then delete the old engine's acceleration files and snapshots. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

A dataset that serves published snapshots with [`file_format: snapshot`](../../../features/data-acceleration/snapshots.md#serve-a-dataset-from-published-snapshots) fails to load with the same cause when a SQLite acceleration published those snapshots.

Spice does not switch a SQLite acceleration to Cayenne on its own, and Cayenne does not read SQLite files. To migrate, set `acceleration.engine: cayenne` (or remove `engine`, since Cayenne is the default) and remove the SQLite parameters `sqlite_file` and `busy_timeout` from `acceleration.params`. A SQLite acceleration with `mode: file` kept its data across restarts, but a Cayenne acceleration with no `mode` is in memory and starts empty on every restart. To keep the data on disk, keep `mode: file`. The dataset then loads its data again from its source. Delete the old SQLite acceleration files and snapshots once every dataset that used them has moved.

A SQLite acceleration can hold data its source does not have: writes made with `write_mode: acceleration`, `write_back` writes not yet delivered, or append history the source no longer keeps. A v2.5 runtime cannot read a SQLite acceleration file, so move that data while still on v2.4. [Migrating to Spice Cayenne](../cayenne/migration.md) covers each step.

The SQLite databases that Spice reads as a source are not affected: an [ADBC](../../data-connectors/adbc.md) connection with `adbc_driver: sqlite` and an [ODBC](../../data-connectors/odbc.md) connection to SQLite still work. Cayenne keeps its own metastore in a SQLite database, which is also not affected.
