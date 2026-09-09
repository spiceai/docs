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

- `--cli-only`   Show only the CLI version, skipping the runtime version lookup
- `-o`, `--output <format>` Output format: `table` (default) or `json`.
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

When the runtime does not come from the managed install directory, a `Runtime path:` line names the
binary and where it was resolved from — see [which `spiced` runs](./run#which-spiced-runs):

```shell
> spice version

CLI version:     v1.1.0
Runtime version: v1.1.0+models
Runtime path:    /usr/local/bin/spiced (beside the spice CLI)
```

`--output json` carries the same two facts as `runtime_path` and `runtime_source`.
