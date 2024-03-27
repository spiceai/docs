---
title: 'Getting started with Spice.ai OSS'
sidebar_label: 'Getting started'
sidebar_position: 1
description: 'Get started with Spice in 5 minutes'
---

### Follow these steps to get started with Spice.

**Step 1.** Install the Spice CLI:

```bash
curl https://install.spiceai.org | /bin/bash
```

Or using `brew`:

```bash
brew install spiceai/spiceai/spice
```

**Step 2.** Initialize a new Spice app with the `spice init` command:

```bash
spice init spice_qs
```

A `spicepod.yaml` file is created in the `spice_qs` directory. Change to that directory:

```bash
cd spice_qs
```

**Step 3.** Connect to the sample Dremio instance to access the sample data:

```bash
spice login dremio -u demo -p demo1234
```

**Step 4.** Start the Spice runtime:

```bash
spice run
```

Example output will be shown as follows:

```bash
Spice.ai runtime starting...
Using latest 'local' runtime version.
2024-02-21T06:11:56.381793Z  INFO runtime::http: Spice Runtime HTTP listening on 127.0.0.1:3000
2024-02-21T06:11:56.381853Z  INFO runtime::flight: Spice Runtime Flight listening on 127.0.0.1:50051
2024-02-21T06:11:56.382038Z  INFO runtime::opentelemetry: Spice Runtime OpenTelemetry listening on 127.0.0.1:50052
```

The runtime is now started and ready for queries.

**Step 5.** In a new terminal window, add the `spiceai/quickstart` Spicepod. A Spicepod is a package of configuration defining datasets and ML models.

```bash
spice add spiceai/quickstart
```

The `spicepod.yaml` file will be updated with the `spiceai/quickstart` dependency.

```yaml
version: v1beta1
kind: Spicepod
name: PROJECT_NAME
dependencies:
  - spiceai/quickstart
```

The `spiceai/quickstart` Spicepod will add a `taxi_trips` data table to the runtime which is now available to query by SQL.

```bash
2024-02-22T05:53:48.222952Z  INFO runtime: Loaded dataset: taxi_trips
2024-02-22T05:53:48.223101Z  INFO runtime::dataconnector: Refreshing data for taxi_trips
```

**Step 6.** Start the Spice SQL REPL:

```bash
spice sql
```

The SQL REPL inferface will be shown:

```
Welcome to the interactive Spice.ai SQL Query Utility! Type 'help' for help.

show tables; -- list available tables
sql>
```

Enter `show tables;` to display the available tables for query:

```
sql> show tables;

+---------------+--------------------+-------------+------------+
| table_catalog | table_schema       | table_name  | table_type |
+---------------+--------------------+-------------+------------+
| datafusion    | public             | taxi_trips  | BASE TABLE |
| datafusion    | information_schema | tables      | VIEW       |
| datafusion    | information_schema | views       | VIEW       |
| datafusion    | information_schema | columns     | VIEW       |
| datafusion    | information_schema | df_settings | VIEW       |
+---------------+--------------------+-------------+------------+

Query took: 0.004728897 seconds
```

Enter a query to display the longest taxi trips:

```
sql> SELECT trip_distance_mi, total_amount FROM taxi_trips ORDER BY trip_distance_mi DESC LIMIT 10;
```

Output:

```
+------------------+--------------+
| trip_distance_mi | total_amount |
+------------------+--------------+
| 191.9            | 3.0          |
| 189.2            | 63.0         |
| 163.8            | 93.64        |
| 122.4            | 160.0        |
| 104.0            | 3.0          |
| 69.7             | 213.58       |
| 64.8             | 280.83       |
| 60.0             | 350.12       |
| 53.9             | 0.0          |
| 53.3             | 5.33         |
+------------------+--------------+

Query took: 0.002458976 seconds
```

## Next Steps

You can use any number of predefined datasets available from Spice.ai in the Spice runtime.

A list of publically available datasets from Spice.ai can be found here: https://[docs.spice.ai/building-blocks/datasets](https://docs.spice.ai/building-blocks/datasets).

In order to access public datasets from Spice, you will first need to create an account with Spice.ai by selecting the free tier membership.

Navigate to [spice.ai](https://spice.ai/) and create a new account by clicking on Try for Free.

<img width="500" alt="spiceai_try_for_free-1" src="https://github.com/spiceai/spiceai/assets/112157037/27fb47ed-4825-4fa8-94bd-48197406cfaa" />

After creating an account, you will need to create an app in order to create to an API key.

![create_app-1](https://github.com/spiceai/spiceai/assets/112157037/d2446406-1f06-40fb-8373-1b6d692cb5f7)

You will now be able to access datasets from the Spice.ai Platform. For this quickstart, we will be using the `eth.recent_blocks` dataset.

**Step 1.** Log in and authenticate from the command line using the `spice login` command. A pop up browser window will prompt you to authenticate:

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
2024-02-21T22:49:10.038461Z  INFO runtime: Loaded dataset: eth_recent_blocks
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
