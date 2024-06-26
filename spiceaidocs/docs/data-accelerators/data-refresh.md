---
title: 'Data Refresh'
sidebar_label: 'Data Refresh'
description: 'Data refresh for accelerated datasets'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

## Refresh Modes

Spice supports three modes to refresh/update local data from a connected data source. `full` is the default mode.

| Mode      | Description                                          | Example                                                             |
| --------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| `full`    | Replace/overwrite the entire dataset on each refresh | A table of mutable users                                            |
| `append`  | Append/add data to the dataset on each refresh       | Append-only immutable datasets, like time-series or blockchain data |
| `changes` | \*Coming soon. Apply incremental changes             | Any mutable or immutable dataset                                    |

E.g.

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      refresh_mode: full
      refresh_check_interval: 10m
```

If the dataset definition includes a `time_column` and the refresh mode is `append`, data will be refreshed for data where the `time_column` value in the remote source is greater-than (gt) the `max(time_column)` value in the local acceleration.

E.g.

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    time_column: timestamp
    acceleration:
      refresh_mode: append # In conjuction with time_column, only fetch data greater than the latest local timestamp
      refresh_check_interval: 10m
```

## Filtered Refresh

Typically only a working subset of an entire dataset is used in an application or dashboard. Use these features to filter refresh data, creating a smaller subset for faster processing and to reduce the data transferred and stored locally.

- [Refresh SQL](#refresh-sql) - Specify the filter as arbitrary SQL to be pushed down to the remote source.
- [Refresh Data Window](#refresh-data-window) - Filters data from the remote source outside the specified time window.

### Refresh SQL

Specify filters for data accelerated from the connected source using arbitrary SQL. Supported for `full` and `append` refresh modes.

Filters will be pushed down to the remote source, and only the requested data will be transferred over the network.

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10m
      refresh_sql: |
        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'
```

The `refresh_sql` parameter can be updated at runtime on-demand using `PATCH /v1/datasets/:name/acceleration`. This change is temporary and will revert at the next runtime restart.

Example:

```bash
curl -i -X PATCH \
     -H "Content-Type: application/json" \
     -d '{
           "refresh_sql": "SELECT * FROM accelerated_dataset WHERE city = 'Bellevue'"
         }' \
     127.0.0.1:3000/v1/datasets/accelerated_dataset/acceleration
```

For the complete reference, view the `refresh_sql` section of [datasets](../reference/spicepod/datasets.md#accelerationrefresh_sql).

:::warning[Limitations]

- The refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Selecting a subset of columns isn't supported - the refresh SQL needs to start with `SELECT * FROM {name}`.
- Queries for data that have been filtered out will not fall back to querying against the federated table.
- Refresh SQL modifications made via API are temporary and will revert after a runtime restart.

:::

### Refresh Data Window

Filters data from the federated source outside than the specified window. The only supported window is a lookback starting from `now() - refresh_data_window` to `now()`. This flag is only supported for datasets configured with a `full` refresh mode (the default).

Used in combination with the [`time_column`](../reference/spicepod/datasets.md#time_column) to identify the column that contains the timestamps to filter on. The [`time_format`](../reference/spicepod/datasets.md#time_format) column (optional) can be used to instruct the Spice runtime how to interpret the timestamps in the `time_column`.

Can also be combined with `refresh_sql` to further filter the data based on the temporal dimension.

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    time_column: created_at
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10m
      refresh_sql: |
        SELECT * FROM accelerated_dataset WHERE city = 'Seattle'
      refresh_data_window: 1d
```

This configuration will only accelerate data from the federated source that matches the filter `city = 'Seattle'` and is less than 1 day old.

## Behavior on Zero Results

By default, accelerated datasets will only return results that have been accelerated locally. If the locally accelerated data is a subset of the full dataset in the federated source, i.e. through setting `refresh_sql`, `refresh_data_window` or configuring retention policies, queries against the accelerated dataset may return zero results, where the federated table would return results.

Control this behavior by setting `on_zero_results` in the acceleration configuration.

`on_zero_results`:

- `return_empty` (Default) - Return an empty result set when no data is found in the accelerated dataset.
- `use_source` - Fall back to querying the federated table when no data is found in the accelerated dataset.

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      enabled: true
      refresh_sql: SELECT * FROM accelerated_dataset where city = 'Seattle'
      on_zero_results: use_source
```

In this example a query against `accelerated_dataset` within Spice like `SELECT * FROM accelerated_dataset WHERE city = 'Portland'` would initially query against the accelerated data, see that it returns zero results and then fallback to querying against the federated table in Databricks.

:::warning
It is possible that even though the accelerated table returns some results, it may not contain all the data that would be returned by the federated table. `on_zero_results` only controls the behavior in the simple case where no data is returned by the acceleration for a given query.
:::

## Refresh Interval

For accelerated datasets in `full` mode, the [`refresh_check_interval`](/reference/spicepod/datasets#accelerationrefresh_check_interval) parameter controls how often the accelerated dataset is refreshed.

Example:

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_recent_blocks
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10s
```

This configuration will refresh `eth.recent_blocks` data every 10 seconds.

## Refresh On-Demand

Accelerated datasets can be refreshed on-demand via the `refresh` CLI command or `POST /v1/datasets/:name/acceleration/refresh` API endpoint.

CLI example:

```bash
spice refresh eth_recent_blocks
```

API example using cURL:

```bash
curl -i -XPOST 127.0.0.1:3000/v1/datasets/eth_recent_blocks/refresh
```

with response:

```bash
HTTP/1.1 201 Created
content-type: application/json
content-length: 55
date: Thu, 11 Apr 2024 20:11:18 GMT

{"message":"Dataset refresh triggered for eth_recent_blocks."}
```

:::warning[Note]
On-demand refresh always initiates a new refresh, terminating any in-progress refresh for the dataset.
:::

## Refresh Retries

By default, accelerated datasets attempt to retry data refreshes on transient errors (connectivity issues, compute warehouse goes idle, etc.) using [Fibonacci](https://en.wikipedia.org/wiki/Fibonacci_sequence) backoff strategy. This behavior can be adjusted with the [`acceleration.refresh_retry_enabled`](/reference/spicepod/datasets#accelerationrefresh_retry_enabled) and [`acceleration.rrefresh_retry_max_attempts`](/reference/spicepod/datasets#accelerationrefresh_retry_max_attempts) parameters.

Example: Disable rertries

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_recent_blocks
    acceleration:
      refresh_retry_enabled: false
      refresh_check_interval: 30s
```

Example: Limit retries to a maximum of 10 attempts

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_recent_blocks
    acceleration:
      refresh_retry_max_attempts: 10
      refresh_check_interval: 30s
```

## Retention Policy

A retention policy automatically removes data from accelerated datasets with a temporal column that exceeds the defined retention period, optimizing resource utilization.

The policy is set using the [`acceleration.retention_check_enabled`](/reference/spicepod/datasets#accelerationretention_check_enabled), [`acceleration.retention_period`](/reference/spicepod/datasets#accelerationretention_period) and [`acceleration.retention_check_interval`](/reference/spicepod/datasets#accelerationretention_check_interval) parameters, along with the [`time_column`](/reference/spicepod/datasets#time_column) and [`time_format`](/reference/spicepod/datasets#time_format) dataset parameters.
