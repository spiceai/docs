---
title: 'File Data Connector'
sidebar_label: 'File Data Connector'
description: 'File Data Connector Documentation'
---

The File Data Connector enables federated SQL queries on files stored by locally accessible filesystems. It supports querying individual files or entire directories, where all child files within the directory will be loaded and queried.

```yaml
datasets:
  - from: file://path/to/customer.parquet
    name: customer
    params:
      file_format: parquet
```

## Configuration

### `from`

The `from` field for the File connector takes the form `file://path` where `path` is the path to the file to read from. See the [examples](#examples) below for examples of relative and absolute paths

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: file://path/to/customer.parquet
    name: cool_dataset
    params:
      ...
```

```sql
SELECT COUNT(*) FROM cool_dataset;
```

```shell
+----------+
| count(*) |
+----------+
| 6001215  |
+----------+
```

### `params`

The only `params` available for the `file` connector are related to the file type that you're reading. The supported parameters are described in [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats). 

## Examples

### Absolute path

In this example, `path` is an absolute path to the file on the filesystem.

```yaml
datasets:
  - from: file://path/to/customer.parquet
    name: customer
    params:
      file_format: parquet
```

### Relative path

In this example, the path is relative to the directory where your `spicepod.yaml` is located.

```bash
├── foo
│   └── yellow_tripdata_2024-01.parquet
└── spicepod.yaml
```

```yaml
datasets:
  - from: file:foo/yellow_tripdata_2024-01.parquet
    name: trip_data
    params:
      file_format: parquet
```

## Trigger data refresh on file change

In addition to standard [Data Refresh](/components/data-accelerators/data-refresh), a data refresh can also be triggered when the source file is modified. The File Data Connector uses a file system watcher to be notified the file has changed. The file watcher is disabled by default and can be enabled by setting the `file_watcher` parameter to `enabled` in the acceleration parameters.

```yaml
datasets:
  - from: file://path/to/my_file.csv
    name: my_file
    acceleration:
      enabled: true
      refresh_mode: full
      params:
        file_watcher: enabled
```

When the file is modified, the acceleration will be refreshed and will include the latest data.