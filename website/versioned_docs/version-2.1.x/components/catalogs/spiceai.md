---
title: 'Spice.ai Catalog Connector'
sidebar_label: 'Spice.ai'
description: 'Connect to the Spice.ai built-in catalog.'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Query datasets hosted in the [Spice.ai Cloud Platform](https://spice.ai). Discover available public datasets on [Spicerack](https://spicerack.org).

## Configuration

Create a [Spice.ai Cloud Platform](https://spice.ai) account and login with the CLI using `spice login`.

Example:

```yaml
catalogs:
  - from: spice.ai:demo-org/tpch # Load tables from the `demo-org` organization's `tpch` app
    name: marketplace # Tables will be available in the "marketplace" catalog
    params:
      spiceai_api_key: ${secrets:SPICEAI_API_KEY} # Spice.ai API key
      spiceai_region: us-east-1 # Required: Spice Cloud region
    include:
      - "tpch.part*" # include only the tables from the "tpch" schema and that start with "part"
      - "tpch.supplier" # also include the "supplier" table
```

This configuration would load the following tables:

```shell
sql> show tables;
+---------------+--------------+----------------+------------+
| table_catalog | table_schema | table_name     | table_type |
+---------------+--------------+----------------+------------+
| marketplace   | tpch         | part           | BASE TABLE |
| marketplace   | tpch         | partsupp       | BASE TABLE |
| marketplace   | tpch         | supplier       | BASE TABLE |
+---------------+--------------+----------------+------------+
```

## `from`

The `from` field specifies which organization and application to load tables from. The format is:

```shell
spice.ai/<organization>/<application>[/<catalog_name>]
```

- `organization`: The Spice.ai organization that owns the application.
- `application`: The specific application to load tables from.
- `catalog_name` (optional): A specific catalog within the application. Defaults to `spice` if not specified.

For example:

1. Load the default catalog from the "tpch" application in the "demo-org" organization

```yaml
catalogs:
  - from: spice.ai/demo-org/tpch
    name: marketplace
```

This will create tables like:

```shell
SHOW TABLES;
+---------------+--------------+----------------+------------+
| table_catalog | table_schema | table_name     | table_type |
+---------------+--------------+----------------+------------+
| marketplace   | tpch         | region         | BASE TABLE |
| marketplace   | tpch         | orders         | BASE TABLE |
| marketplace   | tpch         | part           | BASE TABLE |
| marketplace   | tpch         | supplier       | BASE TABLE |
| marketplace   | tpch         | customer       | BASE TABLE |
| marketplace   | tpch         | partsupp       | BASE TABLE |
| marketplace   | tpch         | lineitem       | BASE TABLE |
| marketplace   | tpch         | nation         | BASE TABLE |
+---------------+--------------+----------------+------------+
```

2. Load a specific catalog named "custom_catalog" from an application

```yaml
catalogs:
  - from: spice.ai/demo-org/tpch/custom_catalog
    name: marketplace
```

If the remote application has tables in `custom_catalog` like:

```shell
SHOW TABLES;
+------------------+--------------+----------------+------------+
| table_catalog    | table_schema | table_name     | table_type |
+------------------+--------------+----------------+------------+
| custom_catalog   | ice_schema1  | table1         | BASE TABLE |
| custom_catalog   | ice_schema1  | table2         | BASE TABLE |
| custom_catalog   | ice_schema2  | table1         | BASE TABLE |
+------------------+--------------+----------------+------------+
```

They will be available locally as:

```shell
SHOW TABLES;
+------------------+--------------+----------------+------------+
| table_catalog    | table_schema | table_name     | table_type |
+------------------+--------------+----------------+------------+
| marketplace      | ice_schema1  | table1         | BASE TABLE |
| marketplace      | ice_schema1  | table2         | BASE TABLE |
| marketplace      | ice_schema2  | table1         | BASE TABLE |
+------------------+--------------+----------------+------------+
```

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

## `params`

### Authentication

| Parameter Name | Description |
|---------------|------------|
| `spiceai_api_key` | API key from the Spice.ai Cloud Platform. Takes precedence over `spiceai_token`. |
| `spiceai_token` | Legacy alias for `spiceai_api_key`. Used only if `spiceai_api_key` is not set. |

### Region

| Parameter Name | Description |
|---------------|------------|
| `spiceai_region` | The Spice Cloud region to connect to (e.g. `us-east-1`). **Required** unless `spiceai_http_endpoint` is set. To list available regions, run `spice cloud regions`. |

### Endpoint Overrides

These parameters override the default endpoints derived from `spiceai_region`. They are typically only needed for development or custom deployments.

| Parameter Name | Description |
|---------------|------------|
| `spiceai_http_endpoint` | Custom HTTP endpoint for the Spice Cloud catalog API (Iceberg REST catalog compatible). If set, `spiceai_region` is not required and region validation is skipped. |
| `spiceai_endpoint` | Custom Arrow Flight endpoint for query execution. Takes precedence over `spiceai_flight_endpoint`. |
| `spiceai_flight_endpoint` | Legacy alias for `spiceai_endpoint`. Used only if `spiceai_endpoint` is not set. |

## Cookbook

- A cookbook recipe to configure Spice Cloud as a catalog connector in Spice. [Spice Cloud Catalog Connector](https://github.com/spiceai/cookbook/tree/trunk/catalogs/spiceai#readme)
