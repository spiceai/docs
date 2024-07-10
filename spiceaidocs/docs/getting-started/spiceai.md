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

**Step 1.** Log in to the Spice Cloud Platform from the command line using the `spice login` command. A pop up browser window will prompt you to authenticate:

```bash
spice login
```

**Step 2.** Initialize a new project and start the runtime:

```bash
# Initialize a new Spice app
spice init spice_app

# Change to app directory
cd spice_app

# Start the runtime
spice run
```

**Step 3.** Configure the dataset:

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
2024-05-20T22:50:17.997446Z  INFO runtime: Registered dataset eth_recent_blocks
2024-05-20T22:50:17.998125Z  INFO runtime::accelerated_table::refresh: Loading data for dataset eth_recent_blocks
```

**Step 4.** In a new terminal window, use the Spice SQL REPL to query the dataset

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
| 19281345 | 400378 | 16150051 |
| 19281344 | 200501 | 16480224 |
| 19281343 | 97758  | 12605531 |
| 19281342 | 89629  | 12035385 |
| 19281341 | 133649 | 13335719 |
| 19281340 | 307584 | 18389159 |
| 19281339 | 89233  | 13391332 |
| 19281338 | 75250  | 12806684 |
| 19281337 | 100721 | 11823522 |
| 19281336 | 150137 | 13418403 |
+----------+--------+----------+

Query took: 0.004057791 seconds
```

You can experiment with the time it takes to generate queries when using non-accelerated datasets. You can change the acceleration setting from `true` to `false` in the datasets.yaml file.
