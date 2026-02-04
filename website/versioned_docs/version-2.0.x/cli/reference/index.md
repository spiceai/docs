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

| Command                              | Description                                                            |
| ------------------------------------ | ---------------------------------------------------------------------- |
| [add](reference/add)                 | Add Pod - adds a pod to the project                                    |
| [catalogs](reference/catalogs)       | List [catalogs](../components/catalogs) loaded by the Spice runtime    |
| [completion](reference/completion)   | Generate the autocompletion script for the specified shell             |
| [dataset](reference/dataset)         | Dataset operations                                                     |
| [datasets](reference/datasets)       | Lists datasets loaded by the Spice runtime                             |
| help                                 | Help about any command                                                 |
| [init](reference/init)               | Initialize Pod - initializes a new pod in the project                  |
| [login](reference/login)             | Login to the Spice.ai Platform                                         |
| [models](reference/models)           | Lists models loaded by the Spice runtime                               |
| [pods](reference/pods)               | Lists Spicepods loaded by the Spice runtime                            |
| [refresh](reference/refresh)         | Refreshes an accelerated dataset loaded by the Spice runtime           |
| [run](reference/run)                 | Run Spice - starts the Spice runtime, installing if necessary          |
| [search](reference/search)           | Perform embeddings-based searches across                               |
| [sql](reference/sql)                 | Start an interactive SQL query session against the Spice runtime       |
| [status](reference/status)           | Spice runtime status                                                   |
| [upgrade](reference/upgrade)         | Upgrades the Spice CLI to the latest release                           |
| [version](reference/version)         | Spice CLI version                                                      |

### Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message
