---
title: 'TLS: Transport Layer Security'
sidebar_label: 'TLS'
sidebar_position: 2
description: 'TLS Endpoint Documentation'
pagination_prev: null
pagination_next: null
---

[TLS](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/) (Transport Layer Security) is a cryptographic protocol that secures communication over a network. Learn how Spice can be configured to use TLS on all of its endpoints.

## Pre-requisites

A valid TLS certificate and private key in the [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format are required. Follow the [TLS Sample](https://github.com/spiceai/samples/tree/trunk/tls) to generate these for testing.

## Via command line arguments

Use the `--tls-*` flags to enable TLS. The `--tls-certificate-file` and `--tls-key-file` flags are used to specify the paths to the certificate and private key files.

```bash
spiced --tls --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem
```

Alternatively, the `--tls-certificate` and `--tls-key` flags can be used to specify the certificate and private key directly.

```bash
export TLS_CERT=$(cat /path/to/cert.pem)
export TLS_KEY=$(cat /path/to/key.pem)
spiced --tls-certificate "$TLS_CERT" --tls-key "$TLS_KEY"
```

The arguments can also be passed to `spice run` to enable TLS.

```bash
spice run -- --tls-certificate-file /path/to/cert.pem --tls-key-file /path/to/key.pem
```

Note that `--` is used to separate the `spice run` arguments from the Spice runtime arguments.

## Via spicepod.yaml

The `runtime` configuration can be added to the root `spicepod.yaml` to enable TLS.

```yaml
runtime:
  tls:
    # Using filesystem paths
    certificate_file: /path/to/cert.pem
    key_file: /path/to/key.pem
```

```yaml
runtime:
  tls:
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
    # The certificate and key can also come from secrets
    certificate: ${secrets:tls_cert}
    key: ${secrets:tls_key}
```

For more information on using secrets, see the [Secret Stores](../../components/secret-stores/index.md) documentation.

:::info

Spice will only configure the endpoints based on the initial configuration it starts up with. Changing the parameters at runtime in the spicepod will have no effect.

:::

## Output

The output shows TLS is enabled and which certificate is being used.

```bash
INFO runtime: All endpoints secured with TLS using certificate: CN=spiced.localhost, OU=IT, O=Widgets, Inc., L=Seattle, S=Washington, C=US
```

## Using the Spice CLI

When TLS is enabled, the Spice CLI can connect to the Spice runtime using the `--tls-root-certificate-file` flag. This flag is used to specify the path to the root certificate file that can be used to verify the Spice runtime's certificate.

`spice sql`

```bash
spice sql --tls-root-certificate-file /path/to/root.pem
```

`spice status`

```bash
spice status --tls-root-certificate-file /path/to/root.pem
```

`spice datasets`

```bash
spice datasets --tls-root-certificate-file /path/to/root.pem
```

`spice models`

```bash
spice models --tls-root-certificate-file /path/to/root.pem
```

`spice catalogs`

```bash
spice catalogs --tls-root-certificate-file /path/to/root.pem
```
