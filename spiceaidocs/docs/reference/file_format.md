---
title: "File Formats"
sidebar_label: "File Formats"
sidebar_position: 5
pagination_prev: 'reference/index'
pagination_next: null
---

Spice currently supports CSV and Parquet data file-formats. Support for Iceberg and other file-formats are on the roadmap.

The parameters supported for specific file-format are detailed on this page.

## CSV

### Parameters

- `csv_has_header`: Optional. Indicate if the CSV file has header row. Defaults to `true`
- `csv_quote`: Optional. A one-character string used to quote fields containing special characters. Defaults to `"`
- `csv_escape`: Optional. A one-character string used to represent special characters or to include characters that would normally be interpreted as delimiters or new line characters within a field value. Defaults to `null`
- `csv_schema_infer_max_records`: Optional. A number used to set the limit in terms of records to scan to infer the schema. Defaults to `1000`
- `csv_delimiter`: Optional. A one-character string used to separate individual fields. Defaults to `,`
