---
type: docs
title: 'Databricks Data Connector'
linkTitle: 'Databricks Data Connector'
description: 'Databricks Data Connector Documentation'
---

Databricks as a connector for federated SQL query against Databrick's [Delta Lake](https://docs.databricks.com/en/delta/index.html). 

## Configuration
### Secrets
- `token`: An active personal access token for the Databricks instance (equivalent to `DATABRICKS_TOKEN`). 
- Other keys provided in the secret are directly passed to the underlying object store (e.g. `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if backed by AWS S3).

`spice login databricks` can be used to configure secrets for the Spice runtime (including AWS object store keys). 

### Parameters
- `endpoint`: The HTTPS endpoint of the Databricks host storing the desired tables.

## Example

```yaml
datasets:
  - from: databricks.com/spiceai/datasets
    name: my_delta_lake_table
  params:
    endpoint: "https://dbc-a1b2345c-d6e7.cloud.databricks.com"
```