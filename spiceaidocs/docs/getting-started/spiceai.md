---
title: 'Community Data'
sidebar_label: 'Community Data'
sidebar_position: 2
description: 'Connect to the Spice.ai Cloud Platform to access community datasets.'
pagination_next: null
---

The [Spice.ai Cloud Platform](https://docs.spice.ai) includes a comprehensive set of free, ready-to-query [sample and blockchain datasets](https://docs.spice.ai/building-blocks/datasets).

The Spice runtime can query these datasets using the [Spice.ai Data Connector](/components/data-connectors/spiceai.md).

## Quickstart

To access these community datasets, navigate to [spice.ai](https://spice.ai/), and create a new account by clicking Try for Free.

<img width="500" alt="spiceai_try_for_free-1" src="https://github.com/spiceai/spiceai/assets/112157037/27fb47ed-4825-4fa8-94bd-48197406cfaa" />

After logging in, create an app in order to get an API key.

![create_app-1](https://github.com/spiceai/spiceai/assets/112157037/d2446406-1f06-40fb-8373-1b6d692cb5f7)

This quickstart will use the [`eth.recent_blocks`](https://docs.spice.ai/reference/sql-query-tables/ethereum/core-tables) dataset.

**Step 1.** Initialize a new project:

```bash
# Initialize a new Spice app
spice init spice_app

# Change to app directory
cd spice_app
```

**Step 2.** Log in to the Spice Cloud Platform from the command line using the `spice login` command. A pop up browser window will prompt you to authenticate:

```bash
spice login
```

Logging in will create or update a `.env` file in the project directory with the API key.

**Step 3.** Start the runtime:

```bash
# Start the runtime
spice run
```

**Step 4.** Configure the dataset:

In a new terminal window, configure a new dataset using the `spice dataset configure` command:

```bash
spice dataset configure
```

Enter a dataset name that will be used to reference the dataset in queries. This name does not need to match the name in the dataset source.

```bash
dataset name: (spice_app) eth_recent_blocks
```

Enter the description of the dataset:

```
description: Recent Ethereum blocks
```

Enter the location of the dataset:

```bash
from: spice.ai/eth.recent_blocks
```

Select `y` when prompted whether to accelerate the data:

```bash
Locally accelerate (y/n)? y
```

You should see the following output from your runtime terminal:

```bash
2024-08-05T13:09:08.342450Z  INFO runtime: Dataset eth_recent_blocks registered (spice.ai/eth.recent_blocks), acceleration (arrow, 10s refresh), results cache enabled.
2024-08-05T13:09:08.343641Z  INFO runtime::accelerated_table::refresh_task: Loading data for dataset eth_recent_blocks
2024-08-05T13:09:09.575822Z  INFO runtime::accelerated_table::refresh_task: Loaded 146 rows (6.36 MiB) for dataset eth_recent_blocks in 1s 232ms.
```

**Step 5.** In a new terminal window, use the Spice SQL REPL to query the dataset

```bash
spice sql
```

```bash
SELECT number, size, gas_used from eth_recent_blocks LIMIT 10;
```

The output displays the results of the query along with the query execution time:

```bash
+----------+--------+----------+
| number   | size   | gas_used |
+----------+--------+----------+
| 20462425 | 32466  | 6705045  |
| 20462435 | 262114 | 29985196 |
| 20462427 | 138376 | 29989452 |
| 20462444 | 40541  | 9480363  |
| 20462431 | 78505  | 16994166 |
| 20462461 | 110372 | 21987571 |
| 20462441 | 51089  | 11136440 |
| 20462428 | 327660 | 29998593 |
| 20462429 | 133518 | 20159194 |
| 20462422 | 61461  | 13389415 |
+----------+--------+----------+

Time: 0.008562625 seconds. 10 rows.
```

You can experiment with the time it takes to generate queries when using non-accelerated datasets. You can change the acceleration setting from `true` to `false` in the datasets.yaml file.
