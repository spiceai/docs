---
title: 'Spice.ai Data Connector'
sidebar_label: 'Spice.ai Data Connector'
description: 'Spice.ai Data Connector Documentation'
---

The [Spice.ai](https://spice.ai/) Data Connector enables federated SQL query across datasets in the [Spice.ai Cloud Platform](https://docs.spice.ai/building-blocks/datasets).  Access to these datasets require a free [Spice.ai account](https://spice.ai/login).

## Configuration
### Secrets
Secrets will be automatically conifgured by using the `spice login` command and loggin in with an active Spice AI account.

- `key`: A Spice.ai API key.
- `token`: An active personal access token that is configured when logging in to spice via `spice login` 


### Parameters
- `from`: The Spice.ai dataset ID.  For instance `spice.ai/eth.recent_blocks` or `spice.ai/eth.recent_traces`

## Example

```yaml
- from: spice.ai/eth.recent_blocks
  name: eth_recent_blocks
```

## Full Configuration Example
```yaml
- from: spice.ai/eth.recent_blocks
  name: eth_recent_blocks
  acceleration:
    enabled: true
    refresh_mode: append
```

## Limitations
`refresh_mode: append` is supported for the following datasets: 
* eth.recent_blocks
* eth.recent_transactions
* eth.recent_traces

All other datasets need to be configured with `refresh_mode: full`.