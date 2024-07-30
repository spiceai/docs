---
title: 'TLS: Transport Layer Security'
sidebar_label: 'TLS'
sidebar_position: 2
description: 'Encryption in transit with TLS documentation'
pagination_prev: null
pagination_next: null
---

[Transport Layer Security](https://en.wikipedia.org/wiki/Transport_Layer_Security) (TLS) is a cryptographic protocol that secures communication over a network. TLS is the successor to deprecated Secure-Sockets-Layer (SSL). Learn how to configure Spice to use TLS for encryption in transit.

## Pre-requisites

A valid TLS certificate and private key in [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format are required. To generate certificates for testing, follow the [TLS Sample](https://github.com/spiceai/samples/tree/trunk/tls).

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

To learn more about secrets, see [Secret Stores](../../components/secret-stores/index.md).

:::info

Changes to TLS configuration are not applied at runtime and will only take effect on startup.

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
