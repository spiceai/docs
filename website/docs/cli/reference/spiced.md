---
title: 'spiced'
sidebar_label: 'spiced'
description: 'Command-line reference for the spiced runtime binary — flags, defaults, and differences from spice run.'
keywords: [spice.ai, cli, spiced, runtime, binary, flags]
pagination_prev: null
pagination_next: null
---

`spiced` is the Spice.ai runtime binary. It hosts the HTTP and Flight servers, loads a Spicepod, and serves queries.

Most users invoke `spiced` indirectly via [`spice run`](./run), which installs the runtime, applies developer-friendly defaults, and forwards CLI arguments. This page documents `spiced` itself for operators who run the binary directly (for example in containers, systemd units, or CI).

### Usage

```shell
spiced [flags] [SPICEPOD_PATH]
```

If `SPICEPOD_PATH` is omitted, `spiced` uses the current working directory. When the path resolves to a directory, the runtime loads `spicepod.yaml` (or `spicepod.yml`) from inside it. When the path resolves to a file, any YAML filename is accepted (e.g. `spiced ./configs/my-app.yaml`); the file must declare `kind: Spicepod` and a recognized `version` — otherwise `spiced` exits with an explicit validation error.

### Runtime flags

- `--http <BIND_ADDRESS>` — HTTP server bind address. Default: `127.0.0.1:8090`.
- `--flight <FLIGHT_BIND_ADDRESS>` — Arrow Flight server bind address. Default: `127.0.0.1:50051`.
- `--metrics <BIND_ADDRESS>` — Enable the Prometheus scrape endpoint on the given address. Disabled by default.
- `--pods-watcher-enabled` — Watch the Spicepod directory for changes and hot-reload. Disabled by default.
- `--telemetry-enabled <true|false>` — Override anonymous telemetry collection. When unset, the value is taken from `runtime.telemetry.enabled` in the Spicepod.
- `--version` — Print the runtime version and exit.
- `-v`, `--verbose` — Increase log verbosity. Repeat (`-vv`) for debug output.
- `--very-verbose` — Equivalent to `-vv`.
- `--set-runtime <key.subkey=value>` — Override a runtime configuration value. Can be repeated; see [examples in `spice run`](./run#--set-runtime).

### Hot reload

With `--pods-watcher-enabled`, which `spice run` sets, the runtime applies edits to the Spicepod without a restart. Starting in v2.5, a reload also does the following:

- A view that reads a dataset the edit adds, changes, or removes registers again, including a view that reads the dataset in a subquery or through another view. The view then reads the dataset as the Spicepod now declares it, or fails when the dataset was removed. In v2.4.x and earlier, the view kept answering from the previous table.
- When an edit changes an accelerated dataset while its source is unavailable, so the dataset cannot load with its new configuration, the runtime retries loading it, as it does for a newly added dataset, and the dataset answers queries once the source is reachable. A later edit or removal of the dataset replaces the retry. A failure to initialize the accelerator itself is not retried. In v2.4.x and earlier, the dataset stayed unregistered, with status `Error`, until the runtime restarted.
- With the default [`ready_state: on_load`](../../reference/spicepod/runtime#runtimeready_state), [`/v1/ready`](../../api/HTTP/ready) does not wait for a component that was removed from the Spicepod before it finished loading. In v2.4.x and earlier, such a component kept `/v1/ready` at `503`.

### TLS flags

These configure TLS for the HTTP and Flight servers.

- `--tls-enabled` — Enable TLS. Default: `false`.
- `--tls-certificate <PEM>` — TLS certificate as an inline PEM string.
- `--tls-certificate-file <PATH>` — Path to a PEM-encoded certificate file.
- `--tls-key <PEM>` — TLS private key as an inline PEM string.
- `--tls-key-file <PATH>` — Path to a PEM-encoded private key file.

### Cluster flags

Used when running `spiced` as part of a [distributed cluster](../../features/distributed-query). Omit these for standalone operation.

- `--role <scheduler|executor>` — Explicit cluster role. If omitted but `--scheduler-address` is set, the role defaults to `executor`.
- `--scheduler-address <URL>` — URL of the scheduler service. Required on executors.
- `--node-bind-address <BIND_ADDRESS>` — Bind address for the internal cluster gRPC service. Default: `0.0.0.0:50052`.
- `--node-advertise-address <HOST_OR_IP>` — Hostname or IP this node advertises to the rest of the cluster. Required on every scheduler and executor. With cluster mTLS, it must be a Subject Alternative Name in the node certificate.
- `--node-mtls-ca-certificate-file <PATH>` — CA certificate used to validate peer node identities.
- `--node-mtls-certificate-file <PATH>` — Certificate file used for both server TLS and client mTLS on the node port.
- `--node-mtls-key-file <PATH>` — Private key file for the node certificate.
- `--allow-insecure-connections` — Run cluster connections without mTLS, for local development and testing on a trusted network. Cluster connections are then neither authenticated nor encrypted. Has no effect on cluster connections when the `--node-mtls-*` flags are set. See [Local development without mTLS](../../features/distributed-query/index.md#local-development-without-mtls). It is also required on every node of a GGUF model that llama.cpp splits across nodes, whose connections are never authenticated or encrypted, with or without the `--node-mtls-*` flags. See [GGUF models split across nodes](../../components/models/index.md#gguf-models-split-across-nodes).

### Spice Cloud Connect flags

Use these flags for unattended enrollment. After enrollment, `spiced` uses the identity in the instance's `.spice` directory.

- `--token <ENROLLMENT_KEY>` — Enroll the instance with a one-time Spice Cloud key. You cannot use this option with `--repl`.
- `--region <REGION>` — Set a location label during enrollment. Use 2–64 lowercase letters, digits, or hyphens, starting and ending with a letter or digit. Use this option with `--token`.

Each key can enroll one instance. After enrollment, remove the key and `--token` from the command.

Set `SPICE_CONFIG_DIR` to a persistent location. The instance cannot reconnect if you lose its identity.

See [`spice cloud`](./cloud) and [Headless Cloud Connect](../../deployment/cloud/cloud-connect/headless).

### SQL REPL flags

- `--repl` — Start a SQL REPL against the runtime's Flight endpoint instead of serving requests.
- `--repl-flight-endpoint <HTTP_ENDPOINT>` — Flight endpoint the REPL connects to. Default: `http://localhost:50051`.
- `--http-endpoint <HTTP_ENDPOINT>` — HTTP endpoint the REPL connects to. Default: `http://localhost:8090`.
- `--tls-root-certificate-file <PATH>` — Root certificate used to verify the runtime's TLS certificate.
- `--client-tls-certificate-file <PATH>` — Client certificate for mTLS authentication. Must be used with `--client-tls-key-file`.

### Differences from `spice run`

`spice run` is a thin launcher around `spiced`. When it spawns the runtime, it adds a few flags automatically that `spiced` does **not** apply when invoked directly:

| Behavior                     | `spice run`                                              | `spiced`                                             |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| Runtime installation         | Auto-installs `spiced` if missing                        | Must already be installed                            |
| Pods watcher                 | Enabled (`--pods-watcher-enabled`)                       | Disabled by default                                  |
| Task history captured output | Forced to `truncated` via `--set-runtime`                | Uses the Spicepod value (default: `full`)            |
| `--endpoint` scheme routing  | Supported — `http://…` sets HTTP, `grpc://…` sets Flight | Not supported — use `--http` and `--flight` directly |

Operators running `spiced` directly who want `spice run`-equivalent behavior should pass `--pods-watcher-enabled` and, if desired, `--set-runtime task_history.captured_output=truncated`.

### Examples

#### Start the runtime with a Spicepod in the current directory

```shell
spiced
```

#### Bind the HTTP and Flight servers to all interfaces

```shell
spiced --http 0.0.0.0:8090 --flight 0.0.0.0:50051
```

#### Enable Prometheus metrics

```shell
spiced --metrics 0.0.0.0:9090
```

#### Enable TLS

```shell
spiced --tls-enabled \
  --tls-certificate-file /path/to/cert.pem \
  --tls-key-file /path/to/key.pem
```

#### Run as a cluster executor

```shell
spiced --role executor \
  --scheduler-address https://scheduler.example.internal:50052 \
  --node-advertise-address executor-1.example.internal \
  --node-mtls-ca-certificate-file /etc/spice/ca.pem \
  --node-mtls-certificate-file /etc/spice/node.pem \
  --node-mtls-key-file /etc/spice/node.key
```

#### Override runtime configuration at launch

```shell
spiced --set-runtime task_history.captured_output=none \
       --set-runtime results_cache.enabled=false
```
