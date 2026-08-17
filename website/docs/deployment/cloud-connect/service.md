---
title: 'Cloud Connect as a Persistent Service'
sidebar_label: 'Persistent service'
description: 'Install a connected Spice instance as a systemd user or system service on Linux, and manage its full lifecycle with spice connect service.'
keywords:
  [spice.ai, cloud connect, systemd, service, spice connect service install, boot persistence]
sidebar_position: 2
tags:
  - deployment
  - cloud-connect
  - systemd
  - spiceai
---

`spice connect service` installs a connected instance under the host's service manager and manages its whole lifecycle — install, uninstall, start, stop, restart, status, and logs — so the instance survives reboots and closed terminals.

:::warning Linux with systemd only
This release supports **Linux with systemd**. Every lifecycle action except `status` exits non-zero elsewhere:

```console
$ spice connect service install
ERROR Invalid argument: `spice connect service` currently supports Linux with systemd. macOS lifecycle support will follow once launchd start, stop, restart, and logs are complete. See: https://spiceai.org/docs
```

On macOS and Windows, run the instance in the [foreground](./development.md) or under your own supervisor. In containers, use [headless enrollment](./headless.md) with the container runtime's restart policy.
:::

## Enroll first, then install

`spice connect service install` installs a service for an instance directory that is **already enrolled**. It never enrolls one itself:

```console
$ spice connect service install
ERROR Invalid argument: Failed to install the Spice Cloud Connect service: /srv/edge-analytics/.spice/identity.json has no enrolled identity. Mint an enrollment key in the Spice Cloud portal and start the runtime with `spiced --token <enrollment-key>` before installing the service. See: https://spiceai.org/docs
```

So a first install is two steps. Choose whichever enrollment fits the host:

```shell
cd /srv/edge-analytics

# Interactive: log in, pick the org, name the project. Ctrl-C once it is serving.
spice connect

# or, unattended: enroll with a key from the portal. Ctrl-C once it reports ready.
spiced --token "$SPICE_ENROLL_KEY"
```

Then install:

```shell
spice connect service install
```

## User service or system service

The privilege you install with picks the service domain. There is no flag — least privilege is the default:

| Invocation                           | Service                                              | Starts                                      |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------------- |
| `spice connect service install`      | systemd **user** service in `~/.config/systemd/user` | At login, or at boot if the account lingers |
| `sudo spice connect service install` | systemd **system** unit in `/etc/systemd/system`     | At boot, without login                      |

A system unit still runs `spiced` as the non-root operator who invoked `sudo` — installation needs root, serving data does not. The operator is taken from `SUDO_UID`/`SUDO_GID`, so install with `sudo` from that account rather than from a root shell:

```console
$ spice connect service install    # in a root shell, not via sudo
ERROR Invalid argument: Failed to install the Spice Cloud Connect service: SUDO_UID and SUDO_GID must identify the non-root operator who will run spiced. Re-run from that account with `sudo spice connect service install`.
```

Installation stages a copy of the runtime binary for the service to run — `/usr/local/lib/spice/spiced` for a system service, `~/.local/share/spice/services/` for a user service — writes the unit, enables and starts it, and waits for the runtime's `/health` endpoint before reporting success:

```console
$ sudo spice connect service install
Installed the Spice Cloud Connect service: running (system service, systemd).
  starts:      at boot, without login
  version:     2.2.0
  monitor:     https://spice.ai/acme/edge-analytics/monitor

Manage it with:
  spice connect status
  spice connect service restart
  spice connect service logs -f
  spice connect service uninstall
```

Re-running `install` is the in-place upgrade: it restages the current runtime binary, rewrites the unit, and restarts the service. The enrolled identity is untouched.

### Boot persistence, stated plainly

A systemd user service normally starts at login and stops at logout. Installation attempts `loginctl enable-linger <user>` and then **verifies the result**, because policy can refuse it. Status reports the outcome as an operator fact, never as supervisor jargon:

```console
  starts:      at boot, without login
```

```console
  starts:      at login only
               run `loginctl enable-linger alice` to change that
```

If the instance must be up before anyone logs in and lingering is not permitted, install a system service with `sudo` instead.

## Lifecycle

```shell
spice connect service install      # install and start; re-run to upgrade in place
spice connect service uninstall    # stop and remove, keeping the Cloud identity
spice connect service start        # start an installed, stopped service
spice connect service stop         # stop it, leaving it installed and enabled
spice connect service restart      # restart through the supervisor and wait
spice connect service status       # state, boot persistence, and paths
spice connect service logs         # its output
```

Every action resolves the exact service for the instance directory — the current directory, or `--dir <path>`. You never pass a unit name, and no action can reach a service belonging to a different instance.

`start` and `stop` are idempotent and only change running state. `restart` is a supervisor-owned stop plus start that waits for the result; it never asks `spiced` to exit itself, and it never signals a foreground runtime.

With no service installed, `start` and `restart` exit non-zero and point at `install`, while `stop` and `logs` report the state and succeed — there is nothing to stop and nothing to read:

```console
$ spice connect service stop
Spice Cloud Connect service: not_installed (/srv/edge-analytics). Nothing to stop; the Cloud identity is untouched.
```

A user service must be managed by the user that owns it. Running a user-service action under `sudo` does not target root's service manager — it names the retry as the owning user. Conversely, an action on a system service without root prints the exact `sudo spice connect service ... --dir ...` command to re-run.

When a Spice command cannot complete, the supervisor's own commands are printed on stderr as recovery detail — `systemctl --user status …`, `journalctl -u … -f`, and so on. They are a fallback, not the interface.

## Logs

```shell
spice connect service logs         # latest 100 lines, no pager
spice connect service logs -n 500  # latest 500 lines
spice connect service logs -f      # snapshot, then follow
spice connect service logs -n 0 -f # follow only new output
```

`-f, --follow` matches `docker logs` and `kubectl logs`. `--tail` is deliberately not accepted. Following continues across supervisor restarts and log rotation, and interrupting the viewer never changes the service. An empty history prints `No logs yet for <service>.` and exits successfully.

## Restart-required deployments

Deployments are applied to the running service — a deployment never restarts it. When a deployment changes a section that is only read at startup, the service keeps serving its current configuration and the pending sections are named in the log and in status:

```shell
spice connect service logs -n 20
```

```console
INFO Spice Cloud Connect: applied the deployed spicepod (12 datasets, 1 models, 0 catalogs, 0 views); runtime, secrets takes effect when this instance next starts
```

```shell
spice connect status
```

```console
  restart:     required for runtime, secrets
```

`spice connect service restart` is the action that applies it. On success the pending list clears; a failed restart exits non-zero and leaves the pending state readable for diagnosis.

Crash recovery is separate and stays on: `Restart=on-failure` in the unit means systemd restarts a runtime that fails, which is unrelated to deployments.

## Status

```shell
spice connect service status
spice connect service status --output json
```

`spice connect service status` is the service half of [`spice connect status`](../../cli/reference/connect.md#status) — the same snapshot, the same field names, the same enum values. Automation never has to reconcile two schemas.

```console
$ spice connect service status
Spice Cloud Connect service: running (system service, systemd)
  service:     running (system service, systemd)
  starts:      at boot, without login
  owner:       alice
  directory:   /srv/edge-analytics
  definition:  /etc/systemd/system/spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service
  runtime:     /usr/local/lib/spice/spiced
  logs:        systemd journal, unit spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service
```

`state` is one of `not_installed`, `starting`, `running`, `stopping`, `stopped`, `failed`, or `unavailable`. `unavailable` means the supervisor itself could not be queried and comes with a diagnostic; `failed` and `unavailable` make the status command exit non-zero so automation does not read them as healthy.

## Uninstall the service

```shell
spice connect service uninstall
```

```console
Removed the Spice Cloud Connect service spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service.
The Cloud identity, project attachment, delivered secrets, and instance files were retained — `spice connect service install` resumes the same enrollment, and `spice connect` starts the instance in the foreground. `spice connect remove` is the command that releases the Cloud identity.
```

Uninstall is the inverse of install and nothing more. It removes only this instance's unit, staged runtime, and manifest, and it is idempotent. To release the Cloud identity and delete the project as well, use [`spice connect remove`](../../cli/reference/connect.md#remove).

## Notes

- **One managed service per host.** Until managed services accept per-instance HTTP and Flight endpoints, only one Spice-managed service can be installed on a host. Run additional instances in the foreground or under your own supervisor with unique endpoints.
- **`spice connect` respects an installed service.** On Linux, if the directory already has a service, `spice connect` starts that service and returns rather than launching a second runtime in your terminal. A running service is reported and left alone.
- **Service definitions hold no credentials** — no login token, no enrollment key, no API key.

## Next

- The [`spice connect` CLI reference](../../cli/reference/connect.md) for the full flag and subcommand list.
- [Headless enrollment](./headless.md) for containers and unattended provisioning.
