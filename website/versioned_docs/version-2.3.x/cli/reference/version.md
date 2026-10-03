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

**Runtime path and source**: whenever a runtime is found, the output names it and the
[selection rung](./run#runtime-selection) it came from — including the ordinary managed install:

```shell
> spice version

CLI version:     v1.1.0
Runtime version: v1.1.0+models
Runtime path:    /Users/me/.spice/bin/spiced (installed by spice install)
```

The parenthetical is one of `pinned by SPICED_PATH`, `beside the spice CLI`, `installed by spice install`,
or `installed by spice install, by the sudo invoker`:

```shell
> spice version

CLI version:     v1.1.0
Runtime version: v1.1.0+models
Runtime path:    /usr/local/bin/spiced (beside the spice CLI)
```

The line is omitted only when no runtime resolves (`Runtime version: not installed`) or with
`--cli-only`, which skips the runtime lookup entirely. A runtime that was found but could not be
asked for its version reports `Runtime version: unavailable — the runtime at the path below did not
report a version` and still names the path.

JSON output includes `runtime_path` and `runtime_source`, following the same [runtime selection rules](./run#runtime-selection). `runtime_source` carries the enum value rather than the prose above, and both are `null` when no runtime resolves.
