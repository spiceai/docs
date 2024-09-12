---
title: 'File Data Connector'
sidebar_label: 'File Data Connector'
description: 'File Data Connector Documentation'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The File Data Connector enables federated SQL queries on files stored by locally accessible filesystems. It supports querying individual files or entire directories, where all child files within the directory will be loaded and queried.

File formats are specified using the `file_format` parameter in the `params` section. File formats currently supported are:

| Name                                          | Parameter               | Supported |
| --------------------------------------------- | ----------------------- | --------- |
| [Apache Parquet](https://parquet.apache.org/) | `file_format: parquet`  | ✅        |
| [CSV](/reference/file_format.md#csv)          | `file_format: csv`      | ✅        |
| [Apache Iceberg](https://iceberg.apache.org/) | `file_format: iceberg`  | Roadmap   |
| JSON                                          | `file_format: json`     | Roadmap   |
| Markdown                                      | `file_format: markdown` | Roadmap   |
| Text                                          | `file_format: txt`      | Roadmap   |
| PDF                                           | `file_format: pdf`      | Roadmap   |

File formats support additional parameters in the `params` (like `csv_has_header`) described in [File Formats](/reference/file_format)

Example `spicepod.yml`

```yaml
datasets:
  - from: file://path/to/customer.parque
    name: customer
    params:
      file_format: parquet

  - from: file://path/to/orders.csv
    name: orders
    params:
      file_format: csv
      csv_has_header: false
```
