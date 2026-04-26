---
title: "validate"
sidebar_label: "validate"
pagination_prev: null
pagination_next: null
---
Validate a `spicepod.yaml` without starting the runtime.

Checks YAML syntax and schema, component references, duplicate component names, reserved keywords, and nested pod includes (`dependsOn`).

### Usage

```shell
spice validate [path]
```

- `path`: Path to a `spicepod.yaml` file or a directory containing one. Defaults to the current directory (`.`).

#### Flags

- `-h`, `--help`   Print this help message

### Examples

Validate the spicepod in the current directory:

```shell
> spice validate

OK my_app (datasets: 2, models: 1, views: 0, tools: 0, workers: 0)
```

Validate a specific directory:

```shell
> spice validate ./my-app

OK my_app (datasets: 3, models: 0, views: 1, tools: 2, workers: 0)
```

Validate a specific file:

```shell
> spice validate path/to/spicepod.yaml

OK taxi_trips (datasets: 1, models: 0, views: 0, tools: 0, workers: 0)
```

When validation fails, the error describes the issue:

```shell
> spice validate ./broken-app

Invalid: spicepod validation failed: missing field `kind`
```
