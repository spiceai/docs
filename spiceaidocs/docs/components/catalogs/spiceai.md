---
title: 'Spice.ai Catalog Connector'
sidebar_label: 'Spice.ai'
description: 'Connect to the Spice.ai built-in catalog.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Query datasets hosted in the [Spice.ai Cloud Platform](https://spice.ai). Discover available public datasets in the [Spicerack](https://spicerack.org).

## Configuration

Create a [Spice.ai Cloud Platform](https://spice.ai) account and login with the CLI using `spice login`.

Example:

```yaml
catalogs:
  - from: spice.ai:demo-org/tpch # Load tables from the `demo-org` organization's `tpch` app
    name: marketplace # Tables will be available in the "marketplace" catalog
    include:
      - "tpch.part*" # include only the tables from the "tpch" schema and that start with "part"
      - "tpch.supplier" # also include the "supplier" table
```

## `from`

The `from` field specifies which organization and application to load tables from. The format is:

```shell
spice.ai/[organization]/[application][/catalog_name]
```

- `organization`: The Spice.ai organization that owns the application
- `application`: The specific application to load tables from
- `catalog_name`: (optional): A specific catalog within the application. If not specified, the application's default catalog is used

For example:

- `spice.ai/demo-org/tpch` - Load the default catalog from the "tpch" application in the "demo-org" organization
- `spice.ai/demo-org/tpch/custom_catalog` - Load a specific catalog named "custom_catalog" from the application

## `name`

The name field defines what catalog name the tables will be available under in the local Spice instance. For example, with the following configuration:

```yaml
from: spice.ai/demo-org/tpch
name: marketplace
```

Then tables that exist in the remote application as:

```shell
spice # Default catalog
  |- schema1
     |- table1
     |- table2
```

Will be available locally as:

```shell
marketplace
  |- schema1
     |- table1
     |- table2
```

Queries are run against the `marketplace` catalog, like `SELECT * FROM marketplace.schema1.table1`.

## `include`

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables:

- `schema_name.*` - Include all tables from a specific schema
- `*.table_name` - Include all tables with a specific name from any schema
- `schema_name.table_name` - Include a specific table from a schema
- `schema_name.table_prefix*` - Include all tables in a schema that start with a prefix

Multiple include patterns can be specified and are OR'ed together. For example:

```yaml
include:
  - "tpch.part*" # Include all tables from the "tpch" schema that start with "part"
  - "tpch.supplier" # Include the "supplier" table from the "tpch" schema
```
