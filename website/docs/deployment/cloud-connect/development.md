---
title: 'Cloud Connect on a Development Machine'
sidebar_label: 'Development machine'
description: 'Connect a development machine to Spice Cloud and run the instance in the foreground.'
keywords: [spice.ai, cloud connect, spice connect, development]
sidebar_position: 1
tags:
  - deployment
  - cloud-connect
  - spiceai
---

Use `spice connect` to enroll an instance and run it in the current terminal. This method supports Linux, macOS, and Windows.

## Prerequisites

- Install the [Spice CLI](../../installation.md).
- Get the owner or admin role in a Spice Cloud organization.

You do not have to run `spice login` first.

## Connect

Run the command from the directory for the instance:

```shell
mkdir -p ~/work/retail-analytics
cd ~/work/retail-analytics
spice connect
```

If necessary, the command asks you to log in. Select an organization and enter a project name. The command then enrolls the instance and starts the runtime.

If you cannot use your login, get an [enrollment key](https://spice.ai/connect). Then select **Use an enrollment key**. This method enrolls the instance but does not create a project. Use the portal link in the output to create the project.

Press `Ctrl-C` to stop the runtime.

## Reconnect

The Cloud identity stays in the instance directory. Run one of these commands from the same directory:

```shell
spice run
spiced
spice connect
```

Each command uses the existing identity. It does not enroll a new instance.

## Apply a deployment

Deploy a Spicepod from the Spice Cloud portal. Cloud Connect applies supported changes to the running instance. Some changes require a restart.

When a deployment changes a section that only a start reads, the runtime names those sections in its output:

```text
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 0 models, 0 catalogs, 1 views); runtime takes effect when this instance next starts
```

The project in Spice Cloud reports the same pending sections. To apply them, press `Ctrl-C` and run `spice connect` again.

For more information, see [Deployments and restarts](./index.md#deployments-and-restarts).

## Remove the instance

Stop the runtime. Then run:

```shell
spice connect remove
```

Use `--force` only if Spice Cloud cannot remove an instance that was already deleted in the portal. This option removes only the local state.

## Next steps

- [Run Cloud Connect as a service](./service.md)
- [Run Cloud Connect without an interactive terminal](./headless.md)
- [`spice connect` command reference](../../cli/reference/connect.md)
