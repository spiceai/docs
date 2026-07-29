---
title: "upgrade"
sidebar_label: "upgrade"
pagination_prev: null
pagination_next: null
---
Upgrades the Spice CLI and runtime to the latest or specified version

### Usage

```shell
spice upgrade [target_version] [flags]
```

`target_version` - an optional release version to install, including the leading `v` (e.g. `v1.8.3`). A version without the leading `v` is rejected. When omitted, the latest release is used.

#### Flags

- `-f`, `--force`   Reinstall the CLI and runtime even when the target version is already installed
- `-h`, `--help`   help for upgrade

### Examples

```shell
spice upgrade
```

### Additional Examples

Upgrade to a specific version:

```shell
spice upgrade v1.8.3
```

Reinstall the currently installed version:

```shell
spice upgrade --force
```
