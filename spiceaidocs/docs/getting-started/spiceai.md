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

This quickstart will use the `taxi_trips` dataset from https://spice.ai/spiceai/quickstart Spice.ai app.

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
dataset name: (spice_app) taxi_trips
```

Enter the description of the dataset:

```
description: Taxi trips dataset
```

Enter the location of the dataset:

```bash
from: spice.ai/spiceai/quickstart/datasets/taxi_trips
```

Select `y` when prompted whether to accelerate the data:

```bash
Locally accelerate (y/n)? y
```

You should see the following output from your runtime terminal:

```bash
2024-12-16T05:12:45.803694Z  INFO runtime::init::dataset: Dataset taxi_trips registered (spice.ai/spiceai/quickstart/datasets/taxi_trips), acceleration (arrow, 10s refresh), results cache enabled.
2024-12-16T05:12:45.805494Z  INFO runtime::accelerated_table::refresh_task: Loading data for dataset taxi_trips
2024-12-16T05:13:24.218345Z  INFO runtime::accelerated_table::refresh_task: Loaded 2,964,624 rows (8.41 GiB) for dataset taxi_trips in 38s 412ms.
```

**Step 5.** In a new terminal window, use the Spice SQL REPL to query the dataset

```bash
spice sql
```

```bash
SELECT tpep_pickup_datetime, passenger_count, trip_distance from taxi_trips LIMIT 10;
```

The output displays the results of the query along with the query execution time:

```bash
+----------------------+-----------------+---------------+
| tpep_pickup_datetime | passenger_count | trip_distance |
+----------------------+-----------------+---------------+
| 2024-01-11T12:55:12  | 1               | 0.0           |
| 2024-01-11T12:55:12  | 1               | 0.0           |
| 2024-01-11T12:04:56  | 1               | 0.63          |
| 2024-01-11T12:18:31  | 1               | 1.38          |
| 2024-01-11T12:39:26  | 1               | 1.01          |
| 2024-01-11T12:18:58  | 1               | 5.13          |
| 2024-01-11T12:43:13  | 1               | 2.9           |
| 2024-01-11T12:05:41  | 1               | 1.36          |
| 2024-01-11T12:20:41  | 1               | 1.11          |
| 2024-01-11T12:37:25  | 1               | 2.04          |
+----------------------+-----------------+---------------+

Time: 0.00538925 seconds. 10 rows.
```

You can experiment with the time it takes to generate queries when using non-accelerated datasets. You can change the acceleration setting from `true` to `false` in the datasets.yaml file.

### Additional Example

```bash
# Query to display the average trip distance
SELECT AVG(trip_distance) FROM taxi_trips;
```

The output displays the average gas used:

```bash
+-------------------------------+
| avg(taxi_trips.trip_distance) |
+-------------------------------+
| 3.652169178958276             |
+-------------------------------+

Time: 0.031145625 seconds. 1 rows.
```
