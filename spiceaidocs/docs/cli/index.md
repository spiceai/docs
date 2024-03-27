---
title: 'Spice.ai OSS CLI documentation'
sidebar_label: 'CLI'
description: 'Detailed documentation on the Spice.ai OSS CLI'
sidebar_position: 9
---

The Spice.ai OSS CLI is a set of commands to create and manage spicepods and interact with the Spice runtime.

## Install

The Spice CLI can be installed by:

- Running `curl https://install.spiceai.org | /bin/bash`
- Downloading the binary from [GitHub Releases](https://github.com/spiceai/spiceai/releases)

The `spice` program will be added to the PATH automatically for **bash**, **fish**, and **zsh** shells.

After installing the Spice CLI for the first time, ensure you've got the correct version by running `spice version`. The Runtime version is not expected to be shown, as the runtime will be downloaded and installed automatically upon first run.

## Getting started

For getting started with Spice using the Spice CLI, see the [Getting Started Guide](/getting-started).

Use `spice help` for all commands and `spice [command] --help` for more information about a command.

A typical command-line workflow might be as follows:

```bash
# Start the runtime
spice run
```

Run new shell in the same folder:

```bash
# Init new app
spice init spice_app

# Add the Quickstart Spicepod
spice add spiceai/quickstart

```

Common commands are:

| Command       | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| spice add     | Add Pod - adds a pod to the project                           |
| spice run     | Run Spice - starts the Spice runtime, installing if necessary |
| spice version | Spice CLI version                                             |
| spice help    | Help about any command                                        |
| spice upgrade | Upgrades the Spice CLI to the latest release                  |

See [Spice CLI command reference](/cli/reference) for the full list of available commands.

## Updating

To update to latest CLI, run the upgrade command.

```bash
spice upgrade
```

:::note
Upgrade command is supported from CLI v0.3.1. For version < 0.3.1 users have to re-run the [install](/cli#install) script.
:::

## Uninstall

The Spice CLI is installed by default to `$HOME/.spice/bin/spice` and a line added to the shell config, such as `.zshrc`

It can be uninstalled by deleting the `spice` binary and removing the PATH addition from the rc file.
