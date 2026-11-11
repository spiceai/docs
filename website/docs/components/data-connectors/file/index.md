---
title: 'File Data Connector'
sidebar_label: 'File Data Connector'
description: 'File Data Connector Documentation'
---

The File Data Connector enables federated SQL queries on files stored by locally accessible filesystems. It supports querying individual files or entire directories, where all child files within the directory will be loaded and queried.

File formats are specified using the `file_format` parameter, as described in [File Formats](./#file-formats).

Example `spicepod.yml`

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
    params: ...
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

The dataset name cannot be a [reserved keyword](../../reference/spicepod/keywords).

### `params`

| Parameter name              | Description                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file_format`               | Specifies the data file format. Required if the format cannot be inferred from the `from` path. Refer to [File Formats](./#file-formats) for details. |
| `hive_partitioning_enabled` | Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false`                                                      |
| `schema_source_path`        | Specifies the path used to infer the dataset schema. Default to the most recently modified file                                                       |

For additional CSV, JSON, and Parquet specific parameters, see [File Formats](../../reference/file_format).

## Trigger data refresh on file change

In addition to standard [Data Refresh](../../features/data-acceleration/data-refresh), a data refresh can also be triggered when the source file is modified. The File Data Connector uses a file system watcher to be notified the file has changed. The file watcher is disabled by default and can be enabled by setting the `file_watcher` parameter to `enabled` in the acceleration parameters.

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

For a single-file dataset, the watcher watches the file's parent directory and reacts only to events for that file name, so a file replaced atomically (written to a temporary file, then renamed over the original) still triggers a refresh, as do later writes to the replacement. For a directory dataset, it watches the directory recursively. Creating, modifying, or removing the file triggers a refresh; reading it does not.

The refresh starts 400 ms after the last change event. Each new event restarts the wait, so a truncate-then-write or a burst of appends is loaded as one change rather than as a partial file. Events that arrive while a refresh runs trigger one more refresh after it finishes.

Detecting an atomic replacement needs read permission on the parent directory. When the runtime cannot watch the directory, it logs a warning and watches the file only, which picks up in-place writes but not a replacement.

In v2.4.2 and earlier, the watcher watched only the file path, so on Linux, writes made after an atomic replacement could go undetected. It also refreshed on the first event and ignored events that arrived within 100 ms of the previous refresh, so the trailing write of a burst could be missed.

## Types

Refer to [Object Store Data Types](../../reference/datatypes/object_store) for data type mapping from object store files to arrow data type.

## Examples

### Absolute path

In this example, `path` is an absolute path to the file on the filesystem.

```yaml
datasets:
  - from: file:///path/to/customer.parquet
    name: customer
    params:
      file_format: parquet
```

### Relative path

In this example, the path is relative to the directory where the `spicepod.yaml` is located.

```bash
├── foo
│   └── yellow_tripdata_2024-01.parquet
└── spicepod.yaml
```

```yaml
datasets:
  - from: file://foo/yellow_tripdata_2024-01.parquet
    name: trip_data
    params:
      file_format: parquet
```

:::warning[Performance Considerations]

When using the File Data connector without acceleration, data is loaded into memory during query execution. Ensure sufficient memory is available, including overhead for queries and the runtime, especially with concurrent queries.

Memory limitations can be mitigated by storing acceleration data on disk, which is supported by [`cayenne`](../data-accelerators/cayenne) and [`sqlite`](../data-accelerators/sqlite) accelerators by specifying `mode: file`.

:::

## Cookbook

Refer to the [File cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/file) to see an example of the File connector in use.
