---
title: 'Local Acceleration'
sidebar_label: 'Local Acceleration'
description: 'Learn how to use local acceleration in Spice.'
sidebar_position: 3
pagination_prev: null
---

Datasets can be locally accelerated by the Spice runtime, pulling data from any [Data Connector](/data-connectors) and storing it locally in a [Data Accelerator](/data-accelerators) for faster access. Additionally, the data can be configured to be kept up-to-date in realtime or on a refresh schedule, so you always have the latest data locally for querying.

## Benefits

When a dataset is locally accelerated by the Spice runtime, the data is stored alongside your application, providing much faster query times by cutting out network latency to make the request. This benefit is accentuated when the result of a query is large because the data does not need to be transferred over the network. Depending on the [Acceleration Engine](/data-accelerators) chosen, the locally accelerated data can also be stored in-memory, further reducing query times. [Indexes](./indexes.md) can also be applied, further speeding up certain types of queries.

Locally accelerated datasets can also have [primary key constraints](./constraints.md) applied. This feature comes with the ability to specify what should happen when a constraint is violated, either drop the specific row that violates the constraint or upsert that row into the accelerated table.

## Example Use Case

Consider a high volume e-trading frontend application backed by an AWS RDS database containing a table of trades. In order to retrieve all trades over the last 24 hours, the application would need to query the remote database for all trades in the last 24 hours and then transfer the data over the network. By accelerating the trades table locally using the [AWS RDS Data Connector](https://github.com/spiceai/quickstarts/tree/trunk/rds-aurora-mysql), we can bring the data to the application, saving the round trip time to the database and the time to transfer the data over the network.

## Considerations

Data Storage: Ensure that the local storage has enough capacity to store the accelerated data. The amount and type (i.e. Disk or RAM) of storage required will depend on the size of the dataset and the acceleration engine used.

Data Security: Assess data sensitivity and secure network connections between edge and data connector when replicating data for further usage. Assess the security of any Data Accelerator that is external to the Spice runtime and connected to the Spice runtime. Implement encryption, access controls, and secure protocols.

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

[Learn more about Data Accelerators](/data-accelerators) for faster access.
