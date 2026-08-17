---
title: 'Cloud Connect as a Persistent Service'
sidebar_label: 'Persistent service'
description: 'Install a connected Spice instance as a user or system service under systemd on Linux or launchd on macOS, and manage its full lifecycle with spice connect service.'
keywords:
  [
    spice.ai,
    cloud connect,
    systemd,
    launchd,
    service,
    spice connect service install,
    boot persistence
  ]
sidebar_position: 2
tags:
  - deployment
  - cloud-connect
  - systemd
  - launchd
  - spiceai
---

`spice connect service` installs a connected instance under the host's service manager and manages its whole lifecycle — install, uninstall, start, stop, restart, status, and logs — so the instance survives reboots and closed terminals.

:::info Linux and macOS
`spice connect service` drives **systemd** on Linux and **launchd** on macOS. The commands, the status vocabulary, and the JSON schema are the same on both; what differs is where the definition is written and where the logs come from.

Windows has no managed service: every lifecycle action except `status` exits non-zero there and points at running `spiced` under your own supervisor. `spice connect service status` reports on every platform. In containers, use [headless enrollment](./headless.md) with the container runtime's restart policy.
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

| Invocation                           | Linux                                                | macOS                                        | Starts                                                                   |
| ------------------------------------ | ---------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `spice connect service install`      | systemd **user** service in `~/.config/systemd/user` | **LaunchAgent** in `~/Library/LaunchAgents`  | Linux: at login, or at boot if the account lingers. macOS: at login only |
| `sudo spice connect service install` | systemd **system** unit in `/etc/systemd/system`     | **LaunchDaemon** in `/Library/LaunchDaemons` | At boot, without login                                                   |

A system service still runs `spiced` as the non-root operator who invoked `sudo` — installation needs root, serving data does not. The operator is taken from `SUDO_UID`/`SUDO_GID`, so install with `sudo` from that account rather than from a root shell:

```console
$ spice connect service install    # in a root shell, not via sudo
ERROR Invalid argument: Failed to install the Spice Cloud Connect service: SUDO_UID and SUDO_GID must identify the non-root operator who will run spiced. Re-run from that account with `sudo spice connect service install`.
```

Installation stages a copy of the runtime binary for this instance's service to run, in the domain that owns the service:

| Scope    | Linux                                            | macOS                                                           |
| -------- | ------------------------------------------------ | --------------------------------------------------------------- |
| `user`   | `~/.local/share/spice/services/<service>/spiced` | `~/Library/Application Support/spice/services/<service>/spiced` |
| `system` | `/usr/local/lib/spice/<service>/spiced`          | `/usr/local/lib/spice/<service>/spiced`                         |

It then writes the definition, starts the service, and waits for the runtime's `/health` endpoint before reporting success. Success needs one uninterrupted run, not just a healthy sample — a runtime that answers and then restarts does not pass. If it does not pass, the previous definition and the previous runtime are put back and the install reports what it restored, so an upgrade never leaves an instance worse off than the one it replaced:

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

Re-running `install` is the in-place upgrade: it restages the current runtime binary, rewrites the definition, and restarts the service. The enrolled identity is untouched.

:::warning A LaunchAgent needs a desktop login session
An unprivileged install on macOS bootstraps the agent into your account's GUI login session, which does not exist over SSH or on a headless Mac. The install fails there before writing anything and names both alternatives: log in to that Mac at the desktop as the account that will run the instance, or install a system service with `sudo spice connect service install`.
:::

### Boot persistence, stated plainly

"At login" and "at boot, without login" are different promises. Status reports which one you have as an operator fact, never as supervisor jargon, and names the command that would change it:

```console
  starts:      at boot, without login
```

**Linux.** A systemd user service normally starts at login and stops at logout. Installation attempts `loginctl enable-linger <user>` and then **verifies the result**, because policy can refuse it:

```console
  starts:      at login only
               run `loginctl enable-linger alice` to change that
```

**macOS.** A LaunchAgent starts with its owner's GUI login session and **cannot be made to start before one** — launchd has no equivalent of lingering. Boot persistence on macOS means a LaunchDaemon, so that is what the remediation installs:

```console
  starts:      at login only
               run `spice connect service uninstall --dir /Users/alice/work/edge-analytics && sudo spice connect service install --dir /Users/alice/work/edge-analytics` to change that
```

If the instance must be up before anyone logs in, install a system service with `sudo`. On Linux that is also the answer when lingering is not permitted.

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

Every action resolves the exact service for the instance directory — the current directory, or `--dir <path>`. You never pass a unit name or a launchd label, and no action can reach a service belonging to a different instance.

`start` and `stop` are idempotent and only change running state. `stop` leaves the definition in place, so the service still comes back on its own at the next boot — or, for a LaunchAgent, at the next login. `restart` is a supervisor-owned stop plus start that waits for the result; it never asks `spiced` to exit itself, and it never signals a foreground runtime.

With no service installed, `start` and `restart` exit non-zero and point at `install`, while `stop` and `logs` report the state and succeed — there is nothing to stop and nothing to read:

```console
$ spice connect service stop
Spice Cloud Connect service: not_installed (/srv/edge-analytics). Nothing to stop; the Cloud identity is untouched.
```

A user service must be managed by the user that owns it. Running a user-service action under `sudo` does not target root's service manager — it names the retry as the owning user. Conversely, an action on a system service without root prints the exact `sudo spice connect service ... --dir ...` command to re-run.

When a Spice command cannot complete, the supervisor's own commands for that service are printed on stderr as recovery detail — `systemctl --user status …` and `journalctl -u … -f` on Linux, `launchctl print gui/501/ai.spice.cloud-connect.…` and `tail -f …` on macOS. They are a fallback, not the interface.

## Logs

```shell
spice connect service logs         # latest 100 lines, no pager
spice connect service logs -n 500  # latest 500 lines
spice connect service logs -f      # snapshot, then follow
spice connect service logs -n 0 -f # follow only new output
```

`-f, --follow` matches `docker logs` and `kubectl logs`. `--tail` is deliberately not accepted. Following continues across supervisor restarts and log rotation, and interrupting the viewer never changes the service. An empty history prints `No logs yet for <service>.` and exits successfully.

Where those lines come from depends on the supervisor, and `status` names it on the `logs:` line:

- **Linux** — the systemd journal, queried by unit.
- **macOS** — the runtime's own bounded files. launchd owns no log store: it writes a job's output to whatever files the definition names and never bounds them, which is how a long-running daemon fills a disk. So the definition names none, and a managed instance writes one plain-text stream to `~/Library/Logs/Spice/<service>/spiced.log` for a user service, or `/Library/Logs/Spice/<service>/spiced.log` for a system service. That stream rotates through at most five files of 10 MiB each — `spiced.log` plus `spiced.log.1` … `spiced.log.4` — and the oldest is discarded, so the policy is bounded at about 50 MiB per service. `-n` reads back across the rotated files, and `--follow` follows the file it holds open through a rotation rather than jumping to whatever is live, so a burst of rotations between two polls costs no output.

On macOS, uninstalling the service leaves those log files in place; a reinstall continues the same log.

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

Crash recovery is separate and stays on: the definition asks the supervisor to bring back a runtime that fails — `Restart=on-failure` in a systemd unit, `KeepAlive` limited to `SuccessfulExit=false` in a launchd definition — while the clean exit that `spice connect service stop` produces stays down. Neither has anything to do with deployments.

## Status

```shell
spice connect service status
spice connect service status --output json
```

`spice connect service status` is the service half of [`spice connect status`](../../cli/reference/connect.md#status) — the same snapshot, the same field names, the same enum values. Automation never has to reconcile two schemas.

A system service under systemd:

```console
$ spice connect service status
Spice Cloud Connect service: running (system service, systemd)
  service:     running (system service, systemd)
  starts:      at boot, without login
  owner:       alice
  directory:   /srv/edge-analytics
  definition:  /etc/systemd/system/spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service
  runtime:     /usr/local/lib/spice/edge-analytics-59e8c853e76c15ba/spiced
  logs:        systemd journal, unit spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service
```

The same instance as a user service under launchd — same fields, same enum values, macOS paths:

```console
$ spice connect service status
Spice Cloud Connect service: running (user service, launchd)
  service:     running (user service, launchd)
  starts:      at login only
               run `spice connect service uninstall --dir /Users/alice/work/edge-analytics && sudo spice connect service install --dir /Users/alice/work/edge-analytics` to change that
  owner:       alice
  directory:   /Users/alice/work/edge-analytics
  definition:  /Users/alice/Library/LaunchAgents/ai.spice.cloud-connect.edge-analytics-3f9c2d1e4a7b58c0.plist
  runtime:     /Users/alice/Library/Application Support/spice/services/edge-analytics-3f9c2d1e4a7b58c0/spiced
  logs:        /Users/alice/Library/Logs/Spice/edge-analytics-3f9c2d1e4a7b58c0/spiced.log
```

`state` is one of `not_installed`, `starting`, `running`, `stopping`, `stopped`, `failed`, or `unavailable`. `unavailable` means the supervisor itself could not be queried and comes with a diagnostic; `failed` and `unavailable` make the status command exit non-zero so automation does not read them as healthy.

In JSON, `supervisor` is `systemd` or `launchd`, `scope` is `user` or `system`, and `starts` is `boot_without_login`, `login_only`, `disabled`, or `unavailable` — one vocabulary for both platforms, so automation branches on the outcome rather than on the host.

## Uninstall the service

```shell
spice connect service uninstall
```

```console
Removed the Spice Cloud Connect service spiced-cloud-connect-edge-analytics-59e8c853e76c15ba.service.
The Cloud identity, project attachment, delivered secrets, and instance files were retained — `spice connect service install` resumes the same enrollment, and `spice connect` starts the instance in the foreground. `spice connect remove` is the command that releases the Cloud identity.
```

Uninstall is the inverse of install and nothing more. It removes only this instance's definition, staged runtime, and manifest — on macOS the log files stay, so a reinstall continues the same log — and it is idempotent. To release the Cloud identity and delete the project as well, use [`spice connect remove`](../../cli/reference/connect.md#remove).

## Notes

- **One managed service per host.** Until managed services accept per-instance HTTP and Flight endpoints, only one Spice-managed service can be installed on a host. Run additional instances in the foreground or under your own supervisor with unique endpoints.
- **`spice connect` respects an installed service.** On Linux and macOS, if the directory already has a service, `spice connect` starts that service and returns rather than launching a second runtime in your terminal. A running service is reported and left alone.
- **Service definitions hold no credentials** — no login token, no enrollment key, no API key.

## Next

- The [`spice connect` CLI reference](../../cli/reference/connect.md) for the full flag and subcommand list.
- [Headless enrollment](./headless.md) for containers and unattended provisioning.
