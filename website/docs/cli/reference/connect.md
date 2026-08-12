---
title: "connect"
sidebar_label: "connect"
pagination_prev: null
pagination_next: null
---

Enroll this host with Spice Cloud for remote management (Cloud Connect).

`spice connect <adoption-code>` **enrolls and exits**: the runtime identity is issued and persisted locally, the instance is registered with Spice Cloud, and — unless `--install` is passed — nothing is left running. Start the managed runtime separately with [`spiced --cloud-connect`](./spiced#cloud-connect-flags), or pass [`--install`](#flags) to have enrollment install and start it as a persistent system service. If the runtime is not installed, enrollment installs it first so that next step works immediately.

### Usage

```shell
spice connect [TARGET] [flags]
spice connect status
spice connect remove
```

- `TARGET`: a Spice Cloud adoption code (`SPICE-ADOPT-XXXXX-XXXXX-XXXXX-XXXXX`, each segment five uppercase letters or digits), obtained from the Spice Cloud portal. Required on a host that has not run [`login`](./login).

With no argument, `spice connect` resolves in this order:

1. **Already enrolled** (an identity exists for this directory) — reports the enrollment state, the same as `spice connect status`. The directory is never re-enrolled, which would create a second registry row for one host.
2. **An interrupted enroll is staged** — resumes it with the staged code.
3. **Otherwise** — mints a single-use adoption code from the `spice login` credential on this host and redeems it in the same command, so there is nothing to copy from the portal. The minted code is never displayed and never written to disk.

#### Subcommands

- `status` — Show the current enrollment state.
- `remove` — Release this instance: report the release to Spice Cloud, uninstall the service when one was installed, and clear the local Cloud Connect identity from disk. Asks for confirmation first — pass `--yes` to skip the prompt, which is required when stdin is not a terminal. Needs root when a service was installed. A running `spiced` keeps its in-memory identity until it is restarted or the cloud sends a Remove command (a dropped stream just reconnects with the same identity), so restart `spiced` to stop remote management immediately.

#### Flags

- `--endpoint <URL>` The Spice Cloud enroll endpoint the adoption code is presented to. Default: `https://api.spice.ai`. The gateway (stream) address is issued by the enroll response and is not configured here.
- `--dir <PATH>` Root this instance's state at `<PATH>/.spice`, so several instances on one host enroll independently. Defaults to the current directory. Applies to enrollment, `status`, and `remove`.
- `--org <NAME>` Which Spice Cloud org to enroll into, when the `spice login` credential on this host belongs to several. The org is resolved from the token, so naming an org the login does not belong to is an error rather than a silent enroll into a different one. Ignored when an explicit adoption code is given — a code already carries its own org scope.
- `--region <REGION>` Where this instance runs, e.g. `us-west-2` or `on-prem-syd`. A customer-declared label, not a probed fact: Spice Cloud displays it on the registry row and resolves this instance's gateway from it, falling back to the deployment's home stamp for a label it cannot rank. Any label of 2–64 lowercase letters, digits, and hyphens, starting and ending with a letter or digit, is accepted — it need not be a real cloud region. Omitting it on a re-enroll leaves an existing region untouched.
- `--app-name <NAME>` Attach the instance to the existing Spice Cloud app of this name at enroll time, instead of attaching it later in the portal. When no such app exists the command fails **without consuming the adoption code** — pass `--create` to create it.
- `--create` With `--app-name`: create the app when it does not exist, then attach the instance to it. An absent app without this flag is an error; apps are never created silently.
- `--install` Install and start [`spiced --cloud-connect`](./spiced#cloud-connect-flags) as a persistent system service running from the instance directory, so the instance survives reboots and closed terminals. Requires root, and either Linux with systemd or macOS with launchd. Combinable with an adoption code, or run on its own after a prior enroll. Re-running is the idempotent in-place upgrade path: latest binary, rewritten service definition, service restarted, staged identity untouched.
- `-y`, `--yes` Skip the confirmation prompt. Applies to `remove`.
- `-h`, `--help` Print this help message

#### Environment variables

For hosts provisioned without an interactive CLI invocation:

| Variable                       | Equivalent to | Purpose                                                                                                                   |
| ------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `SPICE_CONNECT_ADOPT_CODE`     | `TARGET`      | Adoption code to enroll with.                                                                                             |
| `SPICE_CONNECT_ADOPT_APP_NAME` | `--app-name`  | Spice Cloud app to attach the instance to at enroll.                                                                      |
| `SPICE_CONNECT_ADOPT_CREATE`   | `--create`    | Create the app named above when it does not exist.                                                                        |
| `SPICE_CONNECT_ADOPT_REGION`   | `--region`    | Where this instance runs.                                                                                                 |
| `SPICE_CLOUD_ENDPOINT`         | `--endpoint`  | Enroll endpoint override.                                                                                                 |
| `SPICE_CONFIG_DIR`             | —             | Overrides where per-instance state (identity and staged adoption code) is written, in full. Takes precedence over `--dir`. |

Flags take precedence over their corresponding environment variables. The enroll endpoint resolves in full as `--endpoint`, then `SPICE_CLOUD_ENDPOINT`, then a `cloud-endpoint` file written into the config directory by a previous enroll, then the `https://api.spice.ai` default — so later `spiced` starts reach the same control plane the enroll used.

Containers use this environment-variable flow together with `spiced --cloud-connect` under the container runtime's restart policy; `--install` is Linux/systemd and macOS/launchd only, and Windows enrolls and runs under the user's own supervisor.

### Examples

Enroll this host, then start the managed runtime:

```shell
> spice connect SPICE-ADOPT-7K2PX-9XYZ2-A1B2C-D3E4F
> spiced --cloud-connect
```

Enroll a host already logged in with [`login`](./login), with no code to copy from the portal:

```shell
> spice connect
```

Enroll and install a persistent service in one step, so the instance survives reboots:

```shell
> sudo spice connect --install
```

Record where the instance runs, and attach it to an app:

```shell
> spice connect --region on-prem-syd --app-name edge-fleet
```

Enroll a second instance on the same host, rooted at its own directory:

```shell
> spice connect SPICE-ADOPT-7K2PX-9XYZ2-A1B2C-D3E4F --dir /opt/edge-1
```

Attach the instance to a Spice Cloud app at enroll time, creating the app if it does not exist:

```shell
> spice connect SPICE-ADOPT-7K2PX-9XYZ2-A1B2C-D3E4F --app-name edge-fleet --create
```

Inspect the enrollment, then release the instance (root because an installed service is uninstalled too):

```shell
> spice connect status
> sudo spice connect remove
```

### Deprecated: adding a cloud-hosted Spicepod

`spice connect <org>/<pod>` added a Spicepod hosted on the Spice.ai Cloud Platform, using Spice.ai Cloud authentication from [`login`](./login). It is **deprecated**, prints a warning, and will be removed in a future release — use [`spice add <org>/<pod>`](./add) instead:

```shell
> spice add spiceai/quickstart
```
