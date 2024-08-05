---
title: 'HTTP(s) Data Connector'
sidebar_label: 'HTTP(s) Data Connector'
description: 'HTTP(s) Data Connector Documentation'
pagination_prev: null
---

The HTTP(s) Data Connector enables federated SQL query against a variety of tabular formatted (e.g. Parquet/CSV) files stored at a HTTP endpoint.

The connector supports Basic HTTP authentication via `param` values.

### Parameters

- `http_port`: Optional. Port to create HTTP(s) connection over. Default: 80 and 443 for HTTP and HTTPS respectively.
- `http_username`: Optional. Username to provide connection for HTTP basic authentication. Default: None.
- `http_password`: Optional. Password to provide connection for HTTP basic authentication. Default: None. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_http_pass}`.
- `client_timeout`: Specifies timeout for HTTP response. Default value is `30s` E.g. `client_timeout: 60s`

### Examples

```yaml
datasets:
  - from: https://github.com/LAION-AI/audio-dataset/raw/7fd6ae3cfd7cde619f6bed817da7aa2202a5bc28/metadata/freesound/parquet/freesound_parquet.parquet
    name: laion_freesound

  - from: http://static_username@localhost:3001/report.csv
    name: local_report
    params:
      http_password: ${env:MY_HTTP_PASS}
```
