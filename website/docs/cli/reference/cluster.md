---
title: 'cluster'
sidebar_label: 'cluster'
pagination_prev: null
pagination_next: null
---

Creates development TLS certificates for the nodes of a Spice cluster. A [distributed query](../../features/distributed-query) cluster enforces mutual TLS between its scheduler and executors, and `spice cluster tls` issues a local certificate authority (CA) and one certificate per node for development and testing.

:::warning
The CA that `spice cluster tls init` creates is for development and testing only. Do not use it, or the certificates it signs, in production.
:::

### Usage

```shell
spice cluster tls init
spice cluster tls add <client-name> [--host <host>]
```

#### Commands

- `tls init` Create a CA certificate (`~/.spice/pki/ca.crt`) and its private key (`~/.spice/pki/ca.key`). The certificate uses ECDSA P-256 and is valid for 10 years. When a CA already exists, the command asks before it overwrites it.
- `tls add <client-name>` Create a certificate (`~/.spice/pki/<client-name>.crt`) and private key (`~/.spice/pki/<client-name>.key`) for one node, signed by the CA. The certificate uses ECDSA P-256, is valid for 1 year, has `<client-name>` as its common name, and includes `localhost` and `127.0.0.1` as Subject Alternative Names (SANs). Run `tls init` first.

#### Flags

- `--host <host>` For `tls add`: an additional host to include in the certificate's SANs. An IP address is added as an IP SAN, and a host name as a DNS SAN.
- `-h`, `--help` Print this help message.

### Examples

Create a CA, then a certificate for a node that other nodes reach at `10.0.0.5`:

```shell
>>> spice cluster tls init
Test PKI infrastructure initialized successfully!

CA Certificate: /home/user/.spice/pki/ca.crt
CA Private Key: /home/user/.spice/pki/ca.key
Validity:       10 years (until 2036-11-17)
OU:             unknown

WARNING: This CA is for development and testing only.
         DO NOT use these certificates in production!

Next steps:
  Run spice cluster tls add <client-name> to create a certificate for a cluster member.

>>> spice cluster tls add node-1 --host 10.0.0.5
Certificate for 'node-1' created successfully!

Certificate: /home/user/.spice/pki/node-1.crt
Private Key: /home/user/.spice/pki/node-1.key
Validity:    1 year (until 2027-11-20)
CN:          node-1
DNS SANs:    localhost
IP SANs:     127.0.0.1, 10.0.0.5
```

The `OU` is the email address in the Git configuration (`git config user.email`), or `unknown` when none is set. Pass the node certificates to `spiced` with the `--node-mtls-*` flags, as [Secure Cluster Communication (mTLS)](../../features/distributed-query#secure-cluster-communication-mtls) describes.
