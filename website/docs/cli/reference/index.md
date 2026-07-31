---
title: "Spice.ai OSS CLI command reference"
sidebar_label: "Spice CLI command reference"
description: "Spice CLI command reference"
pagination_next: null
---

## spice

### Usage

```bash
spice [command] [--help]
```

### Full Command Reference

| Command                            | Description                                                            |
| ---------------------------------- | ---------------------------------------------------------------------- |
| acceleration                       | Manage dataset acceleration features                                   |
| [add](reference/add)               | Add Spicepod - adds a Spicepod to the project                          |
| [catalogs](reference/catalogs)     | List [catalogs](../components/catalogs) loaded by the Spice runtime |
| [chat](reference/chat)             | Chat with an LLM                                                       |
| [completions](reference/completions) | Generate shell completions for the Spice CLI                         |
| cloud                              | Manage Spice Cloud resources                                           |
| cluster                            | Cluster operations for the Spice runtime                               |
| [connect](reference/connect)       | Enroll this host with Spice Cloud (Cloud Connect)                      |
| [dataset](reference/dataset)       | Dataset operations (configure datasets)                                |
| [datasets](reference/datasets)     | Lists datasets loaded by the Spice runtime                             |
| [feedback](reference/feedback)     | Open the Spice.ai community Slack to share feedback                    |
| help                               | Help about any command                                                 |
| [init](reference/init)             | Initialize Spice app - creates a new spicepod.yaml                     |
| [install](reference/install)       | Install or reinstall the Spice.ai runtime                              |
| [login](reference/login)           | Login to Spice.ai or configure credentials for data sources            |
| [models](reference/models)         | Lists models loaded by the Spice runtime                               |
| [nsql](reference/nsql)             | Text-to-SQL REPL - translate natural language to SQL                   |
| [pods](reference/pods)             | Lists Spicepods loaded by the Spice runtime                            |
| [query](reference/query)           | Submit an async query or start an interactive async query REPL         |
| [refresh](reference/refresh)       | Refresh a dataset loaded by the Spice runtime                          |
| [run](reference/run)               | Run Spice - starts the Spice runtime, installing if necessary          |
| [search](reference/search)         | Search datasets with embeddings                                        |
| [sql](reference/sql)               | Start an interactive SQL query session against the Spice runtime       |
| [spiced](reference/spiced)         | Spice runtime binary — direct invocation reference                     |
| [status](reference/status)         | Spice runtime status                                                   |
| [trace](reference/trace)           | Return traces for operations that occurred in Spice                    |
| [upgrade](reference/upgrade)       | Upgrades the Spice CLI and runtime to the latest or specified version   |
| [validate](reference/validate)     | Validate a spicepod.yaml without starting the runtime                  |
| [version](reference/version)       | Spice CLI version                                                      |
| workers                            | Lists workers loaded by the Spice runtime                              |

### Command Flags

The following flags are global — they are accepted by every command:

| Flag                            | Description                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `-h`, `--help`                  | Print the help message.                                                                                                              |
| `-v`, `--verbose`               | Increase log verbosity. `-v` for debug, `-vv` for trace.                                                                             |
| `--machine`                     | Machine-readable mode for LLMs and automation: prefer JSON output where supported, and always emit structured JSON errors. Alias: `--programmatic`. |
| `--api-key <key>`               | API key used to authenticate with the runtime or the Spice.ai Cloud Platform. Also read from the `SPICE_API_KEY` environment variable. |
| `--cloud`                       | Target the Spice.ai Cloud Platform instead of a local runtime. Requires `--api-key`.                                                  |
| `--cloud-region <region>`       | Spice.ai Cloud Platform runtime endpoint region, used with `--cloud`. Defaults to `us-east-1`.                                        |
| `--http-endpoint <endpoint>`    | HTTP endpoint of the Spice runtime to talk to. Defaults to `http://127.0.0.1:8090`.                                                  |
| `--tls-root-certificate-file <file>` | Path to a PEM root certificate used to verify the runtime's TLS server certificate.                                              |
