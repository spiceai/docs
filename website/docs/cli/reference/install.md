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

- ``   Install the core runtime that only includes data components
- `ai` Install the AI-enabled runtime with both data components and AI components

#### Flags

- `-h`, `--help`   Print this help message
- `-c`, `--cpu`    Install the CPU accelerated version of the AI runtime
- `-f`, `--force`  Force installation of the latest released runtime

### Examples

```shell
spice install
```

### Additional Example

```shell
spice install ai --cpu
```
