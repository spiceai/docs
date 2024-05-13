---
title: 'Local Acceleration'
sidebar_label: 'Local Acceleration'
description: 'Learn how to use local acceleration in Spice.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Datasets can be locally accelerated by the Spice runtime, pulling data from any [Data Connector](/data-connectors) and storing it locally in a [Data Accelerator](/data-accelerators) for faster access. Additionally, the data is kept up to date in realtime, so you always have the latest data locally for querying.

## Benefits

When a dataset is locally accelerated by the Spice runtime, the data is stored alongside your application, providing much faster query times by cutting out network latency to make the request. This benefit is accentuated when the result of a query is large because the data does not need to be transferred over the network. Depending on the [Acceleration Engine](/data-accelerators) chosen, the locally accelerated data can also be stored in-memory, further reducing query times.

## Example Use Case

Consider a high volume e-trading frontend application backed by an AWS RDS database containing a table of trades. In order to retrieve all trades over the last 24 hours, the application would need to query the remote database for all trades in the last 24 hours and then transfer the data over the network. By accelerating the trades table locally using the [AWS RDS Data Connector](https://github.com/spiceai/quickstarts/tree/trunk/rds-aurora-mysql), we can bring the data to the application, saving the round trip time to the database and the time to transfer the data over the network.

## Considerations

Data Storage: Ensure that the local storage has enough capacity to store the accelerated data. The amount and type (i.e. Disk or RAM) of storage required will depend on the size of the dataset and the acceleration engine used.

Data Security: Assess data sensitivity and secure network connections between edge and data connector when replicating data for further usage. Assess the security of any Data Accelerator that is external to the Spice runtime and connected to the Spice runtime. Implement encryption, access controls, and secure protocols.

## Refresh Modes

Dataset acceleration can be configured in `full` (the entire dataset is refreshed) or `append` (new data from a dataset source is appended) modes.

## Refresh Interval

For accelerated datasets in `full` mode, the [`refresh_check_interval`](/reference/spicepod/datasets#accelerationrefresh_check_interval) parameter controls how often the accelerated dataset is refreshed.

Accelerated datasets can also be refreshed on-demand via the `refresh` CLI command or `POST /v1/datasets/:name/acceleration/refresh` API endpoint.

An example using cURL:

```bash
curl -i -XPOST 127.0.0.1:3000/v1/datasets/eth_recent_blocks/refresh
```

And response

```bash
HTTP/1.1 201 Created
content-type: application/json
content-length: 55
date: Thu, 11 Apr 2024 20:11:18 GMT

{"message":"Dataset refresh triggered for eth_recent_blocks."}
```

## Retention Policy

A retention policy automatically removes data from accelerated datasets with a temporal column that exceeds the defined retention period, optimizing resource utilization.

The policy is set using the [`acceleration.retention_check_enabled`](/reference/spicepod/datasets#accelerationretention_check_enabled), [`acceleration.retention_period`](/reference/spicepod/datasets#accelerationretention_period) and [`acceleration.retention_check_interval`](/reference/spicepod/datasets#accelerationretention_check_interval) parameters, along with the [`time_column`](/reference/spicepod/datasets#time_column) and [`time_format`](/reference/spicepod/datasets#time_format) dataset parameters.


## Example

### Locally Accelerating eth.recent_blocks

- Start Spice with the following dataset:
```yaml
datasets:
  - from: spice.ai/eth.recent_blocks
    name: eth_recent_blocks
    acceleration:
      enabled: true
      refresh_mode: full
      refresh_check_interval: 10s
```

- The dataset `eth.recent_blocks` will be accelerated locally by the Spice runtime. The data will be refreshed every 10 seconds.

- Compare query times against the Spice platform:

```bash
curl \
--url 'https://data.spiceai.io/v1/sql?api_key=[API_KEY]' \
--data 'select * from eth.recent_blocks'
```

And the locally accelerated dataset:

```bash
spice sql
select * from eth_recent_blocks
```

## Limitations

- Currently, only official [Data Accelerators](../data-accelerators) are supported for local acceleration.
