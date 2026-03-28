---
title: "init"
sidebar_label: "init"
pagination_prev: null
pagination_next: null
---
Initialize Spice app in the current working directory.

### Usage

```shell
spice init [app_name]
```
- `app_name`: The name of the app. If this is not provided, Spice will prompt for the name, defaulting to the name of the current working directory.

#### Flags

- `-h`, `--help`   Print this help message

### Examples


```
> spice init taxi-trips

2025/01/09 16:43:02 INFO Initialized taxi-trips/spicepod.yaml
```

The command creates a `spicepod.yaml` with basic initial metadata about the app. For this example, the `spicepod.yaml` file is initialized to the following:
```yaml
# File: ./taxi-trips/spicepod.yaml

version: v2
kind: Spicepod
name: taxi-trips
```

If no app name is provided, Spice initializes the Spicepod in the current working directory. For example:
```shell
> spice init

name: (taxi-trips)? 
2025/01/09 16:48:37 INFO Initialized spicepod.yaml
```

After execution, the current working directory contains the file `spicepod.yaml` with the same configuration as the previous example:
```yaml
# File: ./spicepod.yaml

version: v2
kind: Spicepod
name: taxi-trips
```