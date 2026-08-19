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

`spice connect` enrolls an instance and runs it in the terminal that started it. This method works on Linux, macOS, and Windows.

## Prerequisites

- The [Spice CLI](../../../installation.md).
- The owner or admin role in a Spice Cloud organization. A `member` cannot enroll an instance.

A prior `spice login` is optional — `spice connect` runs the login inline when there is no saved session.

## Connecting

The directory the command runs from is the instance:

```shell
mkdir -p ~/work/retail-analytics
cd ~/work/retail-analytics
spice connect
```

The flow authenticates, resolves an organization, proposes a project name derived from the directory, enrolls the instance, and starts the runtime. `Ctrl-C` stops it.

An [enrollment key](https://spice.ai/connect) is the alternative when a login cannot enroll into the wanted organization. The **Use an enrollment key** choice takes one; an instance enrolled that way is connected but unattached, and the portal link in the output creates its project.

## Reconnecting

The identity stays in the instance directory, so any of these reconnect the same instance from there rather than enrolling a second one:

```shell
spice run
spiced
spice connect
```

## Applying a deployment

A deployment from the portal reconciles into the running process. When it changes a section that only a start reads, the runtime names those sections and keeps serving the configuration it already has:

```text
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 0 models, 0 catalogs, 1 views); runtime takes effect when this instance next starts
```

The project in Spice Cloud reports the same pending set. In a terminal, `Ctrl-C` followed by `spice connect` is what applies it. See [Deployments and restarts](./index.md#deployments-and-restarts).

## Removing the instance

`spice connect remove` deletes the project and clears the local identity, and refuses while the runtime is running:

```shell
spice connect remove
```

`--force` clears only this host's state, for an instance already deleted in the portal. It is a recovery path, not a faster one.

## Next steps

- [Run Cloud Connect as a service](./service.md)
- [Run Cloud Connect without an interactive terminal](./headless.md)
- [`spice connect` command reference](../../../cli/reference/connect.md)
