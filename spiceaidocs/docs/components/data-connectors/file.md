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
