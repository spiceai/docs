---
title: 'connect'
sidebar_label: 'connect'
pagination_prev: null
pagination_next: null
---

Connect an instance to Spice Cloud.

Use `spice connect` for interactive setup. For unattended setup, use [`spiced --token`](./spiced#spice-cloud-connect-flags).

### Usage

```shell
spice connect [flags]
spice connect status [--output table|json]
spice connect service <install|uninstall|start|stop|restart|status|logs>
spice connect remove [--yes] [--force]
```

### Connect an instance

Run this command from the instance directory:

```shell
spice connect
```

You need a terminal and the owner or admin role in a Spice Cloud organization. The command can log you in. It enrolls the directory, creates a project, and starts the runtime.

The identity is stored in `<dir>/.spice/identity.json`. If an identity exists, the command starts the existing instance. It does not enroll a new instance.

### `status`

Show the Cloud connection, service, and deployment status:

```shell
spice connect status
spice connect status --output json
```

- `-o`, `--output <table|json>`: Set the output format. The default is `table`.

The command returns a nonzero exit code if the service state is `failed` or `unavailable`.

### `service`

Manage a Linux or macOS service:

```shell
spice connect service install
spice connect service uninstall
spice connect service start
spice connect service stop
spice connect service restart
spice connect service status
spice connect service logs
```

Enroll the instance before you install the service.

Install a user service with `spice connect service install`. Install a system service with `sudo spice connect service install`. A system service starts at boot without a user login.

Log options:

- `-n`, `--number <LINES>`: Set the number of existing lines. The default is `100`. The maximum is `100000`.
- `-f`, `--follow`: Show new lines until you stop the command.

Windows does not support service actions. `service status` is available on all platforms.

See [Cloud Connect as a service](../../deployment/cloud/cloud-connect/service.md).

### `remove`

Stop the runtime. Then run:

```shell
spice connect remove
```

This command deletes the project, removes the service, and deletes the local Cloud identity. You must be logged in to the organization that owns the instance.

Use `--yes` to skip confirmation. Use `--force` only to remove local state when Spice Cloud cannot complete the removal.

To keep the Cloud identity, use `spice connect service uninstall`.

### Flags

- `--dir <PATH>`: Set the instance directory. The default is the current directory. This option applies to `status`, `remove`, and `service`.
- `--region <LABEL>`: Set a location label during enrollment. Use 2–64 lowercase letters, digits, or hyphens.
- `--endpoint <URL>`: Set the Spice Cloud API endpoint. The default is `https://api.spice.ai`.
- `-y`, `--yes`: Skip confirmation for `remove`.
- `--force`: Remove local state if Spice Cloud cannot complete `remove`.
- `-h`, `--help`: Show help.

### Environment variables

| Variable           | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `SPICE_CONFIG_DIR` | Set the complete path for the Cloud Connect state directory. |

`SPICE_CONFIG_DIR` takes precedence over `--dir`.

### Deprecated syntax

`spice connect <org>/<pod>` is deprecated. Use:

```shell
spice add <org>/<pod>
```

### See also

- [Cloud Connect overview](../../deployment/cloud/cloud-connect/index.md)
- [Development machine](../../deployment/cloud/cloud-connect/development.md)
- [Service](../../deployment/cloud/cloud-connect/service.md)
- [Headless](../../deployment/cloud/cloud-connect/headless.md)
