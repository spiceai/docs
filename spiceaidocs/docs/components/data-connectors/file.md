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

## Trigger accelerated refresh on file change

The File Data Connector can automatically refresh the associated acceleration when the source file is modified. This is disabled by default and can be enabled by setting the `file_watcher` parameter to `enabled` in the acceleration parameters.

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
