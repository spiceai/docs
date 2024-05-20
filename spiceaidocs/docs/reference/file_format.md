---
title: "File Formats"
sidebar_label: "File Formats"
pagination_prev: 'reference/index'
pagination_next: null
---

Various file formats are supported in Spice.

## CSV

### Parameters

- `has_header`: Optional. CSV only. Indicate if the CSV file has header row. default: `true`
- `quote`: Optional. CSV only. A one-character string used to quote fields containing special characters. default: `"`
- `escape`: Optional. CSV only. A one-character string used to represent special characters or to include characters that would normally be interpreted as delimiters or new line characters within a field value. default: null
- `schema_infer_max_records`: Optional. CSV only. A number used to set the limit in terms of records to scan to infer the schema. default `1000`
- `delimiter`: Optional. CSV only. A one-character string used to separate individual fields. default: `,`
