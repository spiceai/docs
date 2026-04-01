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

- `--endpoint <endpoint>` Specifies the remote Spice instance endpoint. Supports `http://`, `https://`, `grpc://`, or `grpc+tls://` schemes. If not provided, uses the local spiced runtime.
- `--flight-endpoint <endpoint>` (Deprecated) Specifies the remote Spice instance Flight endpoint (treated as gRPC endpoint). If not provided, uses the local spiced runtime.
- `--cache-control <value>` Control whether the results cache is used for queries. Default: `cache`.
- `--tls-root-certificate-file <file>` The path to the root certificate file used to verify the Spice.ai runtime server certificate.
- `--headers <KEY:VALUE>` Custom HTTP headers in format `Key:Value` (can be specified multiple times).
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
