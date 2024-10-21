---
title: 'Catalog Connectors'
sidebar_label: 'Catalog Connectors'
description: ''
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

In Spice, datasets are organized hierarchically with catalogs, schemas, and tables. A catalog, at the top level, contains multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored. By default a catalog named `spice` is created with all of the datasets defined in the `datasets` section of the Spicepod.

<img src="/img/catalog-schema-table.png" />

Creating schemas and tables within the `spice` catalog is configured by the `name` field in the dataset configuration. A name with a period (`.`) will create schema, i.e. a dataset defined with `name: foo.bar` would have a full path of `spice.foo.bar`. If the name does not contain a period, the dataset will be created in the `public` schema of the `spice` catalog. For example, a dataset defined with `name: foo` would have a full path of `spice.public.foo`. Attempting to create a dataset with a name that contains a catalog name will result in an error. Adding catalogs to Spice is done via Catalog Connectors.

Catalog Connectors connect to external catalog providers and make their tables available for federated SQL query in Spice. Configuring accelerations for tables in external catalogs is not supported. The schema hierarchy of the external catalog is preserved in Spice.

Currently supported Catalog Connectors include:

| Name            | Description | Status | Protocol/Format                     | 
| --------------- | ----------- | ------ | ----------------------------------- |
| `databricks`    | Databricks  | Alpha  | Spark Connect <br/> S3 / Delta Lake | 
| `unity_catalog`    | Unity Catalog  | Alpha  | Delta Lake                          | 
| `spice.ai`       | Spice.ai Cloud Platform    | Alpha  | Arrow Flight                        |

## Catalog Connector Docs

Catalog are configured using a Catalog Connector in the `catalogs` section of the Spicepod. See the specific Catalog Connector documentation for configuration details.

### `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

Example:

```yaml
catalogs:
  - from: spice.ai
    name: spiceai
    include:
      - "tpch.*" # Include only the "tpch" tables.
```

import DocCardList from '@theme/DocCardList';

<DocCardList />
