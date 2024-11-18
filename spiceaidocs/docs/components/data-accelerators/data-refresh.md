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

| Mode      | Description                                          | Example                                                          |
| --------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| `full`    | Replace/overwrite the entire dataset on each refresh | A table of users                                                 |
| `append`  | Append/add data to the dataset on each refresh       | Append-only, immutable datasets, such as time-series or log data |
| `changes` | Apply incremental changes                            | Customer order lifecycle table                                   |

Example:

```yaml
datasets:
  - from: databricks:my_dataset
    name: accelerated_dataset
    acceleration:
      refresh_mode: full
      refresh_check_interval: 10m
```

### Append

If the dataset definition includes a `time_column` and the refresh mode is `append`, data will be incrementally refreshed for data where the `time_column` value in the remote source is greater-than (gt) the `max(time_column)` value in the local acceleration.

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

When using `mode: append`, if late arriving data or clock-skew needs to be accounted for, an optional overlap can also be specified. See [`acceleration.refresh_append_overlap`](/reference/spicepod/datasets#accelerationrefresh_append_overlap).

### Changes (CDC)

Datasets configured with acceleration `refresh_mode: changes` require a [Change Data Capture (CDC)](/features/cdc/index.md) supported data connector. Initial CDC support in Spice is supported by the [Debezium data connector](/components/data-connectors/debezium.md).

## Ready State

By default, Spice will return an error for queries against an accelerated dataset that is still loading its initial data. The endpoint [`/v1/ready`](/api/http/ready) is used in production deployments to control when queries are sent to the Spice runtime.

The ready state for an accelerated dataset can be configured using the [`ready_state`](/reference/spicepod/datasets#ready_state) parameter in the dataset configuration.

- `ready_state: on_load`: Default. The dataset is considered ready after the initial load of the accelerated data. For file-based accelerated datasets that have existing data, this will be ready immediately. Queries against this dataset before the data is loaded will return an error.
- `ready_state: on_registration`: The dataset is considered ready when the dataset is registered in Spice, even before the initial data is loaded. Queries against this dataset before the data is loaded will automatically fallback to the federated source. Once the data is loaded, queries will be served from the acceleration.

Example:

```yaml
datasets:
  - from: s3://my_bucket/my_dataset
    name: my_dataset
    ready_state: on_load # or on_registration
    acceleration:
      enabled: true
```

## Filtered Refresh

Typically only a working subset of an entire dataset is used in an application or dashboard. Use these features to filter refresh data, creating a smaller subset for faster processing and to reduce the data transferred and stored locally.

- [Refresh SQL](#refresh-sql) - Specify the filter as arbitrary SQL to be pushed down to the remote source.
- [Refresh Data Window](#refresh-data-window) - Filters data from the remote source outside the specified time window.

### Refresh SQL

Specify filters for data accelerated from the connected source using arbitrary SQL. Supported for `full` and `append` refresh modes.

Filters will be pushed down to the remote source when possible, so only the requested data will be transferred over the network.

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

The `refresh_sql` parameter can be updated at runtime on-demand using `PATCH /v1/datasets/:name/acceleration`. This change is temporary and will revert to the `spicepod.yml` definition at the next runtime restart.

Example:

```bash
curl -i -X PATCH \
     -H "Content-Type: application/json" \
     -d '{
           "refresh_sql": "SELECT * FROM accelerated_dataset WHERE city = 'Bellevue'"
         }' \
     127.0.0.1:8090/v1/datasets/accelerated_dataset/acceleration
```

For the complete reference, view the `refresh_sql` section of [datasets](/reference/spicepod/datasets.md#accelerationrefresh_sql).

:::warning[Limitations]

- Refresh SQL only supports filtering data from the current dataset - joining across other datasets is not supported.
- Selecting a subset of columns isn't supported - the refresh SQL needs to start with `SELECT * FROM {name}`.
- Queries for data that have been filtered out will not fallback to querying the federated table.
- Refresh SQL modifications made via API are temporary and will revert after a runtime restart.

:::

### Refresh Data Window

Filters data from the federated source that falls outside the specified time window. The only supported window is a lookback period starting from `now() - refresh_data_window` to `now()`. This flag is supported datasets configured with the default `full` refresh mode.

This filter works with the `time_column` to identify the column containing timestamps for filtering. Optionally, the `time_format` can be specified to instruct the Spice runtime on how to interpret timestamps in the `time_column`.

It can also be used alongside `refresh_sql` to apply additional filtering based on time-related criteria.

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

By default, accelerated datasets only return locally materialized data. If this local data is a subset of the full dataset in the federated source—due to settings like `refresh_sql`, `refresh_data_window`, or retention policies—queries against the accelerated dataset may return zero results, even when the federated table would return results.

To address this, `on_zero_results: use_source` can be configured in the acceleration configuration. Queries returning zero results will fall back to the federated source, returning results from querying the underlying data.

The `on_zero_results: use_source` setting applies only to `full` and `append` refresh modes (not `changes).

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

On-demand refresh applies only to `full` and `append` refresh modes (not `changes).

CLI example:

```bash
spice refresh eth_recent_blocks
```

API example using cURL:

```bash
curl -i -XPOST 127.0.0.1:8090/v1/datasets/eth_recent_blocks/acceleration/refresh
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

By default, data refreshes for accelerated datasets are retried on transient errors (connectivity issues, compute warehouse goes idle, etc.) using [Fibonacci](https://en.wikipedia.org/wiki/Fibonacci_sequence) backoff strategy.

Retry behavior can be configured using the [`acceleration.refresh_retry_enabled`](/reference/spicepod/datasets#accelerationrefresh_retry_enabled) and [`acceleration.refresh_retry_max_attempts`](/reference/spicepod/datasets#accelerationrefresh_retry_max_attempts) parameters.

Data refresh retry applies to `full` and `append` refresh modes not `changes` which inherently supports data integrity and consistency through the CDC mechanism.

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

Accelerated datasets can be set to automatically evict time-series data exceeding a retention period by setting a retention policy based on the configured `time_column` and `acceleration.retention_period`.

Retention policies apply to `full` and `append` refresh modes (not `changes`).

The policy is set using the [`acceleration.retention_check_enabled`](/reference/spicepod/datasets#accelerationretention_check_enabled), [`acceleration.retention_period`](/reference/spicepod/datasets#accelerationretention_period) and [`acceleration.retention_check_interval`](/reference/spicepod/datasets#accelerationretention_check_interval) parameters, along with the [`time_column`](/reference/spicepod/datasets#time_column) and [`time_format`](/reference/spicepod/datasets#time_format) dataset parameters.

## Refresh Jitter

Accelerated datasets can include a random jitter in the refresh interval to prevent the [Thundering herd problem](https://en.wikipedia.org/wiki/Thundering_herd_problem), where multiple datasets refresh simultaneously. The jitter, ranging from `0` to `refresh_jitter_max`, is randomly added or subtracted from the refresh interval.

Refresh Jitter applies on the first dataset load, so on a restart of multiple similarily configured Spice instances at once, on restart they will load with jitter of 0 to `refresh_jitter_max`.

Example:

```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_recent_blocks
    acceleration:
      refresh_check_interval: 10s
      refresh_jitter_enabled: true
      refresh_jitter_max: 1s
```

In this example, the refresh interval will be between 9s and 11s.

Refresh jitter can be configured using the following parameters:

- [`refresh_jitter_enabled`](/reference/spicepod/datasets#accelerationrefresh_jitter_enabled)
- [`refresh_jitter_max`](/reference/spicepod/datasets#accelerationrefresh_jitter_max)
