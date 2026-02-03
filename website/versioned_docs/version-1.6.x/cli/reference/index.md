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

| Command                                            | Description                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------|
| [add](./add)               | Add Pod - adds a pod to the project                                 |
| [catalogs](./catalogs)     | List [catalogs](../../components/catalogs) loaded by the Spice runtime   |
| [completion](./completion) | Generate the autocompletion script for the specified shell          |
| [dataset](./dataset)       | Dataset operations                                                  |
| [datasets](./datasets)     | Lists datasets loaded by the Spice runtime                          |
| help                                               | Help about any command                                              |
| [init](./init)             | Initialize Pod - initializes a new pod in the project               |
| [login](./login)           | Login to the Spice.ai Platform                                                  |
| [models](./models)         | Lists models loaded by the Spice runtime                            |
| [pods](./pods)             | Lists Spicepods loaded by the Spice runtime                         |
| [refresh](./refresh)       | Refreshes an accelerated dataset loaded by the Spice runtime          |
| [run](./run)               | Run Spice - starts the Spice runtime, installing if necessary |
| [search](./search)         | Perform embeddings-based searches across |
| [sql](./sql)               | Start an interactive SQL query session against the Spice runtime |
| [status](./status)         | Spice runtime status                                                |
| [upgrade](./upgrade)       | Upgrades the Spice CLI to the latest release                        |
| [version](./version)       | Spice CLI version                                                   |

### Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message
