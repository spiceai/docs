---
title: "status"
sidebar_label: "status"
pagination_prev: null
pagination_next: null
---
Spice runtime status

### Usage
```shell
spice status [flags]
```

#### Flags:
  - `-h`, `--help`   help for status

### Examples:
```shell 
>>> spice status

NAME          ENDPOINT        STATUS
http          127.0.0.1:3000  Ready
flight        127.0.0.1:50051 Ready
metrics       N/A             Disabled
opentelemetry 127.0.0.1:50052 Ready
```