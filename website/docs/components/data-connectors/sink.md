---
title: 'Sink Data Connector'
sidebar_label: 'Sink Data Connector'
description: 'Sink Data Connector Documentation'
pagination_prev: null
tags:
  - data-connectors
  - write
---

The Sink Data Connector defines a dataset that has no source of its own. Reading the source returns no rows, and data written to it is discarded, so the dataset's [acceleration](../../features/data-acceleration/index.md) holds all of its data. Spice uses it to store the OpenTelemetry metrics and logs it receives, as described in [OpenTelemetry Data Ingestion](../../features/data-ingestion/index.md#opentelemetry-data-ingestion).

```yaml
datasets:
  - from: sink:otel_metrics
    name: otel_metrics
    access: read_write
    params:
      otlp_metrics: all
    time_column: time_unix_nano
    time_format: unix_nanos
    acceleration:
      enabled: true
      engine: cayenne
      mode: file
      refresh_mode: append
      primary_key: (time_unix_nano, series_hash)
```

## Configuration

### `from`

`sink`, optionally followed by a name, such as `sink:otel_metrics`. A dataset with an empty `from` also uses this connector.

### `name`

The dataset name. This is used as the table name within Spice.

### `params`

| Parameter name | Description                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `otlp_metrics` | Optional. Set to `all` to store every metric received on the OTLP metrics endpoints in this dataset. See [Metrics store](../../features/data-ingestion/index.md#metrics-store). |
| `otlp_logs`    | Optional. Set to `all` to store every log record received on the OTLP logs endpoints in this dataset. Requires Cayenne acceleration. See [Logs](../../features/data-ingestion/index.md#logs). |

Both parameters accept only `all`, in any letter case. Any other value fails the dataset's load.

### `acceleration`

Enable acceleration for a `sink` dataset, except one with `otlp_logs: all`, which gets a default acceleration (below): the connector stores nothing, so without an acceleration, data written to the dataset is lost. Use `mode: file` to keep the data across restarts. A dataset with `otlp_logs: all` must use the `cayenne` engine.

When `acceleration.refresh_mode` is not set, it is `disabled`, because there is no source to refresh from.

A dataset with `otlp_logs: all` is the exception: Spice fills in its settings so that it needs only `from`, `name`, and the parameter. It sets `access: read_write` and, unless they are set, `time_column: timestamp` with `time_format: timestamptz`. With no `acceleration` block, it uses Cayenne with `mode: file` and `refresh_mode: append`; with a block, an unset `engine` is `cayenne` and an unset `refresh_mode` is `append`. See [Logs](../../features/data-ingestion/index.md#logs).

```yaml
datasets:
  - from: sink:otel_logs
    name: otel_logs
    params:
      otlp_logs: all
```
