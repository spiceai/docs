---
title: 'run'
sidebar_label: 'run'
pagination_prev: null
pagination_next: null
---

Run Spice - starts the Spice runtime, installing if necessary.

### Usage

```shell
spice run [flags]
spice run [flags] -- [spiced flags]
```

#### Flags

- `-h`, `--help` Print this help message.
- `--flight-endpoint` Configure runtime Flight endpoint. Defaults to `http://127.0.0.1:50051`.
- `--http-endpoint` Configure runtime HTTP endpoint. Defaults to `http://127.0.0.1:8090`.
- `--metrics-endpoint` Configure runtime Prometheus metrics endpoint. Defaults to `http://127.0.0.1:9090`.

#### Spiced Flags

Flags that are passed to the `spiced` runtime directly using `--`.

- `--http` Configure runtime HTTP address [default: 127.0.0.1:8090]
- `--flight` Configure runtime Flight address [default: 127.0.0.1:50051]
- `--metrics` Enable and configure the Prometheus metrics endpoint (disabled by default)
- `--tls-enabled` Enable TLS
- `--tls-certificate` The TLS PEM-encoded certificate
- `--tls-certificate-file` Path to the TLS PEM-encoded certificate file
- `--tls-key` The TLS PEM-encoded key
- `--tls-key-file` Path to the TLS PEM-encoded key file
- `--telemetry-enabled` Enable or disable anonymous telemetry
- `--pods-watcher-enabled` Enable the pods watcher (disabled by default)
- `--repl` Start a SQL REPL against the runtime's Flight endpoint
- `-v`, `--verbose` Enable verbose logging (use `-vv` for more detail)
- `--very-verbose` Enable very verbose logging
- `--set-runtime` Override [runtime configuration](../../reference/spicepod/#runtime) with a name/value pair specified as `name=value`. Multiple overrides can be specified by using the flag multiple times.
- `[PATH]` Positional argument specifying the path to a Spicepod directory or file. Supports local paths and `s3://` remote URLs.

### Examples

#### `--set-runtime`

The `--set-runtime` flag allows overriding runtime configuration values. It can be specified multiple times to set multiple values. It is used like this: `--set-runtime name=value`. The Spicepod YAML equivalent of that is:

```yaml
runtime:
  name: value
```

Examples:

`--set-runtime task_history.captured_output=none`:

```yaml
runtime:
  task_history:
    captured_output: none
```

`--set-runtime results_cache.enabled=false`:

```yaml
runtime:
  results_cache:
    enabled: false
```

`--set-runtime runtime.tls.enabled=true --set-runtime runtime.tls.certificate_file=/path/to/cert.pem --set-runtime runtime.tls.key_file=/path/to/key.pem`:

```yaml
runtime:
  tls:
    enabled: true
    certificate_file: /path/to/cert.pem
    key_file: /path/to/key.pem
```

#### No arguments

```shell
spice run
```

#### `--captured-outputs none`

```shell
# Set task history captured outputs to none via --set-runtime
spice run -- --set-runtime task_history.captured_output=none
```

#### `--http`

```shell
# Expose the HTTP server on all interfaces
spice run -- --http 0.0.0.0:8090
```

#### `--flight`

```shell
# Expose the HTTP & Flight servers on all interfaces with TLS
spice run -- --http 0.0.0.0:8090 --flight 0.0.0.0:50051 --tls-enabled true --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem
```
