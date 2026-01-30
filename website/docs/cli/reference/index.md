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
| [add](../cli/reference/add.md)               | Add Pod - adds a pod to the project                                 |
| [catalogs](../cli/reference/catalogs.md)     | List [catalogs](../../components/catalogs/index.md) loaded by the Spice runtime   |
| [completion](../cli/reference/completion.md) | Generate the autocompletion script for the specified shell          |
| [dataset](../cli/reference/dataset.md)       | Dataset operations                                                  |
| [datasets](../cli/reference/datasets.md)     | Lists datasets loaded by the Spice runtime                          |
| help                                               | Help about any command                                              |
| [init](../cli/reference/init.md)             | Initialize Pod - initializes a new pod in the project               |
| [login](../cli/reference/login.md)           | Login to the Spice.ai Platform                                                  |
| [models](../cli/reference/models.md)         | Lists models loaded by the Spice runtime                            |
| [pods](../cli/reference/pods.md)             | Lists Spicepods loaded by the Spice runtime                         |
| [refresh](../cli/reference/refresh.md)       | Refreshes an accelerated dataset loaded by the Spice runtime          |
| [run](../cli/reference/run.md)               | Run Spice - starts the Spice runtime, installing if necessary |
| [search](../cli/reference/search.md)         | Perform embeddings-based searches across |
| [sql](../cli/reference/sql.md)               | Start an interactive SQL query session against the Spice runtime |
| [status](../cli/reference/status.md)         | Spice runtime status                                                |
| [upgrade](../cli/reference/upgrade.md)       | Upgrades the Spice CLI to the latest release                        |
| [version](../cli/reference/version.md)       | Spice CLI version                                                   |

### Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message
