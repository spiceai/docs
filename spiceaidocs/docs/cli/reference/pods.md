---
title: "pods"
sidebar_label: "pods"
pagination_prev: null
pagination_next: null
---
Lists Spicepods loaded by the Spice runtime

### Usage

```shell
spice pods [flags]
```

#### Flags

- `--tls-root-certificate-file`   The path to the root certificate file used to verify the Spice.ai runtime server certificate
- `-h`, `--help`   help for pods

### Examples

```shell 
>>> spice pods

VERSION NAME        DATASETSCOUNT MODELSCOUNT DEPENDENCIESCOUNT
v1beta1 demo        2             1           0
v1beta1 another_pod 3             0           1
```

### Additional Example

```shell
>>> spice pods --tls-root-certificate-file /path/to/cert.pem

VERSION NAME        DATASETSCOUNT MODELSCOUNT DEPENDENCIESCOUNT
v1beta1 demo        2             1           0
v1beta1 another_pod 3             0           1
```
