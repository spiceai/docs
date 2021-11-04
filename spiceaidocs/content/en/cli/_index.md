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
| spice upgrade | Upgrade the CLI to latest version          |

See [Spice.ai CLI command reference]({{<ref "cli/reference">}}) for the full list of available commands.

## Updating

To update to latest CLI, run the upgrade command.

```bash
spice upgrade
```
<div class="card">
    <div class="card-body">
        <h5 class="card-title"><b>Note</b></h5>
        <p class="card-text">Upgrade command is supported from CLI v0.3.1. For version < 0.3.1 users have to re-run the <a href='{{<ref "cli/#install">}}' 
        class="stretched-link"> install</a> script.</p>
    </div>
</div>



## Uninstall

The Spice.ai CLI is installed by default to `$HOME/.spice/bin/spice` and a line added to the shell config, such as `.zshrc`

It can be uninstalled by deleting the `spice` binary and removing the PATH addition from the rc file.

Find all of the Docker images that were installed by running:

```bash
docker image ls -f reference="ghcr.io/spiceai/*"
```
