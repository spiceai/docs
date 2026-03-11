---
title: 'Cayenne Catalog Connector'
sidebar_label: 'Cayenne'
description: 'Connect to a Cayenne catalog for high-performance data acceleration.'
sidebar_position: 12
pagination_prev: null
pagination_next: null
tags:
  - catalogs
  - cayenne
  - data-connectors
---

Connect to a [Spice Cayenne](https://github.com/spiceai/spiceai) lakehouse catalog for high-performance local data storage. Spice Cayenne is an accelerated lakehouse format that combines SQLite for transactional metadata management with Vortex columnar files for data storage, providing fast analytical queries on locally stored data.

## Configuration

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
    params:
      cayenne_data_dir: /path/to/data # Optional. Directory for table data files.
      cayenne_metadata_dir: /path/to/metadata # Optional. Directory for SQLite metadata.
```

## `from`

The `from` field specifies the catalog provider. For Cayenne, use `cayenne`.

## `name`

The `name` field specifies the name of the catalog in Spice. Tables from the Cayenne catalog will be available under this catalog name.

## `include` (Optional)

Use the `include` field to specify which tables to include from the catalog. The `include` field supports glob patterns to match multiple tables. For example, `*.my_table_name` would include all tables with the name `my_table_name` from any schema. Multiple `include` patterns are OR'ed together.

## `params`

| Parameter Name                | Description                                           | Default              |
| ----------------------------- | ----------------------------------------------------- | -------------------- |
| `cayenne_data_dir`            | Local directory for table data files (Vortex format). | Spice data directory |
| `cayenne_metadata_dir`        | Local directory for Cayenne SQLite metadata.          | Spice data directory |
| `cayenne_target_file_size_mb` | Target Vortex file size in MB.                        | `128`                |

## Examples

### Default configuration

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
```

### Custom storage directories

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
    params:
      cayenne_data_dir: /data/cayenne/tables
      cayenne_metadata_dir: /data/cayenne/metadata
```

### Tuned for large datasets

```yaml
catalogs:
  - from: cayenne
    name: cayenne_catalog
    params:
      cayenne_target_file_size_mb: '256'
```
