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
| [Development](./development.md) | in the terminal that started it        | `spice cloud link`, then `spice run` |
| [Service](./service.md)         | as a Linux or macOS service            | `spice cloud service install`   |
| [Headless](./headless.md)       | in a container or under any supervisor | `spiced --token <key>`          |

Windows has no managed service. A Windows host runs the instance with `spice run` or under its own supervisor.

## Instance directory

Cloud Connect state belongs to an instance directory, not to the host: the issued identity lives at `<dir>/.spice/identity.json`. Commands act on the directory they run from.

```shell
cd /srv/edge-analytics
spice cloud status
```

`SPICE_CONFIG_DIR` replaces the derived path entirely, which is how a container places the identity on a mounted volume.

An enrolled directory reconnects on its own. A later `spice run` or `spiced` started there connects with no Cloud Connect flag.

:::warning
An identity expires after 30 days offline. An instance that has been down longer must enroll again.
:::

## Authentication

Two credentials can enroll an instance:

- **A Spice Cloud login**, used by `spice cloud link`. It requires the owner or admin role in the organization, and attaches the instance to a project that already exists — `spice cloud project create <name>` creates one.
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

Whatever owns the process performs the restart: `spice cloud service restart` for a service, a stop and a fresh `spice run` in a terminal, or a recreated container or pod.

## Which Spicepod an instance serves

An enrolled instance serves **one** Spicepod, and after its first deployment that is the deployed one — not the local `spicepod.yaml` in the instance directory. The runtime says which at startup:

| State | What is served | Startup log |
| --- | --- | --- |
| A deployment has landed | The deployed Spicepod. A local `spicepod.yaml` sitting beside it is **not read**. | Warns that the local file is ignored, naming both paths. |
| No deployment yet | The local `spicepod.yaml`, until the first deployment replaces it. | Warns that Spice Cloud will replace that Spicepod on the next deployment. |
| Neither | Nothing — the runtime still starts and stays reachable so a deployment can land. | Logs that no Spicepod was found. |

The consequence to plan for: anything that exists **only** in the local file stops being served the moment the first deployment lands. A view added to the project's Spicepod in Spice Cloud that reads a dataset defined only locally therefore never resolves — the runtime warns that the view's dependent table does not exist, because the deployed manifest has no such dataset. Copy the local datasets into the project's Spicepod before deploying, and from then on edit the project's Spicepod in Spice Cloud rather than the local file.

For the same reason `--pods-watcher-enabled` is ignored on an instance serving a deployed Spicepod, and the runtime says so: watching the local `spicepod.yaml` would replace the deployed configuration while the instance kept reporting the deployment as applied.

## Removing an instance

`spice cloud unlink` releases the instance in Spice Cloud, uninstalls its service, and clears the local identity. It refuses while the instance is running, and it leaves the project in place — delete that with `spice cloud project delete <org>/<project>`.

`spice cloud service uninstall` is the narrower operation: it removes the service and keeps the Cloud identity, so a later install resumes the same enrollment.
