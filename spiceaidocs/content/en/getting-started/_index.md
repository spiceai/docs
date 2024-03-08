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