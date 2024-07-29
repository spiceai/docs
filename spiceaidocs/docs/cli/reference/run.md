---
title: "run"
sidebar_label: "run"
pagination_prev: null
pagination_next: null
---
Run Spice - starts the Spice runtime, installing if necessary

### Usage

```shell 
spice run [flags]
spice run [flags] -- [spiced flags]
```

#### Flags

- `-h`, `--help`   Print this help message

#### Spiced Flags

Flags that are passed to the `spiced` runtime directly.

- `--http`  Configure runtime HTTP address [default: 127.0.0.1:8090]
- `--flight` Configure runtime Flight address [default: 127.0.0.1:50051]
- `--open_telemetry` Configure runtime OpenTelemetry address [default: 127.0.0.1:50052]
- `--tls-certificate`   The TLS PEM-encoded certificate
- `--tls-certificate-file`  Path to the TLS PEM-encoded certificate file
- `--tls-key`   The TLS PEM-encoded key
- `--tls-key-file`   Path to the TLS PEM-encoded key file

### Examples

```shell
spice run
```

```shell
# Expose the HTTP server on all interfaces
spice run -- --http 0.0.0.0:8090
```

```shell
# Expose the HTTP & Flight servers on all interfaces with TLS
spice run -- --http 0.0.0.0:8090 --flight 0.0.0.0:50051 --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem
```
