---
title: 'HTTP(s) Data Connector'
sidebar_label: 'HTTP(s) Data Connector'
description: 'HTTP(s) Data Connector Documentation'
pagination_prev: null
---

The HTTP(s) Data Connector enables federated/accelerated SQL query across [supported file formats](/components/data-connectors/index.md#object-store-file-formats) stored at an HTTP(s) endpoint.

```yaml
datasets:
  - from: http://static_username@localhost:3001/report.csv
    name: local_report
    params:
      http_password: ${env:MY_HTTP_PASS}
```

## Configuration

### `from`

The `from` field must contain a valid URI to the location of a [supported file](/components/data-connectors/index.md#object-store-file-formats). For example, `http://static_username@localhost:3001/report.csv`.

### `name`

The dataset name. This will be used as the table name within Spice.

Example:
```yaml
datasets:
  - from: http://static_username@localhost:3001/report.csv
    name: cool_dataset
    params:
      ...
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

### `params`

The connector supports Basic HTTP authentication via `param` values.

| Parameter Name   | Description                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http_port`      | Optional. Port to create HTTP(s) connection over. Default: 80 and 443 for HTTP and HTTPS respectively.                                                                                                                          |
| `http_username`  | Optional. Username to provide connection for HTTP basic authentication. Default: None.                                                                                                                                          |
| `http_password`  | Optional. Password to provide connection for HTTP basic authentication. Default: None. Use the [secret replacement syntax](../secret-stores/index.md) to load the password from a secret store, e.g. `${secrets:my_http_pass}`. |
| `client_timeout` | Optional. Specifies timeout for HTTP operations. Default value is `30s` E.g. `client_timeout: 60s`                                                                                                                              |

## Examples

### Basic example
```yaml
datasets:
  - from: https://github.com/LAION-AI/audio-dataset/raw/7fd6ae3cfd7cde619f6bed817da7aa2202a5bc28/metadata/freesound/parquet/freesound_parquet.parquet
    name: laion_freesound
```

### Using Basic Authentication
```yaml
datasets:
  - from: http://static_username@localhost:3001/report.csv
    name: local_report
    params:
      http_password: ${env:MY_HTTP_PASS}
```

## Secrets

Spice integrates with multiple secret stores to help manage sensitive data securely. For detailed information on supported secret stores, refer to the [secret stores documentation](/components/secret-stores). Additionally, learn how to use referenced secrets in component parameters by visiting the [using referenced secrets guide](/components/secret-stores#using-secrets).