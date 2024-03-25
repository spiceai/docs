---
type: docs
title: "Spice.ai CLI command reference"
linkTitle: "Spice.ai CLI command reference"
weight: 60
description: "Spice.ai CLI command reference"
---

# spice

## Usage

```bash
spice [command] [--help]
```

## Full Command Reference

| Command                                            | Description                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------|
| [add]({{<ref "cli/reference/add">}})               | Add Pod - adds a pod to the project                                 |
| [completion]({{<ref "cli/reference/completion">}}) | Generate the autocompletion script for the specified shell          |
| [dataset]({{<ref "cli/reference/dataset">}})       | Dataset operations                                                  |
| [datasets]({{<ref "cli/reference/datasets">}})     | Lists datasets loaded by the Spice runtime                          |
| help                                               | Help about any command                                              |
| [init]({{<ref "cli/reference/init">}})             | Initialize Pod - initializes a new pod in the project               |
| [login]({{<ref "cli/reference/login">}})           | Login to Spice.ai                                                   |
| [models]({{<ref "cli/reference/models">}})         | Lists models loaded by the Spice runtime                            |
| [pods]({{<ref "cli/reference/pods">}})             | Lists Spicepods loaded by the Spice runtime                         |
| [run]({{<ref "cli/reference/run">}})               | Run Spice.ai - starts the Spice.ai runtime, installing if necessary |
| [sql]({{<ref "cli/reference/sql">}})               | Start an interactive SQL query session against the Spice.ai runtime |
| [status]({{<ref "cli/reference/status">}})         | Spice runtime status                                                |
| [upgrade]({{<ref "cli/reference/upgrade">}})       | Upgrades the Spice CLI to the latest release                        |
| [version]({{<ref "cli/reference/version">}})       | Spice CLI version                                                   |

## Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message