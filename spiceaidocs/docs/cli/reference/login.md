---
title: "login"
sidebar_label: "login"
pagination_prev: null
pagination_next: null
---

Login to the Spice.ai Platform, or other services with sub-commands.

### Usage:
```shell
spice login [command] [flags]
```

### Flags:
  - `-h`, `--help`         Print this help message
  - `-k`, `--key` string   API key (for spice.ai)

#### Available Commands:
  - `databricks`  Login to a Databricks instance
  - `dremio`      Login to a Dremio instance
  - `s3`          Login to a s3 storage

#### Examples:
```shell
spice login
```
