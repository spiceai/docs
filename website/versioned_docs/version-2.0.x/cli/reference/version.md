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

CLI version:     v1.0.6
Runtime version: v1.0.6+models

CLI version v1.1.0 is now available!
To upgrade, run "spice upgrade".
 ```

Learn more about upgrading the Spice CLI and runtime using `spice upgrade` [here.](./upgrade)


**Latest Version**:
```shell
> spice version

CLI version:     v1.1.0
Runtime version: v1.1.0+models
 ```