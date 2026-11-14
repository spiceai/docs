---
title: "install"
sidebar_label: "install"
pagination_prev: null
pagination_next: null
---
Install or reinstall the Spice runtime.

### Usage

```shell
spice install [version] [flavor] [flags]
```

#### version

A release to install, such as `v1.8.3`. Without a version, the latest release is installed.

#### flavor

- ``     Install the core runtime that only includes data components
- `cuda` Install the runtime with CUDA GPU acceleration (Linux only)

Metal/CUDA acceleration is auto-detected by default.

#### Flags

- `-h`, `--help`   Print this help message
- `-f`, `--force`  Install even if the requested runtime is already installed

### Examples

```shell
spice install
```

### Additional Examples

```shell
spice install cuda
```

```shell
spice install v1.8.3
```
