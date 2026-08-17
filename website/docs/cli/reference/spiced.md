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
- `--node-advertise-address <HOST_OR_IP>` — Hostname or IP this node advertises to the rest of the cluster.
- `--node-mtls-ca-certificate-file <PATH>` — CA certificate used to validate peer node identities.
- `--node-mtls-certificate-file <PATH>` — Certificate file used for both server TLS and client mTLS on the node port.
- `--node-mtls-key-file <PATH>` — Private key file for the node certificate.
- `--allow-insecure-connections` — Allow cluster communication without mTLS. Use only in development or testing environments.

### Spice Cloud Connect flags

There is no flag that turns Cloud Connect on. An **enrolled identity** in the instance's `.spice` directory is what connects a runtime to Spice Cloud, so a `spiced` started from an enrolled directory reconnects on its own, and a `spiced` with no identity never connects.

- `--token <ENROLLMENT_KEY>` — One-time Spice Cloud enrollment key (`spice-enroll-…`). This is the canonical headless enrollment path, used directly by `docker run` and Helm. `spiced` enrolls **before** the runtime is built and before any listener binds — the process stays unready until the issued identity is durable on disk — then discards the key and starts normally. If a valid identity already exists for this instance, it wins and the key is **not** redeemed. Invalid, expired, or already-used keys exit non-zero without falling back to a prompt; retryable Cloud errors keep the runtime unready while retrying with bounded backoff. Cannot be combined with `--repl`.
- `--region <REGION>` — Host-location label recorded on the instance at enrollment, e.g. `us-west-2` or `on-prem-syd`. 2–64 lowercase letters, digits, or hyphens. Only meaningful with `--token`; omitting it leaves any previously recorded region unchanged.

An enrollment key is single-use, short-lived, and never written by `spiced` to any file. Its value is visible to same-host process listings for the lifetime of the enrollment process, because the operating system retains the original `argv` — recreate containers and pods without `--token` once the runtime is ready.

Cloud Connect state is per instance directory. `SPICE_CONFIG_DIR` overrides where that state is written, in full, which is how containers put the issued identity on a persistent volume.

See [`spice connect`](./connect) and [Headless Cloud Connect](../../deployment/cloud-connect/headless).

### Cloud Connect HTTP endpoint

- `GET /v1/cloud-connect/status` — the instance identifier and the sticky list of Spicepod sections a deployment persisted that only a restart can activate:

  ```json
  { "instance_id": "inst_0123456789", "restart_required": ["runtime", "tools"] }
  ```

  On the authenticated API — see [API authentication](../../api/auth/index.md). [`spice connect status`](./connect#status) reports the same state alongside the connection and service.

### SQL REPL flags

- `--repl` — Start a SQL REPL against the runtime's Flight endpoint instead of serving requests.
- `--repl-flight-endpoint <HTTP_ENDPOINT>` — Flight endpoint the REPL connects to. Default: `http://localhost:50051`.
- `--http-endpoint <HTTP_ENDPOINT>` — HTTP endpoint the REPL connects to. Default: `http://localhost:8090`.
- `--tls-root-certificate-file <PATH>` — Root certificate used to verify the runtime's TLS certificate.
- `--client-tls-certificate-file <PATH>` — Client certificate for mTLS authentication. Must be used with `--client-tls-key-file`.

### Differences from `spice run`

`spice run` is a thin launcher around `spiced`. When it spawns the runtime, it adds a few flags automatically that `spiced` does **not** apply when invoked directly:

| Behavior                    | `spice run`                                                 | `spiced`                                            |
| --------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Runtime installation        | Auto-installs `spiced` if missing                           | Must already be installed                           |
| Pods watcher                | Enabled (`--pods-watcher-enabled`)                          | Disabled by default                                 |
| Task history captured output | Forced to `truncated` via `--set-runtime`                   | Uses the Spicepod value (default: `full`)           |
| `--endpoint` scheme routing | Supported — `http://…` sets HTTP, `grpc://…` sets Flight    | Not supported — use `--http` and `--flight` directly |

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
