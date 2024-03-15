---
type: docs
title: "Getting started with Spice.ai"
linkTitle: "Getting started"
weight: 20
description: "Get started with Spice.ai in 5 minutes"
no_list: true
---

{{% alert title="Spice.ai Concepts" color="primary" %}}
Before following this guide it is first recommended to review the Spice.ai [core concepts](/).
{{% /alert %}}

### Follow these steps to get started with Spice.ai.

**Step 1.** Install the Spice CLI:

```bash
curl https://install.spiceai.org | /bin/bash
```

**Step 2.** Initialize a new Spice app with the `spice init` command:

```bash
spice init spice_app
```

A `Spicepod.yaml` file is created in the working directory.

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

The `Spicepod.yaml` file will be updated with the `spiceai/quickstart` dependency.

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

Enter a query to display the most expensive tax trips:

```
sql> SELECT trip_distance_mi, fare_amount FROM taxi_trips ORDER BY fare_amount LIMIT 10;
```

Output:

```
+------------------+-------------+
| trip_distance_mi | fare_amount |
+------------------+-------------+
| 1.1              | 7.5         |
| 6.1              | 23.0        |
| 0.6              | 4.5         |
| 16.7             | 52.0        |
| 11.3             | 37.5        |
| 1.1              | 6.0         |
| 5.3              | 18.5        |
| 1.3              | 7.0         |
| 1.0              | 7.0         |
| 3.5              | 17.5        |
+------------------+-------------+

Query took: 0.002458976 seconds
```

## Next Steps

You can use any number of predefined datasets available from Spice.ai in the Spice Runtime.

A list of publically available datasets from Spice.ai can be found here: https://docs.spice.ai/building-blocks/datasets.

In order to access public datasets from Spice, you will first need to create an account with Spice.ai by selecting the free tier membership.

Navigate to https://spice.ai/ and create a new account by clicking on Try for Free.

<img width="500" alt="spiceai_try_for_free-1" src="https://github.com/spiceai/spiceai/assets/112157037/27fb47ed-4825-4fa8-94bd-48197406cfaa">

After creating an account, you will need to create an app in order to create to an API key.

![create_app-1](https://github.com/spiceai/spiceai/assets/112157037/d2446406-1f06-40fb-8373-1b6d692cb5f7)

You will now be able to access datasets from Spice.ai. For this demonstration, we will be using the Spice.ai/eth.recent_blocks dataset.

**Step 1.** In a new directory, log in and authenticate from the command line using the `spice login` command. A pop up browser window will prompt you to authenticate:

```bash
spice login
```

**Step 2.** Initialize a new project if you haven't already done so. Then, start the runtime:

```bash
spice init my_spiceai_project
```

```bash
spice run
```

**Step 3.** Configure the dataset:

In a new terminal window, configure a new dataset using the `spice dataset configure` command:

```bash
spice dataset configure
```

You will be prompted to enter a name. Enter a name that represents the contents of the dataset

```bash
dataset name: (default) eth_recent_blocks
```

Enter the description of the dataset:

```
description: eth recent logs
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

## Importing dataset from Dremio

**Step 1.** If you have a dataset hosted in Dremio, you can load it into the Spice Runtime as follows:

```bash
spice login dremio -u <USERNAME> -p <PASSWORD>
```

**Step 2.** If you haven't already initialized a new project, you need to do so. Then, start the Spice Runtime.

```bash
spice init dremio-demo-project
```

```bash
spice run
```

**Step 3.** We now configure the dataset from Dremio:

```bash
spice dataset configure
```

Enter the name of the dataset:

```bash
dataset name: (default)  my_dataset
```

Enter the description of the dataset:

```
description: my dataset in dremio
```

Specify the location of the dataset:

```bash
from: dremio:datasets.my_dataset
```

Select "y" when prompted whether to locally accelerate the dataset:

```bash
Locally accelerate (y/n)? y
```

We should now see the following output:

```
Dataset settings written to `datasets/my_dataset/dataset.yaml`!
```

If the login credentials were entered correctly, your dataset will have loaded into the runtime. You should see the following in the Spice runtime terminal :

```
2024-02-14T18:34:15.174564Z  INFO spiced: Loaded dataset: my_dataset
2024-02-14T18:34:15.175189Z  INFO runtime::datasource: Refreshing data for my_dataset
```

**Step 4.** Run queries against the dataset using the Spice SQL REPL.

In a new terminal, start the Spice SQL REPL

```bash
spice sql
```

You can now now query `my_dataset` in the runtime.
