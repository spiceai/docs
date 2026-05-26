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
- `--client-tls-certificate-file <file>` The path to the client certificate file for mTLS authentication. Required when connecting to a cluster node that enforces mutual TLS. Must be used together with `--client-tls-key-file`.
- `--client-tls-key-file <file>` The path to the client private key file for mTLS authentication. Must be used together with `--client-tls-certificate-file`.
- `--headers <KEY:VALUE>` Custom HTTP headers in format `Key:Value` (can be specified multiple times).
- `-x`, `--expanded` Start the REPL in expanded view, rendering each column on its own line per record. Useful for wide tables. Can be toggled at runtime with the `.expanded` meta-command.
- `-h`, `--help` Print this help message.

#### REPL Meta-commands

Inside the REPL, the following meta-commands are available:

- `.expanded` Toggle expanded (column-per-line) display, similar to PostgreSQL's `\x`. Pass `.expanded on` or `.expanded off` to set the mode explicitly.
- `help` Print the list of available commands.

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

### Additional Examples

```shell
$ spice sql --tls-root-certificate-file /path/to/cert.pem
Welcome to the Spice.ai SQL REPL! Type 'help' for help.
```

#### mTLS Client Authentication

```shell
$ spice sql --tls-root-certificate-file /path/to/ca.pem \
  --client-tls-certificate-file /path/to/client-cert.pem \
  --client-tls-key-file /path/to/client-key.pem
Welcome to the Spice.ai SQL REPL! Type 'help' for help.
```

#### Expanded view for wide tables

Use `--expanded` (or `-x`) to start the REPL with each column on its own line, which is easier to read when tables are wider than the terminal. The mode can also be toggled at runtime with `.expanded`:

```shell
$ spice sql --expanded
Welcome to the Spice.ai SQL REPL! Type 'help' for help.

sql> SELECT * FROM eth.recent_blocks LIMIT 1;
-[ RECORD 1 ]----------+----------------------------------------
number                 | 18000000
hash                   | 0x9c2f1e8...
timestamp              | 2023-08-14T00:00:00Z
gas_used               | 12500000
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
