---
title: 'Data Acceleration'
sidebar_label: 'Data Acceleration'
description: 'Learn how to use local data acceleration in Spice.'
sidebar_position: 2
pagination_prev: null
---

Datasets can be locally accelerated by the Spice runtime, pulling data from any [Data Connector](/components/data-connectors) and storing it locally in a [Data Accelerator](/components/data-accelerators) for faster access. The data can be kept up-to-date in real-time or on a refresh schedule, ensuring you always have the latest data locally for querying.

## Benefits

Local data acceleration stores data alongside your application, providing faster query times by eliminating network latency. This is especially beneficial for large query results, as data transfer over the network is avoided. Depending on the [Acceleration Engine](/components/data-accelerators) used, data can also be stored in-memory, further reducing query times. [Indexes](./indexes.md) can be applied to speed up certain queries.

Locally accelerated datasets can also have [primary key constraints](./constraints.md) applied. This feature allows specifying actions when a constraint is violated, such as dropping the violating row or upserting it into the accelerated table.

## Example Use Case

Consider a high-volume e-trading frontend application backed by an AWS RDS database containing a table of trades. To retrieve all trades over the last 24 hours, the application would need to query the remote database and transfer the data over the network. By accelerating the trades table locally using the [AWS RDS Data Connector](https://github.com/spiceai/quickstarts/tree/trunk/rds-aurora-mysql), the data is brought to the application, saving round trip time and data transfer time.

## Considerations

Data Storage: Ensure local storage has enough capacity for the accelerated data. The required storage type (Disk or RAM) and amount depend on the dataset size and the acceleration engine used.

Data Security: Assess data sensitivity and secure network connections between the edge and data connector when replicating data. Secure any external Data Accelerator connected to the Spice runtime with encryption, access controls, and secure protocols.

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

[Learn more about Data Accelerators](/components/data-accelerators) for faster access.
