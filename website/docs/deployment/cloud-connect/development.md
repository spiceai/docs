---
title: 'Cloud Connect on a Development Machine'
sidebar_label: 'Development machine'
description: 'Connect a development machine to Spice Cloud with a single spice connect command, run the instance in the foreground, and reconnect later.'
keywords: [spice.ai, cloud connect, spice connect, development, foreground, spice run]
sidebar_position: 1
tags:
  - deployment
  - cloud-connect
  - spiceai
---

`spice connect` is the whole setup on a development machine. It authenticates, enrolls the directory, creates and attaches a project, and leaves the runtime serving in your terminal.

This is the fastest path on any host when you want the instance to live and die with your terminal, and it is the only path on **Windows**, which has no [managed service](./service.md). On Linux and macOS, install the managed service when the instance should outlive the terminal.

## Prerequisites

- The [Spice CLI](../../installation.md) installed.
- A Spice Cloud account with the **owner** or **admin** role in at least one organization. Those are the roles allowed to enroll an instance and create a project; a `member` cannot.

No prior `spice login` is needed — `spice connect` offers to log you in.

## Connect

The directory you run from is the instance. Name it for the project you want:

```shell
mkdir ~/work/retail-analytics
cd ~/work/retail-analytics
spice connect
```

With no saved login, `spice connect` offers two choices rather than failing:

```console
? Connect this directory to Spice Cloud ›
❯ Log in to Spice Cloud (recommended)
  Use an enrollment key
```

Choosing **Log in to Spice Cloud** runs the normal login flow in the same process and continues where it left off — there is no second command to run.

**Use an enrollment key** is the secondary path: it prints and opens a portal page to mint a key, then prompts for it without echo. Choose it when your login cannot enroll into the organization you want and an owner or admin gives you a key. An instance enrolled that way is connected but **not attached to a project** — the CLI prints a link to create one. `spice connect` also falls back to offering this path when your login is refused enrollment permission.

Next it resolves the organization. Organizations where your login is only a `member` are filtered out, because enrolling an instance requires the owner or admin role.

If exactly one is left, it is named before anything acts on it:

```console
Organization: acme (owner)
```

If several are left, you choose. `(default)` marks the organization set by `spice cloud org use`, if any; connecting an instance never changes that setting:

```console
? Organization ›
❯ acme (owner) (default)
  globex (admin)
```

Then it proposes a project name derived from the directory:

```console
? Project name › retail-analytics
```

The suggestion is the directory's final path component, lowercased, with runs of other characters collapsed to `-`. Accept it or type another. Names are 4–38 characters of lowercase letters, digits, and dashes, and cannot start or end with a dash. If the directory cannot produce a valid name, the CLI suggests one `<adjective>-spice` fallback instead.

If the name is already taken, the CLI says so and re-prompts with an editable `retail-analytics-2`. It never links your instance to the existing project — every project already has its own instance.

Finally the runtime starts in your terminal:

```console
Starting the Spice runtime. Press Ctrl-C to stop it.
...
INFO Spice Cloud Connect: connected to acme / retail-analytics
INFO Monitor: https://spice.ai/acme/retail-analytics/monitor
```

Open the monitor link to deploy a Spicepod to the instance from the portal.

## Stop and reconnect

`Ctrl-C` stops the runtime. It does **not** release the Cloud identity — the enrollment stays valid and the instance shows as offline in the portal.

To bring it back, start the runtime from the same directory. Any of these reconnect automatically, with no Cloud Connect flag:

```shell
cd ~/work/retail-analytics
spice run          # or: spiced, or: spice connect
```

`spice connect` is safe to re-run: an existing identity always wins, so it starts the instance rather than enrolling a second one.

## Deploy from the portal

Deployments are applied to the running process. The instance keeps serving while a deployment is applied — it is never restarted to pick one up.

A deployment that only adds or changes datasets, views, models, functions, or catalogs applies live:

```console
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 0 models, 0 catalogs, 0 views)
```

A deployment that changes a section only read at startup is persisted, and the terminal names exactly what is pending:

```console
INFO Spice Cloud Connect: applied the deployed spicepod (4 datasets, 0 models, 0 catalogs, 0 views); runtime takes effect when this instance next starts
```

The instance goes on serving its previous configuration. The pending list is sticky and readable at any time:

```shell
spice connect status
```

```console
  restart:     required for runtime
```

In the foreground there is no supervisor to do the restart: press `Ctrl-C` and run `spice connect` again. The pending list clears once the new start activates the deployed configuration.

## Check state

```shell
spice connect status
```

```console
Spice Cloud Connect: connected — acme / retail-analytics
  instance:    inst_0123456789
  identity:    /Users/alice/work/retail-analytics/.spice/identity.json
  gateway:     connect.aws.spiceai.io:443
  expiry:      unix=1800000000 (expired=false)
  service:     not_installed
  starts:      not started automatically
  logs:        not configured by this service definition
  deployment:  /Users/alice/work/retail-analytics/.spice/spicepod-cloud-managed.yml
  secrets:     none (the last deployment delivered no secrets)
  monitor:     https://spice.ai/acme/retail-analytics/monitor
```

`spice connect status --output json` prints the same report as JSON for scripting.

## Clean up

To release the instance — delete its project in Spice Cloud and clear the local identity:

```shell
# Stop the runtime first: removal refuses while spiced is running.
spice connect remove
```

```console
This will delete this instance's project in Spice Cloud and remove the instance from this host:
  directory: /Users/alice/work/retail-analytics
  identity:  /Users/alice/work/retail-analytics/.spice/identity.json (deleted)
? Continue? › yes
Deleted project retail-analytics in Spice Cloud.
Spice Cloud Connect identity cleared. To re-enroll this directory, mint a new enrollment key in the Spice Cloud portal and start the runtime with `spiced --token <enrollment-key>`.
```

Removal deletes the project with your logged-in user session, so it needs you to be logged in to the instance's organization. `--force` clears only this host's local state when the Cloud side cannot be completed — for example when the project was already deleted in the portal. It is a local-state recovery escape hatch, not a faster path.

## Notes

- **`spice connect` needs a terminal.** It is an interactive flow; with a non-interactive stdin it exits rather than hanging on a prompt, and points at `spiced --token` for [unattended enrollment](./headless.md).
- **Cancellation is clean.** `Esc` or `Ctrl-C` at any prompt is a normal exit. Nothing partial is left behind, and an interrupted enrollment resumes on the next run instead of creating a duplicate instance or project.
- **On Linux and macOS, if a service is already installed for the directory**, `spice connect` starts that service and returns instead of taking over your terminal. See [Service](./service.md).

## Next

- Keep the instance running across reboots with a [persistent service](./service.md) (Linux and macOS).
- Run it in a container with [headless enrollment](./headless.md).
- Full flag list in the [`spice connect` CLI reference](../../cli/reference/connect.md).
