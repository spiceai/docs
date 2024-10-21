---
title: 'File Data Connector'
sidebar_label: 'File Data Connector'
description: 'File Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The File Data Connector enables federated SQL queries on files stored by locally accessible filesystems. It supports querying individual files or entire directories, where all child files within the directory will be loaded and queried.

File formats are specified using the `file_format` parameter, as described in [Object Store File Formats](/components/data-connectors/index.md#object-store-file-formats).

Example `spicepod.yml`

```yaml
datasets:
  - from: file://path/to/customer.parquet
    name: customer
    params:
      file_format: parquet

  - from: file://path/to/orders.csv
    name: orders
    params:
      file_format: csv
      csv_has_header: false
```

## Parameters

| Parameter name         | Description                                                                                           |
|------------------------|-------------------------------------------------------------------------------------------------------|
| `file_format`          | Specifies the data file format. Required if the format cannot be inferred from the `from` path.       |
| `hive_partitioning_enabled`| Enable partitioning using hive-style partitioning from the folder structure. Defaults to `false`  |

For CSV-specific parameters, see [CSV Parameters](/reference/file_format.md#csv).

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
