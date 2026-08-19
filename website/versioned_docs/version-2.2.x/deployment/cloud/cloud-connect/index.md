---
title: 'Cloud Connect'
sidebar_label: 'Cloud Connect'
description: 'Connect a self-hosted Spice instance to Spice Cloud for remote management.'
keywords: [spice.ai, cloud connect, enrollment key, remote management]
sidebar_position: 1
tags:
  - deployment
  - cloud-connect
  - spiceai
---

Cloud Connect attaches a self-hosted Spice instance to the Spice Cloud Platform, where it can be monitored and configured from the portal. The data stays on the host that runs the instance.

The instance dials out to Spice Cloud. Spice Cloud never opens an inbound connection to it.

## Connection methods

| Method                          | The instance runs                      | Command                         |
| ------------------------------- | -------------------------------------- | ------------------------------- |
| [Development](./development.md) | in the terminal that started it        | `spice connect`                 |
| [Service](./service.md)         | as a Linux or macOS service            | `spice connect service install` |
| [Headless](./headless.md)       | in a container or under any supervisor | `spiced --token <key>`          |

Windows has no managed service. A Windows host runs the instance with `spice connect` or under its own supervisor.

## Instance directory

Cloud Connect state belongs to an instance directory, not to the host: the issued identity lives at `<dir>/.spice/identity.json`. The directory defaults to the working directory, and `--dir` selects another one.

```shell
spice connect status --dir /srv/edge-analytics
```

`SPICE_CONFIG_DIR` replaces the derived path entirely and takes precedence over `--dir`, which is how a container places the identity on a mounted volume.

An enrolled directory reconnects on its own. A later `spice run` or `spiced` started there connects with no Cloud Connect flag.

:::warning
An identity expires after 30 days offline. An instance that has been down longer must enroll again.
:::

## Authentication

Two credentials can enroll an instance:

- **A Spice Cloud login**, used by `spice connect`. It requires the owner or admin role in the organization, and it is the only path that also creates the instance's project.
- **An enrollment key**, minted at [spice.ai/connect](https://spice.ai/connect) and passed to `spiced --token`. A key enrolls exactly one instance and creates no project; the runtime log carries a portal link for that.

A key is shown once and is never recoverable from Spice Cloud. What restarts an instance is the issued identity under `<dir>/.spice`, which belongs on persistent storage.

## Deployments and restarts

A deployment from the portal reconciles into the running process; it never restarts the instance. These sections apply while it serves:

- `datasets`
- `views`
- `models`
- `functions`
- added `catalogs`

Every other section is read only when the runtime starts, as is a removed catalog. The runtime names the pending sections as it applies the deployment, and the project in Spice Cloud reports the same set:

```text
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 1 models, 0 catalogs, 2 views); runtime, tools takes effect when this instance next starts
```

Whatever owns the process performs the restart: `spice connect service restart` for a service, a stop and a fresh `spice connect` in a terminal, or a recreated container or pod.

## Removing an instance

`spice connect remove` deletes the instance's project in Spice Cloud, uninstalls its service, and clears the local identity. It refuses while the instance is running.

`spice connect service uninstall` is the narrower operation: it removes the service and keeps the Cloud identity, so a later install resumes the same enrollment.
