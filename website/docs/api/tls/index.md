---
title: 'TLS: Transport Layer Security'
sidebar_label: 'TLS'
sidebar_position: 2
desired_sidebar: api
description: 'Encryption in transit with TLS documentation'
pagination_prev: null
pagination_next: null
---

[Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) (TLS) is a cryptographic protocol that secures communication over a network. TLS is the successor to deprecated Secure-Sockets-Layer (SSL). Learn how to configure Spice to use TLS for encryption in transit.

## Pre-requisites

A valid TLS certificate and private key in [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format are required. To generate certificates for testing, follow the [TLS Cookbook](https://github.com/spiceai/cookbook/tree/trunk/tls).

## Enable TLS via command line arguments

Use `--tls-enabled true` to enable TLS from the command line. The arguments `--tls-certificate-file` and `--tls-key-file` specify the paths to the certificate and private key files.

```bash
# Provide the TLS certicate and key PEM files to the Spice runtime
spiced --tls-enabled true --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem
```

Alternatively, to pass PEM-encoded certificate and private key strings directly, use the `--tls-certificate` and `--tls-key` arguments.

```bash
# Provide the TLS certicate and key using PEM-encoded strings to the Spice runtime
export TLS_CERT=$(cat /path/to/cert.pem)
export TLS_KEY=$(cat /path/to/key.pem)
spiced --tls-enabled true --tls-certificate "$TLS_CERT" --tls-key "$TLS_KEY"
```

When using the Spice CLI, arguments, including the TLS arguments, are passed to `spice run` automatically.

```bash
# Run Spice using the CLI and provide the TLS certicate and key as PEM files
spice run -- --tls-enabled true --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem
```

Note that `--` is used to separate the `spice run` arguments from the Spice runtime arguments.

## Enable TLS via spicepod.yaml

Use the `tls` section as a child to `runtime` to provide the certificate and key files/strings.

```yaml
runtime:
  tls:
    enabled: true
    # Using filesystem paths
    certificate_file: /path/to/cert.pem
    key_file: /path/to/key.pem
```

```yaml
runtime:
  tls:
    enabled: true
    # Specify the certificate and key directly
    certificate: |
      -----BEGIN CERTIFICATE-----
      ...
      -----END CERTIFICATE-----
    key: |
      -----BEGIN PRIVATE KEY-----
      ...
      -----END PRIVATE KEY-----
```

```yaml
runtime:
  tls:
    enabled: true
    # Provide the certificate and key using secrets
    certificate: ${secrets:tls_cert}
    key: ${secrets:tls_key}
```

To learn more about secrets, see [Secret Stores](../../components/secret-stores).

## Certificate Hot-Reload

When TLS is configured using **file paths** (`certificate_file` / `key_file` or `--tls-certificate-file` / `--tls-key-file`), the runtime automatically watches the certificate and key files for changes and reloads them without restarting. This is useful when certificates are rotated by external tools such as SPIRE, cert-manager, or kubelet.

- In-flight TLS connections are unaffected — only new handshakes use the rotated certificate.
- If a rotated file contains invalid PEM data, the runtime logs the error and continues serving with the previous certificate.
- File changes are detected via polling (every 2 seconds). Atomic file renames are handled correctly.

When TLS is configured using **inline values** (`certificate` / `key`, including `${secrets:…}` references), certificates are loaded once at startup and are not automatically reloaded.

The `runtime_tls_reload_total` OTel counter tracks reload attempts:

| Label    | Values                    |
| -------- | ------------------------- |
| `scope`  | `public`, `cluster`       |
| `result` | `ok`, `io_error`, `parse_error` |

:::info

When using inline certificates or secrets (`certificate` / `key`), changes are not applied at runtime and will only take effect on restart.

:::

## Output

When TLS is enabled, the runtime output will print the TLS certificate details.

```bash
INFO runtime: All endpoints secured with TLS using certificate: CN=spiced.localhost, OU=IT, O=Widgets, Inc., L=Seattle, S=Washington, C=US
```

## Using the Spice CLI

When TLS is enabled in the runtime, the Spice CLI can be configured to connect to the runtime using TLS by specifying the `--tls-root-certificate-file` argument, providing the path to the root certificate file.

```bash
spice sql --tls-root-certificate-file /path/to/root.pem
```

## Mutual TLS (mTLS)

:::info Enterprise Feature
mTLS (client certificate authentication) is included in the Enterprise distribution of Spice.ai. [Learn more](https://docs.spice.ai/docs/enterprise).
:::

mTLS extends standard TLS by requiring the client to also present a certificate during the TLS handshake. This provides cryptographic authentication of both the server and the client.

### Enable mTLS via spicepod.yaml

Set `client_auth_mode` to `request` or `required` and provide a CA bundle to verify client certificates:

```yaml
runtime:
  tls:
    enabled: true
    certificate_file: /path/to/server.crt
    key_file: /path/to/server.key
    client_auth_mode: required
    client_auth_ca_file: /path/to/client-ca.pem
```

### Enable mTLS via command line

```bash
spiced --tls-enabled true \
  --tls-certificate-file /path/to/server.crt \
  --tls-key-file /path/to/server.key \
  --tls-client-auth-mode required \
  --tls-client-auth-ca-file /path/to/client-ca.pem
```

### Client auth modes

| Mode | Behavior |
|------|----------|
| `none` *(default)* | Standard one-way TLS. No client certificate is requested. |
| `request` | The server requests a client certificate but accepts connections without one. Presented certificates are verified against the CA. Useful for migration or audit-only deployments. |
| `required` | A valid client certificate is required. The Flight listener rejects no-cert connections at the TLS handshake. The HTTP listener admits no-cert connections so `/health` and `/v1/ready` remain accessible for Kubernetes probes, but all other HTTP endpoints return 401 without a verified client certificate. |

### Connecting with a client certificate

Use cURL with a client certificate:

```bash
curl --cacert ca.pem --cert client.crt --key client.key \
  https://localhost:8090/v1/sql -d 'SELECT 1'
```

Use the Spice CLI with a client certificate:

```bash
spice sql --tls-root-certificate-file ./ca.pem \
  --client-tls-certificate-file ./client.crt \
  --client-tls-key-file ./client.key
```

### Probe and metrics access

Kubernetes liveness/readiness probes (`/health`, `/v1/ready`) and the metrics endpoint (`/metrics`) are always accessible without a client certificate, even under `client_auth_mode: required`.

### Client CA hot-reload

When `client_auth_ca_file` is used, the CA bundle is watched for changes and reloaded atomically alongside the server certificate and key. When `client_auth_ca` (inline) is used, the CA is loaded once at startup.

For a complete walkthrough, see the [mTLS Cookbook recipe](https://github.com/spiceai/cookbook/tree/trunk/mtls).
