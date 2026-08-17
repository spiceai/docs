---
title: 'connect'
sidebar_label: 'connect'
pagination_prev: null
pagination_next: null
---

Connect this directory to Spice Cloud and start its instance (Cloud Connect).

`spice connect` is an **interactive setup flow**. It authenticates a user, resolves one organization where that user is an owner or admin, enrolls the local instance, atomically creates and attaches a new project, and leaves the runtime serving. Without a saved login it offers inline login (recommended) or secure enrollment-key entry rather than failing.

For unattended enrollment, use [`spiced --token <enrollment-key>`](./spiced#spice-cloud-connect-flags) instead — see [Headless Cloud Connect](../../deployment/cloud-connect/headless).

### Usage

```shell
spice connect [flags]
spice connect status [--output table|json]
spice connect service <install|uninstall|start|stop|restart|status|logs>
spice connect remove [--yes] [--force]
spice connect <org>/<pod>            # deprecated
```

### Requirements

- A terminal. `spice connect` exits rather than hanging when stdin or stderr is not a TTY.
- A Spice Cloud account with the **owner** or **admin** role in at least one organization. A prior [`login`](./login) is optional — `spice connect` can run it inline.

### Behavior with no arguments

`spice connect` resolves in this order:

1. **Already enrolled** — the identity always wins and is never duplicated. The instance is started: in the foreground, or, on Linux and macOS where a service is installed for the directory, through that service. An enrolled instance with no project attached is offered project assignment when a login for its organization is available.
2. **An interrupted enrollment is staged** — it resumes in the mode that started it. It never asks which authentication to use again; an enrollment key is requested again only because keys are never stored.
3. **Otherwise** — it runs the full setup: authenticate, resolve the organization, enroll, create and attach the project, and start the runtime.

Cancellation and EOF at any prompt are normal exits. Nothing partial is created, and a retry recovers the pending operation rather than creating a duplicate instance or project.

State is per **instance directory**: the enrolled identity lives at `<dir>/.spice/identity.json`, so several instances can enroll independently on one host.

### Subcommands

#### `status`

Show this directory's Cloud connection, service, and deployment state from one snapshot.

```shell
spice connect status
spice connect status --output json
```

- `-o`, `--output <table|json>` Output format. Default: `table`. `json` writes one report and nothing else to stdout.

Exits non-zero when the reported service state is `failed` or `unavailable`, so automation does not read either as healthy.

#### `service`

Install and manage the persistent service for this instance directory. With no action, prints concise help and does nothing.

```shell
spice connect service install      # install and start; re-run to upgrade in place
spice connect service uninstall    # stop and remove, keeping the Cloud identity
spice connect service start        # start an installed, stopped service
spice connect service stop         # stop it, leaving it installed and enabled
spice connect service restart      # restart through the supervisor and wait
spice connect service status       # state, boot persistence, and paths
spice connect service logs         # its output
```

`install` requires the directory to be enrolled already; it does not enroll. Running without `sudo` installs a **user** service — a systemd user service on Linux, a LaunchAgent on macOS. With `sudo` it installs a **system** service — a systemd system unit or a LaunchDaemon — that still runs `spiced` as the invoking operator.

A user service starts with its owner's login; only a system service starts at boot with nobody logged in. On Linux a user service can also reach boot persistence through `loginctl enable-linger`, which launchd has no equivalent of, so on macOS boot persistence means `sudo spice connect service install`. `status` reports which one you have and names the command that would change it.

`service status` accepts `-o`, `--output <table|json>` and renders the same service object that `spice connect status --output json` nests. `supervisor` is `systemd` or `launchd`.

`service logs` flags:

- `-n`, `--number <LINES>` Lines of existing history to print first. Default: `100`. Maximum: `100000`. `0` with `--follow` prints only new output.
- `-f`, `--follow` Keep printing new output until interrupted.

`--tail` is intentionally not accepted; `-f`/`-n` match `docker logs` and `kubectl logs`. On Linux the output comes from the systemd journal; on macOS from the runtime's own bounded rotating files — five files of about 10 MiB each under `~/Library/Logs/Spice/<service>/` or `/Library/Logs/Spice/<service>/` — which `status` names on its `logs:` line.

:::info Linux and macOS
The service group drives systemd on Linux and launchd on macOS. Every action except `status` exits non-zero on Windows, which has no managed service; `status` reports on every platform.
:::

See [Cloud Connect as a persistent service](../../deployment/cloud-connect/service).

#### `remove`

Delete this instance's project in Spice Cloud using the logged-in user session, uninstall its service, and clear local Cloud identity and staged state.

```shell
spice connect remove
```

Stop any foreground or managed `spiced` first — removal refuses while the instance is running. Project deletion needs a user session in the identity's organization; an instance identity cannot authorize deleting its own project.

Asks for confirmation and names everything it will affect. `--yes` skips the prompt and is required when stdin is not a terminal.

[`spice connect service uninstall`](../../deployment/cloud-connect/service#uninstall-the-service) is the narrower operation that keeps the Cloud identity.

### Flags

- `--dir <PATH>` The instance directory: per-instance Cloud Connect state lives under `<dir>/.spice`. Defaults to the current directory. Applies to `status`, `remove`, and `service`.
- `--region <LABEL>` Declared location label for the enrolled instance, e.g. `us-west-2` or `on-prem-syd`. 2–64 lowercase letters, digits, or hyphens, starting and ending with a letter or digit. A customer-declared label, not a probed fact: Spice Cloud shows it on the instance and resolves the instance's gateway from it, falling back to the deployment's home stamp for a label it cannot rank. Applies to enrollment only.
- `--endpoint <URL>` Override the Spice Cloud endpoint used to enroll, inspect state, or report a release. Default: `https://api.spice.ai`. The gateway (stream) address is issued in the enroll response and is not configured here.
- `-y`, `--yes` Skip the confirmation prompt. Applies to `remove`.
- `--force` Clear this directory's local state even when Spice Cloud could not confirm the release. Applies to `remove`, which otherwise keeps the identity so a retry can finish. Use it when the instance is already deleted in the portal, or when the control plane that issued it is gone — the portal-side delete is authoritative either way.
- `-h`, `--help` Print this help message

`--cloud-region` is rejected on Cloud Connect subcommands rather than silently ignored: the control plane comes from `--endpoint` and the gateway is issued by the enroll response, so no region code selects either.

### Environment variables

| Variable               | Equivalent to | Purpose                                                                                |
| ---------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `SPICE_CLOUD_ENDPOINT` | `--endpoint`  | Enroll and control-plane endpoint override.                                            |
| `SPICE_CONFIG_DIR`     | —             | Overrides where per-instance state is written, in full. Takes precedence over `--dir`. |

Flags take precedence over their corresponding environment variables. The endpoint resolves as `--endpoint`, then `SPICE_CLOUD_ENDPOINT`, then a `cloud-endpoint` file written into the config directory by a previous enroll, then the `https://api.spice.ai` default — so later `spiced` starts reach the same control plane the enroll used.

An enrollment key is never read from the environment and is never accepted as a positional argument:

```console
$ spice connect spice-enroll-...
ERROR Invalid argument: An enrollment key is not accepted as a positional argument. For unattended enrollment, run `spiced --token <enrollment-key>` from the instance directory. See: https://spiceai.org/docs
```

### Examples

Connect a development machine, using the directory name as the project-name default:

```shell
> cd ~/work/retail-analytics
> spice connect
```

Reconnect later from the same directory — no Cloud Connect flag is needed:

```shell
> spice run
```

Connect an instance rooted at another directory, recording where it runs:

```shell
> spice connect --dir /srv/edge --region on-prem-syd
```

Inspect the connection, service, and deployment state:

```shell
> spice connect status
> spice connect status --output json
```

Install a persistent system service for an already-enrolled directory — one that starts at boot with nobody logged in:

```shell
> sudo spice connect service install
```

Apply a deployment that needs a restart, then confirm it cleared:

```shell
> spice connect service restart
> spice connect status
```

Release the instance and delete its project:

```shell
> spice connect remove
```

### Deprecated: adding a cloud-hosted Spicepod

`spice connect <org>/<pod>` added a Spicepod hosted on the Spice.ai Cloud Platform, using Spice.ai Cloud authentication from [`login`](./login). It is **deprecated**, prints a warning, and will be removed in a future release — use [`spice add <org>/<pod>`](./add) instead:

```shell
> spice add spiceai/quickstart
```

### See also

- [Cloud Connect overview](../../deployment/cloud-connect/)
- [Development machine](../../deployment/cloud-connect/development) · [Persistent service](../../deployment/cloud-connect/service) · [Headless](../../deployment/cloud-connect/headless)
- [`spiced` Spice Cloud Connect flags](./spiced#spice-cloud-connect-flags)
