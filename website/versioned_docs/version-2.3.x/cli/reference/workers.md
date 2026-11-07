---
title: "workers"
sidebar_label: "workers"
pagination_prev: null
pagination_next: null
---

Lists the [workers](../../features/workers) loaded by the Spice runtime

### Usage

```shell
spice workers [flags]
```

#### Flags

- `--tls-root-certificate-file`   The path to the root certificate file used to verify the Spice.ai runtime server certificate
- `-o`, `--output <format>` Output format: `table` (default) or `json`.
- `-h`, `--help`   help for workers

### Output

The command reads `GET /v1/workers` from the runtime. The table has one row per worker, with the columns `NAME`, `IS_LLM` (whether the worker can be called as a model), and `DESCRIPTION`. With `-o json`, the command prints the workers as a JSON array of objects with `name`, `description`, `is_llm`, and `status`. An unset `description` or `status` is left out.

### Examples

```shell
spice workers
spice workers -o json
```
