---
title: 'Getting started with Spice.ai OSS'
sidebar_label: 'Getting started'
sidebar_position: 1
description: 'Get started with Spice in 5 minutes'
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<div className="video-container">
  <iframe width="560" height="420" src="https://www.youtube.com/embed/AZyrecVWnEs?si=2s_2jLTJlUdgItyC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

### Follow these steps to get started with Spice.

**Step 1.** Install the Spice CLI:

<Tabs>
  <TabItem value="default" label="macOS, Linux, and WSL" default>
    ```bash
    curl https://install.spiceai.org | /bin/bash
    ```

    Or using `brew`:

    ```bash
    brew install spiceai/spiceai/spice
    ```

  </TabItem>
  <TabItem value="windows" label="Windows" default>
    ```bash
    curl -L "https://install.spiceai.org/Install.ps1" -o Install.ps1 && PowerShell -ExecutionPolicy Bypass -File ./Install.ps1
    ```
  </TabItem>
</Tabs>

**Step 2.** Initialize a new Spice app with the `spice init` command:

```bash
spice init spice_qs
```

A `spicepod.yaml` file is created in the `spice_qs` directory. Change to that directory:

```bash
cd spice_qs
```

**Step 3.** Start the Spice runtime:

```bash
spice run
```

Example output will be shown as follows:

```bash
Spice.ai runtime starting...
2024-08-05T13:02:40.247484Z  INFO runtime::flight: Spice Runtime Flight listening on 127.0.0.1:50051
2024-08-05T13:02:40.247490Z  INFO runtime::metrics_server: Spice Runtime Metrics listening on 127.0.0.1:9090
2024-08-05T13:02:40.247949Z  INFO runtime: Initialized results cache; max size: 128.00 MiB, item ttl: 1s
2024-08-05T13:02:40.248611Z  INFO runtime::http: Spice Runtime HTTP listening on 127.0.0.1:8090
2024-08-05T13:02:40.252356Z  INFO runtime::opentelemetry: Spice Runtime OpenTelemetry listening on 127.0.0.1:50052
```

The runtime is now started and ready for queries.

**Step 4.** In a new terminal window, add the `spiceai/quickstart` Spicepod. A Spicepod is a package of configuration defining datasets and ML models.

```bash
spice add spiceai/quickstart
```

The `spicepod.yaml` file will be updated with the `spiceai/quickstart` dependency.

```yaml
version: v1beta1
kind: Spicepod
name: spice_qs
dependencies:
    - spiceai/quickstart
```

The `spiceai/quickstart` Spicepod will add a `taxi_trips` data table to the runtime which is now available to query by SQL.

```bash
2024-08-05T13:04:56.742779Z  INFO runtime: Dataset taxi_trips registered (s3://spiceai-demo-datasets/taxi_trips/2024/), acceleration (arrow, 10s refresh), results cache enabled.
2024-08-05T13:04:56.744062Z  INFO runtime::accelerated_table::refresh_task: Loading data for dataset taxi_trips
2024-08-05T13:05:03.556169Z  INFO runtime::accelerated_table::refresh_task: Loaded 2,964,624 rows (421.71 MiB) for dataset taxi_trips in 6s 812ms.
```

**Step 5.** Start the Spice SQL REPL:

```bash
spice sql
```

The SQL REPL inferface will be shown:

```
Welcome to the Spice.ai SQL REPL! Type 'help' for help.

show tables; -- list available tables
sql>
```

Enter `show tables;` to display the available tables for query:

```
sql> show tables
+---------------+--------------+---------------+------------+
| table_catalog | table_schema | table_name    | table_type |
+---------------+--------------+---------------+------------+
| spice         | public       | taxi_trips    | BASE TABLE |
| spice         | runtime      | task_history | BASE TABLE |
| spice         | runtime      | metrics       | BASE TABLE |
+---------------+--------------+---------------+------------+

Time: 0.022671708 seconds. 3 rows.
```

Enter a query to display the longest taxi trips:

```
sql> SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;
```

Output:

```
+---------------+--------------+
| trip_distance | total_amount |
+---------------+--------------+
| 312722.3      | 22.15        |
| 97793.92      | 36.31        |
| 82015.45      | 21.56        |
| 72975.97      | 20.04        |
| 71752.26      | 49.57        |
| 59282.45      | 33.52        |
| 59076.43      | 23.17        |
| 58298.51      | 18.63        |
| 51619.36      | 24.2         |
| 44018.64      | 52.43        |
+---------------+--------------+

Time: 0.045150667 seconds. 10 rows.
```

## Next Steps

import DocCardList from '@theme/DocCardList';

<DocCardList items={[{type: 'link', label: 'Quickstarts', href: 'https://github.com/spiceai/quickstarts', description: 'Spice.ai Quickstart Tutorials.'},
{type: 'link', label: 'Samples', href: 'https://github.com/spiceai/samples', description: 'Dive deeper with in-depth samples.'},]} />
