---
title: "File Formats"
sidebar_label: "File Formats"
pagination_prev: 'reference/index'
pagination_next: null
---

Spice currently supports CSV and Parquet data file-formats. Support for Iceberg and other file-formats are on the roadmap.

The parameters supported for specific file-format are detailed on this page.

## CSV

### Parameters

- `has_header`: Optional. Indicate if the CSV file has header row. default: `true`
- `quote`: Optional. A one-character string used to quote fields containing special characters. default: `"`
- `escape`: Optional. A one-character string used to represent special characters or to include characters that would normally be interpreted as delimiters or new line characters within a field value. default: `null`
- `schema_infer_max_records`: Optional. A number used to set the limit in terms of records to scan to infer the schema. default `1000`
- `delimiter`: Optional. A one-character string used to separate individual fields. default: `,`
