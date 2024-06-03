---
title: 'MotherDuck Data Connector'
sidebar_label: 'MotherDuck Data Connector'
description: 'MotherDuck Data Connector Documentation'
pagination_prev: null
---
## Dataset Source

To connect to a [MotherDuck](https://motherduck.com/) as a data source, specify `motherduck` as the selector in the `from` value for the dataset.

```yaml
- from: motherduck:database.schema.table
  name: my_table
  params: 
    motherduck_token: <token>
```

## Configuration

The MotherDuck data connector requires `motherduck_token` to be specified via the params section. Use [MotherDuck Instructions](https://motherduck.com/docs/authenticating-to-motherduck/) to fetch your token.

A full example configuration for the sample MotherDuck dataset `sample_data.nyc.rideshare` is below:

```yaml
datasets:
  - from: duckdb:sample_data.nyc.rideshare
    name: nyc_rideshare
    params:
      motherduck_token: your-motherduck-token
```