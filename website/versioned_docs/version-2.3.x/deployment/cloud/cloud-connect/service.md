---
title: 'Cloud Connect as a Service'
sidebar_label: 'Service'
description: 'Run a connected Spice instance as a Linux or macOS service.'
keywords: [spice.ai, cloud connect, systemd, launchd, service]
sidebar_position: 2
tags:
  - deployment
  - cloud-connect
  - systemd
  - launchd
  - spiceai
---

A managed service keeps a connected instance running after the terminal closes. `spice cloud service` drives systemd on Linux and launchd on macOS, with one set of commands for both.

Windows has no managed service: every action is refused there, and such a host runs the instance with `spice run` or under its own supervisor.

## Enrollment comes first

The directory must already hold a Cloud Connect identity; `install` never enrolls one. On an interactive host, `spice cloud link` enrolls it:

```shell
cd /srv/edge-analytics
spice cloud link acme/edge-analytics
```

An unattended host enrolls through [Headless Cloud Connect](./headless.md) instead.

## Installing

The privilege the install runs with selects the service domain, and with it the promise about when the instance comes back:

| Command                              | Starts                         |
| ------------------------------------ | ------------------------------ |
| `spice cloud service install`        | when its owner logs in         |
| `sudo spice cloud service install`   | at boot, with nobody logged in |

Both run from the instance directory, and both install and start the service. A system service still runs `spiced` as the operator who invoked `sudo`.

On Linux, a user service also reaches boot persistence once its account lingers:

```shell
loginctl enable-linger "$USER"
```

launchd has no equivalent, so on macOS a user service starts with its owner's desktop login session and boot persistence means the `sudo` install.

Re-running `install` is the in-place upgrade: it stages the current `spiced`, rewrites the definition, and restarts the service, leaving the enrolled identity untouched.

## Managing

```shell
spice cloud service start
spice cloud service stop
spice cloud service restart
spice cloud service uninstall
```

Each action resolves the service for the directory it runs from. `stop` leaves the definition in place, so the service still comes back at the next boot or login.

`spice cloud status` reports the service's state, under `Local enrolled-instance state:`, and `spice cloud logs` reads its output. Both read the project from Spice Cloud, so both need an authenticated session.

## Reading logs

```shell
spice cloud logs               # the last 100 lines
spice cloud logs --limit 500   # the last 500 lines
spice cloud logs -f            # follow new lines
```

`Ctrl-C` ends the log output without touching the service.

On Linux the lines come from the systemd journal. launchd stores no logs, so on macOS the runtime writes its own files and the command reads those:

| Service | Log file                                    |
| ------- | ------------------------------------------- |
| User    | `~/Library/Logs/Spice/<service>/spiced.log` |
| System  | `/Library/Logs/Spice/<service>/spiced.log`  |

The runtime keeps five files of about 10 MiB each and discards the oldest. `spice cloud status` reports the location, and an uninstall leaves the files in place.

## Applying changes that require a restart

A deployment that changes a section only a start reads leaves the instance serving its current configuration. The runtime names those sections in the service log, and the project in Spice Cloud reports them:

```shell
spice cloud logs --limit 20
```

```text
INFO Spice Cloud Connect: applied the deployed spicepod (12 datasets, 1 models, 0 catalogs, 0 views); runtime, secrets takes effect when this instance next starts
```

`spice cloud service restart` is what applies them.

## Removing the service

```shell
spice cloud service uninstall
```

This keeps the Cloud identity and the project, so a later install resumes the same enrollment. [`spice cloud unlink`](../../../cli/reference/cloud.md#unlink) is what releases the instance from Spice Cloud.

:::note
One managed service per host. Additional instances on the same host run in the foreground or under an operator's own supervisor.
:::

The [`spice cloud` command reference](../../../cli/reference/cloud.md#service) documents every service option.
