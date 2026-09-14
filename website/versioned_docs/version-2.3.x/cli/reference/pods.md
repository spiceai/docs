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
- `-o`, `--output <format>` Output format: `table` (default) or `json`.
- `-h`, `--help`   help for pods

### Examples

```shell
>>> spice pods

NAME        VERSION DATASETS MODELS DEPENDENCIES
demo        v2      2        1      0
another_pod v2      3        0      1
```

### Additional Example

```shell
>>> spice pods --tls-root-certificate-file /path/to/cert.pem

NAME        VERSION DATASETS MODELS DEPENDENCIES
demo        v2      2        1      0
another_pod v2      3        0      1
```
