---
title: 'Turso Data Accelerator'
sidebar_label: 'Turso Data Accelerator'
description: 'The Turso (libSQL) data accelerator is deprecated in v2.4 and removed in v2.5. Migrate Turso accelerations to Spice Cayenne.'
sidebar_position: 6
tags:
  - turso
  - libsql
  - data-accelerators
---

> **Deprecated in v2.4**: The `turso` acceleration engine was deprecated in v2.4 and removed in v2.5. See the [v2.4 docs](https://github.com/spiceai/docs/blob/trunk/website/versioned_docs/version-2.4.x/components/data-accelerators/turso.md) for documentation of this feature.

A dataset or view that sets `acceleration.engine: turso` fails to load, and the other components in the Spicepod load normally:

```text
Failed to load dataset 'orders': the acceleration engine `turso` is no longer supported as of v2.5 and cannot be used. Set `acceleration.engine: cayenne`, or remove `engine` to use the default, which is `cayenne`, then delete the old engine's acceleration files and snapshots. See: https://spiceai.org/docs/components/data-accelerators/cayenne/migration
```

Spice does not switch a Turso acceleration to Cayenne on its own, and Cayenne does not read Turso files. To migrate, set `acceleration.engine: cayenne` (or remove `engine`, since Cayenne is the default), remove the `turso_*` parameters, and delete the old Turso acceleration files (`turso_file`, by default `.spice/data/<dataset>.turso`) and snapshots. The dataset then loads its data again from its source.

A Turso acceleration can hold data its source does not have: writes made with `write_mode: acceleration`, `write_back` writes not yet delivered, or append history the source no longer keeps. A v2.5 runtime cannot read a Turso acceleration file, so move that data while still on v2.4. [Migrating to Spice Cayenne](./cayenne/migration.md) covers each step.
