---
type: docs
title: 'SQLite Data Accelerator'
linkTitle: 'SQLite Data Accelerator'
description: 'SQLite Data Accelerator Documentation'
---

To use SQLite as Data Accelerator, specify `sqlite` as the `engine` for acceleration.

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
```

## Configuration
The connection to SQLite can be configured by providing the following `params`: 
- `sqlite_file`: The filename for the file to back the SQLite database. Only applies if `mode` is `file`.

Configuration `params` are provided either in the `acceleration` section for a data store. Other common `acceleration` fields can be configured for sqllite, see see [datasets]({{<ref "reference/spicepod/datasets">}}).

```yaml
datasets:
  - from: spiceai:path.to.my_dataset
    name: my_dataset
    acceleration:
      engine: sqlite
      params:
        sqlite_file: /my/chosen/location/sqllite.db
```