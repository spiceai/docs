---
title: 'Cloud Connect'
sidebar_label: 'Cloud Connect'
description: 'Connect a self-hosted Spice instance to Spice Cloud for remote management — in the foreground, as a persistent service, or headless in a container.'
keywords:
  [spice.ai, cloud connect, enrollment key, remote management, spice connect, spiced --token]
sidebar_position: 7
tags:
  - deployment
  - cloud-connect
  - spiceai
---

Cloud Connect enrolls a self-hosted Spice instance with Spice Cloud so it can be monitored and configured from the portal while the data stays on your own host. The instance dials out to Spice Cloud; Spice Cloud never dials in.

Once connected, a project in the portal deploys Spicepods and secrets to the instance, and the instance reports its health, queries, and metrics back.

## The three ways to connect

Pick the one that matches the host. They differ in what owns the runtime process, and in whether the CLI can create the portal project for you.

| Mode                           | Command                         | The process is owned by                    | Project                                 |
| ------------------------------ | ------------------------------- | ------------------------------------------ | --------------------------------------- |
| [Foreground](./development.md) | `spice connect`                 | Your terminal — stops with `Ctrl-C`        | Created and attached for you            |
| [Service](./service.md)        | `spice connect service install` | systemd (Linux) or launchd (macOS)         | From the enrollment that preceded it    |
| [Headless](./headless.md)      | `spiced --token <key>`          | Docker, Kubernetes, or your own supervisor | Created by you in the portal afterwards |

:::info Platform support
The managed service lifecycle supports **Linux with systemd** and **macOS with launchd**, with one set of commands and one status vocabulary for both. On Windows, `spice connect service install|uninstall|start|stop|restart|logs` exits non-zero; only `spice connect service status` is available everywhere.

Boot persistence follows the service domain. A user service starts with its owner's login — on Linux it can also start at boot once the account lingers, while a macOS LaunchAgent cannot be made to start before a login at all — and `sudo spice connect service install` is what installs a service that starts at boot with nobody logged in. See [Boot persistence](./service.md#boot-persistence-stated-plainly).

On Windows, run the instance in the foreground with `spice connect`, or under your own supervisor. Containers use `spiced --token` under the container runtime's restart policy.
:::

## Enrollment is per directory

Cloud Connect state belongs to an **instance directory**, not to the host. The enrolled identity is written to `<dir>/.spice/identity.json`, and the directory defaults to the current directory:

```shell
cd ~/work/retail-analytics
spice connect
```

Because state is per directory, several instances can enroll independently on one host — use `--dir <path>` to act on one from elsewhere:

```shell
spice connect status --dir /srv/edge-analytics
```

`SPICE_CONFIG_DIR` overrides where that state is written, in full, and takes precedence over `--dir`. This is how containers put the identity on a mounted volume.

Once a directory holds an identity, it reconnects on its own. A later [`spice run`](../../cli/reference/run.md) or [`spiced`](../../cli/reference/spiced.md) started from that directory connects to Spice Cloud with no flag; a `spiced` with no identity never connects.

:::warning An instance directory is enrolled exactly once
`spice connect` never re-enrolls a directory that already has an identity, because that would register a second instance for one host. To release an instance and start over, use [`spice connect remove`](../../cli/reference/connect.md#remove).
:::

## Two ways to authenticate

**Log in (recommended).** `spice connect` uses your Spice Cloud login. It resolves the organizations your login can enroll into — those where you hold the **owner** or **admin** role — enrolls the instance, and creates and attaches a new project in one transaction. This is the only path that creates a project for you.

**Enrollment key.** An enrollment key is a single-use, short-lived, organization-scoped credential that enrolls exactly one instance. It authorizes enrollment, not project creation, so an instance enrolled with a key starts **unattached** and prints a portal link to create its project.

Keys are the only option on a host with no browser, no saved login, and no terminal — that is [headless enrollment](./headless.md) with `spiced --token`. They are also offered interactively as the second choice in `spice connect`, which prints and opens the portal page to mint one and then prompts for it without echo. Use that when your login cannot enroll into the organization you want — an owner or admin can hand you a key instead.

Keys are written `spice-enroll-…` and are shown once, in the portal. Spice never stores one on disk, never logs one, and never echoes one at a prompt.

:::danger One key enrolls one instance
A consumed key is not a restart credential. What restarts an instance is the **issued identity** under `<dir>/.spice` — keep that on persistent storage. Losing it means enrolling again with a fresh key.
:::

## Deployments never restart the instance

Deploying from the portal reconciles the new Spicepod into the running process. The instance keeps serving throughout — a deployment never terminates `spiced` and never triggers a service restart.

Some sections can only be read when the runtime starts. When a deployment changes one, the new Spicepod is persisted as desired state, the process keeps serving the configuration it already had, and the affected sections are named:

```text
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 1 models, 0 catalogs, 2 views); runtime, tools takes effect when this instance next starts
```

| Applied live                                                   | Takes effect at next start                                                                                                         |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `datasets`, `views`, `models`, `functions`, `catalogs` (added) | `runtime`, `secrets`, `tools`, `workers`, `extensions`, `embeddings`, `rerankers`, `management`, `snapshots`, `catalogs` (removed) |

The pending list is sticky: it stays visible until a start actually activates the desired configuration. Three surfaces read the same state:

```shell
spice connect status               # "restart:     required for runtime, tools"
spice connect status --output json # .deployment.restart_required
curl http://127.0.0.1:8090/v1/cloud-connect/status
# {"instance_id": "inst_0123456789", "restart_required": ["runtime", "tools"]}
```

On start, a connected instance serves the deployed Spicepod that Cloud Connect persisted under `<dir>/.spice`. If that Spicepod will not build, the runtime falls back to the local one; if neither builds, it starts with no app so the control plane can still reach it. An instance with no local Spicepod and no deployment yet is the same case — it waits for its first deployment.

Restarting is an explicit operator action:

- **Service** — `spice connect service restart`
- **Foreground** — `Ctrl-C`, then `spice connect` again
- **Container** — recreate the container or pod

`GET /v1/cloud-connect/status` is on the runtime's authenticated HTTP API. See [API authentication](../../api/auth/index.md).

## Checking state

[`spice connect status`](../../cli/reference/connect.md#status) is the one command that reports the connection, the service, and the deployment from a single snapshot:

```console
$ spice connect status
Spice Cloud Connect: connected — acme / retail-analytics
  instance:    inst_0123456789
  identity:    /srv/edge-analytics/.spice/identity.json
  gateway:     connect.aws.spiceai.io:443
  expiry:      unix=1800000000 (expired=false)
  service:     running (system service, systemd)
  starts:      at boot, without login
  owner:       alice
  directory:   /srv/edge-analytics
  definition:  /etc/systemd/system/spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service
  runtime:     /usr/local/lib/spice/edge-analytics-59e8c853e76c15ba/spiced
  logs:        systemd journal, unit spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service
  deployment:  /srv/edge-analytics/.spice/spicepod-cloud-managed.yml
  secrets:     2 delivered: pg_password, s3_key
  restart:     required for runtime, tools
  monitor:     https://spice.ai/acme/retail-analytics/monitor
```

`--output json` prints the same report as one JSON document and nothing else, for automation. `spice connect service status` is the same snapshot filtered to the service fields — identical field names and enum values, so nothing has to reconcile two schemas.

## Security

- The runtime never receives your login. A login authorizes enrollment and project creation; only the **issued instance identity** is persisted and used by the running instance.
- Enrollment keys are never written to disk, logs, telemetry, status output, or a generated service definition. Passing one on a command line does expose it to same-host process listings for the lifetime of that process — prefer a secret reference in containers, and recreate the container without the flag once the runtime is ready.
- Service definitions carry the minimum environment and no credential of any kind.
- Portal links contain identifiers only, never credentials.
- Delivered secret **names** appear in status; delivered secret **values** never leave the runtime process.

## Releasing an instance

[`spice connect remove`](../../cli/reference/connect.md#remove) is the destructive counterpart to connecting. It deletes the instance's project in Spice Cloud using your logged-in session, uninstalls the service if one is installed, and clears the local identity. Stop the instance first — removal refuses while `spiced` is running.

[`spice connect service uninstall`](./service.md#uninstall-the-service) is the narrower operation: it removes the service and keeps the Cloud identity, so `spice connect service install` resumes the same enrollment later.
