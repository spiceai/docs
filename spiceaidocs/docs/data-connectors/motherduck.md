---
title: 'MotherDuck Data Connector'
sidebar_label: 'MotherDuck Data Connector'
description: 'MotherDuck Data Connector Documentation'
pagination_prev: null
---
To connect to [MotherDuck](https://motherduck.com/) as a data source, use the `motherduck:` prefix in `from`.

Example:

```yaml
- from: motherduck:database.schema.table
  name: my_table
  params: 
    motherduck_token: <token>
```

See [Authenticating to MotherDuck](https://motherduck.com/docs/authenticating-to-motherduck/) to get `motherduck_token`.