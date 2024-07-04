---
title: 'HTTP(s) Data Connector'
sidebar_label: 'HTTP(s) Data Connector'
description: 'HTTP(s) Data Connector Documentation'
pagination_prev: null
---

The HTTP(s) Data Connector enables federated SQL query against a variety of tabular formatted (e.g. Parquet/CSV) files stored at a HTTP endpoint.

The connector supports HTTP authentication via either `param` and/or `secrets`.

### Parameters
 - `port`: Optional. Port to create HTTP(s) connection over. Default: 80 and 443 for HTTP and HTTPS respectively.
 - `username`: Optional. Username to provide connection for HTTP authentication. Default: None.
 - `http_password`: Optional. Password to provide connection for HTTP authentication. Default: None.
 - `http_password_key`: Key of the secret that contains the value to use for `http_password`. Default: None.

### Examples
```yaml
datasets:
  - from: https://github.com/LAION-AI/audio-dataset/raw/7fd6ae3cfd7cde619f6bed817da7aa2202a5bc28/metadata/freesound/parquet/freesound_parquet.parquet
    name: laion_freesound

  - from: http://username@localhost:3001/report.csv
    name: local_report
    params:
      http_password: BadPa$5w0rd
```

To use a secret for the HTTP password, for example, by env variable
```yaml
datasets:
  - from: http://username@localhost/report.csv
    name: local_report
    params:
      http_password_key: local_password
      port: 3001
```

With the associated secret set, for example:
```shell
export SPICE_SECRET_HTTP_LOCAL_PASSWORD="BadPa$5w0rd"
```
