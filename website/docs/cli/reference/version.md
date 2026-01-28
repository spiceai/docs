---
title: "version"
sidebar_label: "version"
pagination_prev: null
pagination_next: null
---
Outputs the current version of the Spice CLI and runtime

### Usage

```shell 
spice version [flags]
```

#### Flags

- `-h`, `--help`   help for version

### Sample output


**Upgrade available**: 
```shell
> spice version

 2024/12/17 22:42:11 INFO CLI version:     v0.18.3-beta
 2024/12/17 22:42:13 INFO Runtime version: v0.20.0-beta+models
 2024/12/17 22:42:14 INFO
 CLI version v1.0.0-rc.4 is now available!
 To upgrade, run "spice upgrade".
 ```

Learn more about upgrading the Spice CLI and runtime using `spice upgrade` [here.](../cli/reference/upgrade)


**Latest Version**:
```shell
> spice version

CLI version:     v1.0.0-rc.4
Runtime version: v1.0.0-rc.4+models
 ```