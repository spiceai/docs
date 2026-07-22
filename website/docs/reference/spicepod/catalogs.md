---
title: 'Catalogs'
sidebar_label: 'Catalogs'
description: 'Catalogs YAML reference'
---

The `catalogs` section of a Spicepod defines connections to external data catalogs, such as Databricks Unity Catalog or Spice.ai Cloud. Catalogs expose multiple schemas and tables through a single configuration, making it easier to work with large numbers of datasets.

# `catalogs`

Example:

`spicepod.yaml`

```yaml
catalogs:
  - from: spice.ai
    name: spiceai
    include:
      - 'tpch.*' # Include only the "tpch" tables.
```

## `from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the catalog provider. This URI is composed of two parts: a prefix indicating the Catalog Connector to use, and the catalog path within the source.

The syntax for the `from` field is as follows:

```yaml
from: <catalog_connector>:<path>
```

Where:

- `<catalog_connector>`: The Catalog Connector to use to connect to the dataset

  Currently supported catalog connectors:
  - [`spice.ai`](../../components/catalogs/spiceai)
  - [`databricks`](../../components/catalogs/databricks)
  - [`unity_catalog`](../../components/catalogs/unity-catalog)

  If the Data Connector is not explicitly specified, it defaults to `spiceai`.

- `<path>`: The path to the catalog within the provider.

## `ref`

An alternative to adding the catalog definition inline in the `spicepod.yaml` file. `ref` can be use to point to a directory with a catalog defined in a `catalog.yaml` file. For example, a catalog configured in a catalog.yaml in the "catalogs/sample" directory can be referenced with the following:

**catalogs/sample/catalog.yaml**

```yaml
from: spice.ai
name: spiceai
include:
  - 'tpch.*' # Include only the "tpch" tables.
```

**ref used in spicepod.yaml**

```yaml
version: v1
kind: Spicepod
name: duckdb
catalogs:
  - ref: catalogs/sample
```

## `name`

The name of the catalog to register in Spice. The schema hierarchy of the external catalog is preserved in Spice. It doesn't need to match the name of the catalog in the external provider.

## `include`

Optional. The `include` field is used to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` in the catalog from any schema. Multiple `include` patterns are OR'ed together and can be specified to include multiple tables.

## `exclude`

Optional. The `exclude` field specifies tables to omit from the catalog, using the same `schema.table` glob syntax as `include`. Multiple `exclude` patterns are OR'ed together, and `exclude` takes precedence over `include` — a table matched by both is omitted. It is currently honored by the [PostgreSQL catalog connector](../../components/catalogs/postgres). A common use is to keep tables that cannot be [CDC-accelerated](../../components/catalogs/postgres#catalog-level-cdc-acceleration) out of an accelerated catalog's scope.

## `access`

Optional. Specifies the access level for the catalog. Supported values are:

- `read` (default): Read-only access.
- `read_write`: Enables both read and write operations. Only supported for [write-capable catalogs](../../tags/write).

## `params`

Optional. Parameters to pass to the catalog connector for retrieving the metadata on the schemas and tables to be included. The parameters are specific to the connector used.

## `dataset_params`

Optional. Parameters used when constructing the individual datasets that are registered in Spice from the catalog. The parameters are specific to the connector used.

## `acceleration`

Optional. Bootstraps and accelerates every table discovered by the catalog (subject to `include`/`exclude`), with no per-table configuration. Currently supported for the [PostgreSQL catalog connector](../../components/catalogs/postgres#catalog-level-cdc-acceleration) only.

```yaml
catalogs:
  - from: pg
    name: my_pg
    acceleration:
      engine: cayenne # optional; cayenne is the only supported engine
      refresh_mode: changes # required
```

- `engine`: Optional. The accelerator engine used for every table. Defaults to `cayenne`, currently the only supported value.
- `refresh_mode`: Required. The only supported value is `changes` (CDC); there is no catalog-level `full` mode.

Per-table-only acceleration settings (`primary_key`, `on_conflict`, `indexes`, and other per-dataset overrides) are not configurable at the catalog level — they remain on an individual [dataset's `acceleration` block](../../components/data-accelerators).
