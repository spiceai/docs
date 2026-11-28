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

Cloud Connect state belongs to an instance directory, not to the host: the issued identity lives at `<dir>/.spice/cloud-connect/identity.json`. Commands act on the directory they run from.

```shell
cd /srv/edge-analytics
spice cloud status
```

`SPICE_CONFIG_DIR` replaces the derived path entirely, which is how a container places the identity on a mounted volume.

### State directory

Every file Cloud Connect keeps is in `cloud-connect/` inside the config directory (`<dir>/.spice`, or `SPICE_CONFIG_DIR`): the identity, the delivered-secret cache, the persisted deployment, the enrollment draft, the endpoint override, the `spice cloud link` operation journals, and the service manifest. The config directory keeps `runtime.lock`. Spice creates `cloud-connect/` with mode `0700`, so only the account that runs the instance can add or replace files in it. The config directory itself may have any owner and mode, such as a Kubernetes `emptyDir`.

Before `spiced` reads any state file, before a `spice cloud` command changes the state, and when `spice cloud status` reads it, Spice checks `cloud-connect/`:

- A directory owned by this account and not writable by group or other accounts is used.
- A directory owned by this account that group or other accounts can write loses that write access, and Spice logs it once:

  ```
  INFO spiced::cloud_connect: Spice Cloud Connect removed group and other write access from its state directory '/srv/app/.spice/cloud-connect' (mode 0775 → 0755), so that only this account can add files there. See: https://spiceai.org/docs/cli/reference/cloud
  ```

- A directory owned by another account stops `spiced` before it reads a state file. A root-run `spiced` may use a directory owned by one other account when no other account can write to it. The error names the fix:

  ```
  ERROR spiced: Failed to start: the Spice Cloud Connect state directory '/srv/app/.spice/cloud-connect' is owned by user id 1001, not by this account (user id 1000), so that account could replace its deployment and identity files. Run `chown -R 1000 '/srv/app/.spice/cloud-connect'` as root, or set SPICE_CONFIG_DIR to a directory this account owns. See: https://spiceai.org/docs/cli/reference/cloud
  ```

- A symbolic link at `cloud-connect` is refused.

Cloud Connect state is kept on Linux and macOS only.

**Upgrading from v2.4.x.** v2.4.x and earlier keep these files directly in `.spice/`. The first `spiced` start, or the first `spice cloud` command that reads the state, moves them into `cloud-connect/`. A `spice` command moves nothing while a runtime holds the instance directory. Only regular files owned by this account or by the config directory's owner move, and a file already in `cloud-connect/` is kept. Any other entry, such as a symbolic link, is left in place and never read. Update any script or tool that reads `.spice/identity.json` or another state file directly to read it from `.spice/cloud-connect/`. The move is one-way: `spiced` and `spice` from v2.4.x and earlier read these files only from `.spice/`, so after the move they find no identity or deployment. Any newer `spice cloud` command that reads the state can make the move, including `spice cloud status` on a stopped instance. Upgrade `spice` and `spiced` together, including the binary an installed service runs, and back up the config directory before the first start of the new version, so a downgrade can restore it. A config directory owned by another account and writable by other accounts, that still holds state to move, stops `spiced` with an error that names the fix.

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

For the same reason `--pods-watcher-enabled` is ignored on every enrolled instance, including one still serving its local `spicepod.yaml` before its first deployment, so editing the local file does not reload the runtime: watching it would replace the deployed configuration while the instance kept reporting the deployment as applied. Because `spice run` passes this flag on every launch, the runtime records that it ignored the flag only at `debug` log level.

## Removing an instance

`spice cloud unlink` releases the instance in Spice Cloud, uninstalls its service, and clears the local identity. It refuses while the instance is running, and it leaves the project in place — delete that with `spice cloud project delete <org>/<project>`.

`spice cloud service uninstall` is the narrower operation: it removes the service and keeps the Cloud identity, so a later install resumes the same enrollment.

## Cookbook

- A cookbook recipe to connect a local Spice instance to Spice Cloud, deploy changes without restarting, deliver a secret, and restart the instance. [Cloud Connect on a Development Machine](https://github.com/spiceai/cookbook/tree/trunk/cloud-connect-dev#readme)
