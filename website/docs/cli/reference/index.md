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
| [catalogs](reference/catalogs)     | List [catalogs](../../components/catalogs) loaded by the Spice runtime |
| [chat](reference/chat)             | Chat with an LLM                                                       |
| [completions](reference/completions) | Generate shell completions for the Spice CLI                         |
| cloud                              | Manage Spice Cloud resources                                           |
| cluster                            | Cluster operations for the Spice runtime                               |
| [connect](reference/connect)       | Connect to a Spice.ai Cloud Platform app                               |
| [dataset](reference/dataset)       | Dataset operations (configure datasets)                                |
| [datasets](reference/datasets)     | Lists datasets loaded by the Spice runtime                             |
| help                               | Help about any command                                                 |
| [init](reference/init)             | Initialize Spice app - creates a new spicepod.yaml                     |
| [install](reference/install)       | Install or reinstall the Spice.ai runtime                              |
| [login](reference/login)           | Login to Spice.ai or configure credentials for data sources            |
| [models](reference/models)         | Lists models loaded by the Spice runtime                               |
| nsql                               | Text-to-SQL REPL - translate natural language to SQL                   |
| [pods](reference/pods)             | Lists Spicepods loaded by the Spice runtime                            |
| [query](reference/query)           | Submit an async query or start an interactive async query REPL         |
| [refresh](reference/refresh)       | Refresh a dataset loaded by the Spice runtime                          |
| [run](reference/run)               | Run Spice - starts the Spice runtime, installing if necessary          |
| [search](reference/search)         | Search datasets with embeddings                                        |
| [sql](reference/sql)               | Start an interactive SQL query session against the Spice runtime       |
| [status](reference/status)         | Spice runtime status                                                   |
| [trace](reference/trace)           | Return traces for operations that occurred in Spice                    |
| [upgrade](reference/upgrade)       | Upgrades the Spice CLI and runtime to the latest release               |
| [version](reference/version)       | Spice CLI version                                                      |
| workers                            | Lists workers loaded by the Spice runtime                              |

### Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message
