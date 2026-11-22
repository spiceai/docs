---
type: docs
title: 'PostgreSQL Data Accelerator'
sidebar_label: 'PostgreSQL Data Accelerator'
description: 'The PostgreSQL data accelerator is deprecated in v2.4 and removed in v2.5. Migrate PostgreSQL accelerations to Spice Cayenne.'
sidebar_position: 5
tags:
  - postgres
  - data-accelerators
---

> **Deprecated in v2.4**: The `postgres` acceleration engine was deprecated in v2.4 and removed in v2.5. See the [v2.4 docs](https://github.com/spiceai/docs/blob/trunk/website/versioned_docs/version-2.4.x/components/data-accelerators/postgres/index.md) for documentation of this feature.

A dataset or view that sets `acceleration.engine: postgres`, or its alias `postgresql`, fails to load, and the other components in the Spicepod load normally:

```text
Failed to load dataset 'orders': the acceleration engine `postgres` is no longer supported as of v2.5 and cannot be used. Set `acceleration.engine: cayenne`, or remove `engine` to use the default, which is `cayenne`, then delete the old engine's acceleration files and snapshots. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

Tagged open-source `spiced` releases never included the PostgreSQL data accelerator; it was built into Spice.ai Enterprise, nightly builds, and `make install-data-only`. On a v2.4 release build without it, a dataset that set `engine: postgres` already failed to load, with an error saying the engine is not available in this build.

Spice does not switch a PostgreSQL acceleration to Cayenne on its own, and Cayenne does not read the accelerated tables in the PostgreSQL database. To migrate, set `acceleration.engine: cayenne` (or remove `engine`, since Cayenne is the default) and remove the `pg_*` parameters from `acceleration.params`. The dataset then loads its data again from its source. Spice does not drop the old accelerated table in PostgreSQL; drop it there once no runtime reads it.

A PostgreSQL acceleration can hold data its source does not have: writes made with `write_mode: acceleration`, `write_back` writes not yet delivered, or append history the source no longer keeps. A v2.5 runtime cannot read a PostgreSQL acceleration, so move that data while still on v2.4. [Migrating to Spice Cayenne](../cayenne/migration.md) covers each step.

The [PostgreSQL data connector](../../data-connectors/postgres/index.md) (`from: postgres:`), the [PostgreSQL catalog connector](../../catalogs/postgres.md), and [PostgreSQL logical replication](../../../features/cdc/postgres-replication.md) are not affected.
