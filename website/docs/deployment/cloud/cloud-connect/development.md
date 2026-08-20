---
title: 'Cloud Connect on a Development Machine'
sidebar_label: 'Development machine'
description: 'Connect a development machine to Spice Cloud and run the instance in the foreground.'
keywords: [spice.ai, cloud connect, spice cloud link, development]
sidebar_position: 1
tags:
  - deployment
  - cloud-connect
  - spiceai
---

`spice cloud link` enrolls an instance and attaches it to a project. `spice run` then runs it in the terminal that started it. This method works on Linux, macOS, and Windows.

## Prerequisites

- The [Spice CLI](../../../installation.md).
- The owner or admin role in a Spice Cloud organization. A `member` cannot enroll an instance.
- A project in that organization. `spice cloud link` attaches to a project that already exists; create one in the Spice Cloud portal.

Log in first. `spice cloud link` needs a Spice Cloud user session and does not create one:

```shell
spice cloud login
```

## Connecting

The directory the command runs from is the instance:

```shell
mkdir -p ~/work/retail-analytics
cd ~/work/retail-analytics
spice cloud link acme/retail-analytics
spice run
```

`spice cloud link` enrolls the directory and attaches it to the named project. Omit the argument to choose from the projects available to you. Either way it needs an interactive terminal.

`link` does not start the runtime; `spice run` does, and `Ctrl-C` stops it.

An [enrollment key](https://spice.ai/connect) is the alternative when a login cannot enroll into the wanted organization, or when there is no interactive terminal. Pass it to `spiced --token`; an instance enrolled that way is connected but unattached, and the portal link in the output creates its project. See [Headless Cloud Connect](./headless.md).

## Reconnecting

The identity stays in the instance directory, so any of these reconnect the same instance from there rather than enrolling a second one:

```shell
spice run
spiced
```

## Applying a deployment

A deployment from the portal reconciles into the running process. When it changes a section that only a start reads, the runtime names those sections and keeps serving the configuration it already has:

```text
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 0 models, 0 catalogs, 1 views); runtime takes effect when this instance next starts
```

The project in Spice Cloud reports the same pending set. In a terminal, `Ctrl-C` followed by `spice run` is what applies it. See [Deployments and restarts](./index.md#deployments-and-restarts).

## Removing the instance

`spice cloud unlink` releases the instance and clears the local identity, and refuses while the runtime is running:

```shell
spice cloud unlink
```

The project stays. Delete it from the Spice Cloud portal, or with `spice cloud project delete <org>/<project>`.

## Next steps

- [Run Cloud Connect as a service](./service.md)
- [Run Cloud Connect without an interactive terminal](./headless.md)
- [`spice cloud` command reference](../../../cli/reference/cloud.md)
