---
title: 'sql'
sidebar_label: 'sql'
pagination_prev: null
pagination_next: null
---

Start an interactive SQL query session against the Spice runtime

### Usage

```shell
spice sql [flags]
```

#### Flags

- `--cloud` Use a Spice Cloud instance as the SQL backend. Requires `--api-key`.
- `--endpoint <endpoint>` Specifies the remote Spice instance endpoint. Supports `http://`, `https://`, `grpc://`, or `grpc+tls://` schemes. If not provided, uses the local spiced runtime.
- `--flight-endpoint <endpoint>` (Deprecated) Specifies the remote Spice instance Flight endpoint (treated as gRPC endpoint). If not provided, uses the local spiced runtime.
- `--http-endpoint <endpoint>` (Deprecated) HTTP endpoint of Spice (default: `http://127.0.0.1:8090`).
- `--tls-root-certificate-file <file>` The path to the root certificate file used to verify the Spice.ai runtime server certificate.
- `-h`, `--help` Print this help message.

### Examples

```shell
$ spice sql
Welcome to the Spice.ai SQL REPL! Type 'help' for help.

show tables;  -- list available tables
sql> show tables
+---------------+--------------------+---------------+------------+
| table_catalog | table_schema       | table_name    | table_type |
+---------------+--------------------+---------------+------------+
| datafusion    | public             | tmp_view_test | VIEW       |
| datafusion    | information_schema | tables        | VIEW       |
| datafusion    | information_schema | views         | VIEW       |
| datafusion    | information_schema | columns       | VIEW       |
| datafusion    | information_schema | df_settings   | VIEW       |
+---------------+--------------------+---------------+------------+
```

### Additional Example

```shell
$ spice sql --tls-root-certificate-file /path/to/cert.pem
Welcome to the Spice.ai SQL REPL! Type 'help' for help.
```

#### Remote and Cloud Examples

```shell
# Connect to Spice Cloud
spice sql --cloud --api-key <your-api-key>

# Connect to a remote spiced instance over HTTP
spice sql --endpoint http://my-remote-host:8090

# Connect to a remote spiced instance over Arrow Flight SQL (gRPC)
spice sql --endpoint grpc://my-remote-host:50051

show tables;  -- list available tables
sql> show tables
+---------------+--------------------+---------------+------------+
| table_catalog | table_schema       | table_name    | table_type |
+---------------+--------------------+---------------+------------+
| datafusion    | public             | tmp_view_test | VIEW       |
| datafusion    | information_schema | tables        | VIEW       |
| datafusion    | information_schema | views         | VIEW       |
| datafusion    | information_schema | columns       | VIEW       |
| datafusion    | information_schema | df_settings   | VIEW       |
+---------------+--------------------+---------------+------------+
```
