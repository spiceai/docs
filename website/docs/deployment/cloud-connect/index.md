---
title: 'Cloud Connect'
sidebar_label: 'Cloud Connect'
description: 'Connect a self-hosted Spice instance to Spice Cloud for remote management.'
keywords: [spice.ai, cloud connect, enrollment key, remote management]
sidebar_position: 7
tags:
  - deployment
  - cloud-connect
  - spiceai
---

Cloud Connect links a self-hosted Spice instance to Spice Cloud. You can then monitor and configure the instance in the Spice Cloud portal. Your data stays on your host.

The instance connects to Spice Cloud. Spice Cloud does not make an inbound connection to the instance.

## Select a connection method

| Method                          | Use case                                      | Command                         |
| ------------------------------- | --------------------------------------------- | ------------------------------- |
| [Development](./development.md) | Run the instance in the current terminal      | `spice connect`                 |
| [Service](./service.md)         | Run the instance as a Linux or macOS service  | `spice connect service install` |
| [Headless](./headless.md)       | Run the instance in a container or supervisor | `spiced --token <key>`          |

Windows does not support the managed service. On Windows, use `spice connect` or your own supervisor.

## Instance directory

Cloud Connect stores the instance identity in `<dir>/.spice/identity.json`. `<dir>` is the current directory unless you use `--dir`.

```shell
spice connect status --dir /srv/edge-analytics
```

`SPICE_CONFIG_DIR` sets the complete path of the state directory. It takes precedence over `--dir`. Use it to store the identity on a persistent container volume.

An enrolled instance reconnects automatically. Run `spice run` or `spiced` from the same instance directory. Do not use a connection flag.

:::warning
Spice Cloud invalidates the identity if the instance stays offline for more than 30 days. Enroll the instance again to reconnect it.
:::

## Authentication

Use one of these methods:

- **Spice Cloud login:** Use this method with `spice connect`. You must be an organization owner or admin. The command enrolls the instance and creates its project.
- **Enrollment key:** Get a key from [spice.ai/connect](https://spice.ai/connect). Use it with `spiced --token`. A key is valid for one enrollment. It does not create a project. After enrollment, use the portal link in the runtime log to create the project.

Spice Cloud shows each enrollment key one time. Do not store the key. The issued identity is the restart credential. Keep the identity on persistent storage.

## Deployments and restarts

A portal deployment does not restart the instance. These sections apply without a restart:

- `datasets`
- `views`
- `models`
- `functions`
- added `catalogs`

Changes to other sections take effect at the next start. Removed catalogs also require a restart. Check the pending sections:

```shell
spice connect status
spice connect status --output json
```

Restart the instance with the method that controls it:

- Service: `spice connect service restart`
- Terminal: Stop the process. Then run `spice connect` again.
- Container: Re-create the container or pod.

## Remove an instance

Stop the instance. Then run:

```shell
spice connect remove
```

This command deletes the Spice Cloud project, removes the service, and deletes the local identity.

To remove only the service, run `spice connect service uninstall`. This command keeps the Cloud identity.
