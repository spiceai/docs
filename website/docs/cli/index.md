---
title: 'Spice.ai CLI Reference'
sidebar_label: 'CLI'
description: 'Complete CLI reference for Spice.ai including commands to create, manage Spicepods, run queries, and interact with the Spice runtime.'
keywords: [spice.ai, cli, command line, spicepod, spice run, spice sql, spice add]
image: /img/og/spiceai.png
sidebar_position: 13
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Spice CLI is a set of commands to create and manage Spicepods and interact with the Spice runtime.

## Install

The Spice CLI can be installed by:

<Tabs>
  <TabItem value="default" label="macOS, Linux, and WSL" default>
    - Running `curl https://install.spiceai.org | /bin/bash`
    - Using `brew`: `brew install spiceai/spiceai/spice`
    - Downloading the binary from [GitHub Releases](https://github.com/spiceai/spiceai/releases)
  </TabItem>
  <TabItem value="windows" label="Windows" default>
    - Shell command
        ```bash
        curl -L "https://install.spiceai.org/Install.ps1" -o Install.ps1 && PowerShell -ExecutionPolicy Bypass -File ./Install.ps1
        ```
    - Downloading the binary from [GitHub Releases](https://github.com/spiceai/spiceai/releases)
  </TabItem>
</Tabs>

The `spice` program will be added to the PATH automatically for **bash**, **fish**, and **zsh** shells.

After installing the Spice CLI for the first time, verify the installation by running `spice version`. Expected output:

```console
CLI version:     1.x.x
Runtime version: (not installed)
```

The runtime is downloaded and installed automatically upon first run of `spice run`.

## Getting started

For getting started with Spice using the Spice CLI, see the [Getting Started Guide](../getting-started).

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

| Command         | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| `spice run`     | Start the Spice runtime, installing if necessary                 |
| `spice sql`     | Open an interactive SQL REPL connected to the running runtime    |
| `spice chat`    | Open an interactive chat REPL for AI model conversations         |
| `spice init`    | Initialize a new Spice app with a `spicepod.yaml`                |
| `spice add`     | Add a Spicepod dependency to the project                         |
| `spice login`   | Log in to Spice.ai Cloud Platform or other data sources          |
| `spice trace`   | Inspect traces for AI chat, SQL queries, and other runtime tasks |
| `spice version` | Display CLI and runtime versions                                 |
| `spice upgrade` | Upgrade the Spice CLI to the latest release                      |
| `spice help`    | Display help for any command                                     |

See [Spice CLI command reference](./reference) for the full list of available commands.

## Direct Command Shortcuts

For quick scripting and shell workflows, the CLI accepts top-level shortcuts that skip the subcommand name:

| Shortcut                | Equivalent                          | Description                            |
| ----------------------- | ----------------------------------- | -------------------------------------- |
| `spice -sql <query>`    | `spice sql --query <query>`         | Run a single SQL statement and exit.   |
| `spice -p <prompt>`     | `spice chat <prompt>` (one-shot)    | Send a single chat prompt and exit.    |
| `spice -chat <prompt>`  | `spice chat <prompt>` (one-shot)    | Alias for `-p`.                        |

The shortcut consumes the first non-flag argument as the value; any other flags (including global flags such as `--cloud`, `--api-key`, `--endpoint`, and `--machine`) are forwarded to the underlying command. Use `--` to terminate flag parsing when the prompt or query begins with a `-`.

```bash
# One-shot SQL against the local runtime
spice -sql "select count(*) from taxi_trips"

# One-shot chat prompt
spice -p "summarize the orders table"

# Same against Spice.ai Cloud
spice --cloud --api-key $SPICE_KEY -sql "select 1"
```

## Machine-readable Mode

Pass `--machine` (alias `--programmatic`) as a global flag to make the CLI output JSON wherever supported and emit structured JSON for errors. This is intended for LLM agents, CI scripts, and other automation that needs to parse `spice` output reliably.

```bash
# Default human output
spice version

# Same command, JSON output for automation
spice --machine version

# Works with subcommands
spice --machine status
spice --machine query list
spice --machine cloud secrets list

# Combine with direct shortcuts
spice --machine -sql "select 1"
```

`--machine` is global and may appear before or after the subcommand (`spice status --machine` is also valid). When set, mutating commands that support JSON output also default to JSON, and clap parsing errors are emitted as JSON to stderr.

## Updating

To update to latest CLI, run the upgrade command.

```bash
spice upgrade
```

:::note
Upgrade command is supported from CLI v0.3.1. For version < 0.3.1 users have to re-run the [install](#install) script.
:::

## Uninstall

The Spice CLI is installed by default to `$HOME/.spice/bin/spice` and a line added to the shell config, such as `.zshrc`

It can be uninstalled by deleting the `spice` binary and removing the PATH addition from the rc file.
