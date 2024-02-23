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

| Command     | Description                                                         |
| ----------- | --------------------------------------------------------------------|
| add         | Add Pod - adds a pod to the project                                 |
| completion  | Generate the autocompletion script for the specified shell          |
| dataset     | Dataset operations                                                  |
| help        | Help about any command                                              |
| init        | Initialize Pod - initializes a new pod in the project               |
| login       | Login to Spice.ai                                                   |
| pods        | Retrieve pods                                                       |
| run         | Run Spice.ai - starts the Spice.ai runtime, installing if necessary |
| sql         | Start an interactive SQL query session against the Spice.ai runtime |
| upgrade     | Upgrades the Spice CLI to the latest release                        |
| version     | Spice CLI version                                                   |

## Command Flags

All commands have a help flag **--help** or **-h** to print its usage documentation:

- **--help** | **-h** : Print the help message

### Export

```bash
spice export <podname> [--tag <tag>] [--overwrite] [--output <directory>]
```

- **--tag <tag>** : The tag to export the model from (default: "latest")
- **--overwrite** : Overwrite a file that already exists
- **--output <directory>** | **-o <directory>** : The output directory (default: ".")

### Import

```bash
spice import <podname> [--tag <tag>]
```

- **--tag <tag>** : Specify which tag to import the model to (default: "latest")

### Run

```bash
spice run [--context <context>]
```

- **--context <context>** : Runs Spice.ai in the given context, either 'docker' or 'metal' (default: "docker")

### Train

```bash
spice train [--context <context>] [--learning-algorithm <algorithm>]
```

- **--context <context>** : Runs Spice.ai in the given context, either 'docker' or 'metal' (default: "docker")
- **--learning-algorithm <algorithm>** : Train the pod with specified algorithm (default: "dql" or inherited from pod)
- **--loggers <loggers>**: Train the pod with the specified comma-seperated list of loggers

### Pods

```bash
spice pods list
```
