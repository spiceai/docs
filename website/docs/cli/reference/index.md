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

| Command                       | Description                                                             |
| ----------------------------- | ----------------------------------------------------------------------- |
| [add](./add.md)               | Add Pod - adds a pod to the project                                     |
| [catalogs](./catalogs.md)     | List [catalogs](../../components/catalogs/) loaded by the Spice runtime |
| [completion](./completion.md) | Generate the autocompletion script for the specified shell              |
| [dataset](./dataset.md)       | Dataset operations                                                      |
| [datasets](./datasets.md)     | Lists datasets loaded by the Spice runtime                              |
| help                          | Help about any command                                                  |
| [init](./init.md)             | Initialize Pod - initializes a new pod in the project                   |
| [login](./login.md)           | Login to the Spice.ai Platform                                          |
| [models](./models.md)         | Lists models loaded by the Spice runtime                                |
| [pods](./pods.md)             | Lists Spicepods loaded by the Spice runtime                             |
| [refresh](./refresh.md)       | Refreshes an accelerated dataset loaded by the Spice runtime            |
| [run](./run.md)               | Run Spice - starts the Spice runtime, installing if necessary           |
| [search](./search.md)         | Perform embeddings-based searches across                                |
| [sql](./sql.md)               | Start an interactive SQL query session against the Spice runtime        |
| [status](./status.md)         | Spice runtime status                                                    |
| [upgrade](./upgrade.md)       | Upgrades the Spice CLI to the latest release                            |
| [version](./version.md)       | Spice CLI version                                                       |

### Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message
