---
title: 'Catalog Connectors'
sidebar_label: 'Catalog Connectors'
description: ''
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

In data systems, data is organized hierarchically with catalogs, schemas, and tables. A catalog, at the top level, contains multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored.

Catalog Connectors can auto-populate schemas and tables within Spice from external catalog services. The tables can then be queried using federated SQL queries.

Currently supported Catalog Connectors include:

| Name            | Description | Status | Protocol/Format                     | 
| --------------- | ----------- | ------ | ----------------------------------- |
| `databricks`    | Databricks  | Alpha  | Spark Connect <br/> S3 / Delta Lake | 
| `unity_catalog`    | Unity Catalog  | Alpha  | Delta Lake                          | 
| `spiceai`       | Spice.ai    | Alpha  | Arrow Flight                        |

## Catalog Connector Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
