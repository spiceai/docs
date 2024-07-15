---
title: 'Spice.ai Catalog Connector'
sidebar_label: 'Spice.ai'
description: 'Connect to the Spice.ai built-in catalog.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Query all of the datasets provided by the [Spice.ai Platform](https://spice.ai).

## Configuration

Create an account on the [Spice.ai Platform](https://spice.ai) and login with the CLI using `spice login`.

Example:
```yaml
catalogs:
  - from: spiceai
    name: spicey # tables from the Spice.ai platform will be available in the "spicey" schema in Spice
    include:
      - "tpch.*" # include only the tables from the "tpch" schema
```

## `from`
The `from` field is used to specify the catalog provider. For the Spice.ai catalog connector, use `spiceai`.

## `name`
The `name` field is used to specify the name of the catalog in Spice. Tables from the Spice.ai built-in catalog will be available in the schema with this name in Spice.

## `include`
Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.
