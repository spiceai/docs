---
title: "connect"
sidebar_label: "connect"
pagination_prev: null
pagination_next: null
---

Connect to an app on the Spice.ai Cloud Platform.

### Requirements

- Authenticated to the Spice.ai Cloud Platform via [`login`](./login)

**Notes**: Instead of pulling from Spicerack and integrating those Spicepods locally like `spice add`, `spice connect` enables connection to an app on the Spice.ai Cloud Platform without any local modifications or updates necessary.

### Usage

```shell
spice connect [app] [flags]
```

- `app`: The app slug in the Spice.ai Cloud Platform (i.e. `spiceai/tpch`).

#### Flags

- `-h`, `--help` Print this help message

### Examples

```shell
> spice connect spiceai/quickstart
```

```shell
> spice connect spiceai/tpch
```
