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

| Command                 | Description                                     |
| ----------------------- | ----------------------------------------------- |
| spice action            | Manage actions                                  |
| spice add               | Add a pod to `spicepods`                        |
| [spice export](#Export) | Export a pod                                    |
| [spice import](#Import) | Import a pod                                    |
| spice init              | Initialize a new pod                            |
| spice reward            | Manages rewards                                 |
| [spice run](#Run)       | Starts the Spice.ai runtime                     |
| [spice train](#Train)   | Starts a pod training run                       |
| spice version           | Shows the Spice.ai CLI and runtime versions     |
| spice help              | Help about any command                          |
| spice completion        | Generates the autocompletion script for a shell |
| spice pods list         | Retrieve pods currently loaded in the runtime   |
| spice upgrade           | Upgrade CLI to the latest version               |

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
