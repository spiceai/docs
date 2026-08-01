---
title: "connect"
sidebar_label: "connect"
pagination_prev: null
pagination_next: null
---

Enroll this host with Spice Cloud for remote management (Cloud Connect).

`spice connect <adoption-code>` **enrolls and exits**: the runtime identity is issued and persisted locally, the instance is registered with Spice Cloud, and nothing is left running. Start the managed runtime separately with [`spiced --cloud-connect`](./spiced#cloud-connect-flags). If the runtime is not installed, enrollment installs it first so that next step works immediately.

### Usage

```shell
spice connect [TARGET] [flags]
spice connect status
spice connect remove
```

- `TARGET`: a Spice Cloud adoption code (`SPICE-ADOPT-XXXXX-XXXXX-XXXXX-XXXXX`, each segment five uppercase letters or digits), obtained from the Spice Cloud portal. With no argument, `spice connect` reports the current enrollment state, the same as `spice connect status`.

#### Subcommands

- `status` — Show the current enrollment state.
- `remove` — Clear the local Cloud Connect identity from disk. A running `spiced` keeps its in-memory identity until it is restarted (a dropped stream just reconnects with the same identity), so restart `spiced` to stop remote management immediately.

#### Flags

- `--endpoint <URL>` The Spice Cloud enroll endpoint the adoption code is presented to. Default: `https://cloud.spice.ai`. The gateway (stream) address is issued by the enroll response and is not configured here.
- `--dir <PATH>` Root this instance's state at `<PATH>/.spice`, so several instances on one host enroll independently. Defaults to the current directory. Applies to enrollment, `status`, and `remove`.
- `--app-name <NAME>` Attach the instance to the existing Spice Cloud app of this name at enroll time, instead of attaching it later in the portal. When no such app exists the command fails **without consuming the adoption code** — pass `--create` to create it.
- `--create` With `--app-name`: create the app when it does not exist, then attach the instance to it. An absent app without this flag is an error; apps are never created silently.
- `-h`, `--help` Print this help message

#### Environment variables

For hosts provisioned without an interactive CLI invocation:

| Variable                       | Equivalent to | Purpose                                                                                                                    |
| ------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `SPICE_CONNECT_ADOPT_CODE`     | `TARGET`      | Adoption code to enroll with.                                                                                              |
| `SPICE_CONNECT_ADOPT_APP_NAME` | `--app-name`  | Spice Cloud app to attach the instance to at enroll.                                                                       |
| `SPICE_CONNECT_ADOPT_CREATE`   | `--create`    | Create the app named above when it does not exist.                                                                         |
| `SPICE_CLOUD_ENDPOINT`         | `--endpoint`  | Enroll endpoint override.                                                                                                  |
| `SPICE_CONFIG_DIR`             | —             | Overrides where per-instance state (identity and staged adoption code) is written, in full. Takes precedence over `--dir`. |

Flags take precedence over their corresponding environment variables.

### Examples

Enroll this host, then start the managed runtime:

```shell
> spice connect SPICE-ADOPT-7K2PX-9XYZ2-A1B2C-D3E4F
> spiced --cloud-connect
```

Enroll a second instance on the same host, rooted at its own directory:

```shell
> spice connect SPICE-ADOPT-7K2PX-9XYZ2-A1B2C-D3E4F --dir /opt/edge-1
```

Attach the instance to a Spice Cloud app at enroll time, creating the app if it does not exist:

```shell
> spice connect SPICE-ADOPT-7K2PX-9XYZ2-A1B2C-D3E4F --app-name edge-fleet --create
```

Inspect, then clear, local enrollment state:

```shell
> spice connect status
> spice connect remove
```

### Deprecated: adding a cloud-hosted Spicepod

`spice connect <org>/<pod>` added a Spicepod hosted on the Spice.ai Cloud Platform, using Spice.ai Cloud authentication from [`login`](./login). It is **deprecated**, prints a warning, and will be removed in a future release — use [`spice add <org>/<pod>`](./add) instead:

```shell
> spice add spiceai/quickstart
```
