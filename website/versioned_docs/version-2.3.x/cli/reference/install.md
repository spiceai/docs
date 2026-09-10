---
title: "install"
sidebar_label: "install"
pagination_prev: null
pagination_next: null
---
Download and install the latest version of the Spice runtime.

### Usage

```shell
spice install [flavor] [flags]
```

#### flavor

- ``     Install the core runtime that only includes data components
- `cuda` Install the runtime with CUDA GPU acceleration

Metal/CUDA acceleration is auto-detected by default.

#### Flags

- `-h`, `--help`   Print this help message
- `-f`, `--force`  Force installation of the latest released runtime

### Examples

```shell
spice install
```

### Additional Example

```shell
spice install cuda
```
