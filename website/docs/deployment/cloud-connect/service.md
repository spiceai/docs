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

Install Cloud Connect as a service to keep an instance running after you close the terminal. Linux uses systemd. macOS uses launchd.

Windows does not support this service. On Windows, use `spice connect` or your own supervisor.

## Enroll the instance

The instance must have a Cloud Connect identity before you install the service.

For an interactive host, run:

```shell
cd /srv/edge-analytics
spice connect
```

Press `Ctrl-C` after the runtime starts.

For an unattended host, see [Headless Cloud Connect](./headless.md).

## Install the service

Select when the service must start:

| Requirement                        | Command                              |
| ---------------------------------- | ------------------------------------ |
| Start when the user logs in        | `spice connect service install`      |
| Start at boot without a user login | `sudo spice connect service install` |

Run the command from the instance directory. The command installs and starts the service.

On Linux, a user service can start at boot if the user account has lingering enabled:

```shell
loginctl enable-linger "$USER"
```

On macOS, use the `sudo` installation for start at boot. A user service requires a desktop login session.

To upgrade the service, install it again with the new `spiced` binary.

## Manage the service

```shell
spice connect service start
spice connect service stop
spice connect service restart
spice connect service status
spice connect service logs
spice connect service uninstall
```

Use `--dir <path>` if you run a command outside the instance directory.

`stop` keeps the service installed. The service starts again at the next configured login or boot.

## Read logs

```shell
spice connect service logs          # Show the last 100 lines
spice connect service logs -n 500   # Show the last 500 lines
spice connect service logs -f       # Show new lines continuously
spice connect service logs -n 0 -f  # Show only new lines
```

Press `Ctrl-C` to stop the log output. This does not stop the service.

On Linux, the command reads the systemd journal. On macOS, launchd stores no logs, so the runtime writes its own files and the command reads those:

| Service | Log file                                    |
| ------- | ------------------------------------------- |
| User    | `~/Library/Logs/Spice/<service>/spiced.log` |
| System  | `/Library/Logs/Spice/<service>/spiced.log`  |

The runtime keeps five files of about 10 MiB each and deletes the oldest. `spice connect service status` reports the location. Uninstalling the service keeps the files.

## Apply changes that require a restart

A deployment that changes a section only a start reads keeps the instance serving its current configuration. The runtime names those sections in the service log, and the project in Spice Cloud reports them:

```shell
spice connect service logs -n 20
```

```text
INFO Spice Cloud Connect: applied the deployed spicepod (12 datasets, 1 models, 0 catalogs, 0 views); runtime, secrets takes effect when this instance next starts
```

Apply them:

```shell
spice connect service restart
```

## Remove the service

```shell
spice connect service uninstall
```

This command keeps the Cloud identity and project. To remove the instance from Spice Cloud, use [`spice connect remove`](../../cli/reference/connect.md#remove).

:::note
Cloud Connect supports one managed service on each host. Use your own supervisor for additional instances.
:::

For all service options, see the [`spice connect` command reference](../../cli/reference/connect.md).
