---
type: docs
title: "Spice.ai CLI documentation"
linkTitle: "CLI"
weight: 60
description: "Detailed documentation on the Spice.ai CLI"
---

The Spice.ai CLI is a set of commands to create and manage Spice.ai pods and interact with the Spice.ai runtime.

## Install

The Spice.ai CLI can be installed by:

- Running `curl https://install.spiceai.org | /bin/bash`
- Downloading the binary from [GitHub Releases](https://github.com/spiceai/spiceai/releases)

The `spice` program will be added to the PATH automatically for **bash**, **fish**, and **zsh** shells.

After installing the Spice.ai CLI for the first time, ensuring you've got the correct version by running `spice version`. The Runtime version is not expected to be shown, as the runtime will be downloaded and installed automatically upon first run.

## Getting started

For getting started with Spice.ai using the Spice.ai CLI, see the [Getting Started Guide]({{< ref getting-started >}}).

Use `spice help` for all commands and `spice [command] --help` for more information about a command.

A typical command-line workflow might be as follows:

```bash
# Start the runtime
spice run
```

In another terminal:

```bash
# Add a pod
spice add samples/gardener
# Re-train
spice train gardener
```

Common commands are:

| Command       | Description                                 |
| ------------- | ------------------------------------------- |
| spice add     | Add a pod to `spicepods`                    |
| spice run     | Starts the Spice.ai runtime                 |
| spice train   | Starts a pod training run                   |
| spice version | Shows the Spice.ai CLI and runtime versions |
| spice help    | Help about any command                      |

See [Spice.ai CLI command reference]({{<ref "cli/reference">}}) for the full list of available commands.

## Updating

To update the CLI, re-run the install script.

```bash
curl https://install.spiceai.org | /bin/bash
```

A future release will support a self-update command, see the [Spice.ai roadmap](https://github.com/spiceai/spiceai/blob/trunk/docs/ROADMAP.md) for more details.

## Uninstall

The Spice.ai CLI is installed by default to `$HOME/.spice/bin/spice` and a line added to the shell config, such as `.zshrc`

It can be uninstalled by deleting the `spice` binary and removing the PATH addition from the rc file.

Find all of the Docker images that were installed by running:

```bash
docker image ls -f reference="ghcr.io/spiceai/*"
```
