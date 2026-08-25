---
title: 'connect'
sidebar_label: 'connect'
pagination_prev: null
pagination_next: null
---

:::warning
`spice connect <org>/<pod>` is deprecated. Use [`spice add <org>/<pod>`](./add).
:::

Adds a Spicepod dependency to the current project, and prints a deprecation warning.

### Usage

```shell
spice connect <org>/<pod>
```

### Example

```shell
spice connect spiceai/quickstart
```

The command takes no flags of its own beyond the [global flags](../reference#command-flags).

### Connecting a runtime to Spice Cloud

`spice connect` does not enroll or attach an instance. Use [`spice cloud`](./cloud):

| Task                                          | Command                                       |
| --------------------------------------------- | --------------------------------------------- |
| Enroll this directory and attach it to a project | [`spice cloud link`](./cloud#link)          |
| Check the project's health                    | [`spice cloud status`](./cloud#status)        |
| Read runtime logs                             | [`spice cloud logs`](./cloud#logs)            |
| Run the instance as a supervised service      | [`spice cloud service`](./cloud#service)      |
| Detach and release the instance               | [`spice cloud unlink`](./cloud#unlink)        |

For unattended enrollment, start the runtime with [`spiced --token <enrollment-key>`](./spiced#spice-cloud-connect-flags).

### See also

- [`spice add`](./add) — add a Spicepod dependency
- [`spice cloud`](./cloud) — Spice Cloud commands
- [Cloud Connect](../../deployment/cloud/cloud-connect/index.md)
