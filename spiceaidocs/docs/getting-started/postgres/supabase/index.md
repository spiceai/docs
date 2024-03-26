---
title: "Getting Started with Supabase as a Data Accelerator"
sidebar_label: "Supabase Data Accelerator"
description: 'Configure a Supabase PostgreSQL instance as a Data Accelerator'
---

### Follow these steps to get started with Supabase as a Data Accelerator.

**Step 1.** Create a Supabase account and project [https://supabase.com/](https://supabase.com/). Supabase will set up a new database as part of the account/project creation. Refer to the [Supabase Documentation](https://supabase.com/docs/guides/database/overview) for creating new databases in an existing project.

**Step 2.** Open the newly created Supabase project and select `Project Settings` from the sidebar navigation.

**Step 3.** Navigate to `Database` under `Configuration`.

**Step 4.** Find the `Connection parameters` section.
![Connection parameters](https://imagedelivery.net/HyTs22ttunfIlvyd6vumhQ/02a30c41-072c-49cc-cba3-e29f35ca6800/public)

**Step 5.** Start the Spice.ai runtime with the following dataset loaded, copying the connection parameters from Supabase:

```
- from: spice.ai/eth.recent_blocks
  name: eth_recent_blocks
  acceleration:
    refresh_mode: full
    refresh_interval: 10s
    engine: postgres
    params:
      pg_host: [Host]
      pg_db: [Database name]
      pg_port: "[Port]"
      pg_user: [User]
      pg_pass: [Password]
```

Follow the [quickstart guide](../index.md) to get started with the Spice.ai runtime.

See the [datasets reference](../../../reference/spicepod/datasets.md) for more dataset configuration options and [PostgreSQL Data Accelerator](../../../data-accelerators/postgres/index.md) for more options on configuring PostgreSQL as a Data Accelerator.

**Step 6.** Navigate to the `Table Editor` in the Supabase project to verify the creation of the `eth_recent_blocks` table. The Supabase `SQL Editor` can then be used to run queries against the table, with data updated in realtime.