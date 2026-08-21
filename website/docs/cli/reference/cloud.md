---
title: 'cloud'
sidebar_label: 'cloud'
pagination_prev: null
pagination_next: null
---

Manage Spice Cloud: sign in, enroll a directory, create and inspect projects, manage secrets, read logs, and deploy.

Most subcommands require an active Spice Cloud session. See [Authentication](#authentication).

### Usage

```shell
spice cloud <command> [flags]
```

### Commands

| Command                              | Description                                                            |
| ------------------------------------ | ---------------------------------------------------------------------- |
| [`login`](#login)                    | Login to Spice Cloud                                                   |
| [`logout`](#logout)                  | Logout from Spice Cloud                                                |
| [`whoami`](#whoami)                  | Show current authenticated user                                        |
| [`orgs`](#orgs)                      | List organizations this identity can act on                            |
| [`org`](#org)                        | Show or change the active organization                                 |
| [`link`](#link)                      | Link the current directory to a Spice Cloud project                    |
| [`unlink`](#unlink)                  | Unlink the current directory from its Spice Cloud project              |
| [`projects`](#projects)              | List all projects                                                      |
| [`project`](#project)                | Create, inspect, and change one project                                |
| [`deploy`](#deploy)                  | Deploy a project                                                       |
| [`deployments`](#deployments)        | List deployments for a project                                         |
| [`status`](#status)                  | Show whether a project is healthy                                      |
| [`logs`](#logs)                      | View runtime logs                                                      |
| [`datasets`](#datasets)              | Show dataset load state for a project                                  |
| [`metrics`](#metrics)                | Show resource usage for a project's instances                          |
| [`secrets`](#secrets)                | Manage secrets for a project                                           |
| [`api-keys`](#api-keys)              | Show API keys for a project                                            |
| [`service`](#service)                | Install and manage the persistent service for this enrolled directory  |
| [`regions`](#regions-and-images)     | List available regions                                                 |
| [`images`](#regions-and-images)      | List available container images                                        |

## Authentication

### `login`

```shell
spice cloud login
spice cloud login subscription [--device]
spice cloud login token [--token <TOKEN>]
spice cloud login api [--client-id <ID>] [--client-secret <SECRET>]
```

Run with no subcommand to choose between a browser login and an access token. The chooser needs an interactive terminal; name a method explicitly when running non-interactively.

- `subscription` — Open a browser and complete the login there. `--device` prints the URL and a one-time code to enter on another device instead, for SSH sessions and headless shells.
- `token` — Log in with a Spice Cloud access token. Omit `--token` to enter it at a secure prompt. Generate a token at `/account/tokens` in the Spice Cloud portal. Alias: `pat`.
- `api` — Log in with OAuth client credentials, for CI and other automation. Omit either flag to enter its value interactively.

Flags:

- `-o`, `--output <FORMAT>` Where to store or print the resulting credentials: `env` (default, writes to a local `.env` file), `json` (prints them to stdout), or `keychain` (stores them in the platform keychain).
- `--org <ORG>` Store the credential for one organization rather than the whole membership.

The browser flow is bounded at 5 minutes; see [`spice login`](./login#browser-login-flow) for its polling and failure behavior.

### `logout`

```shell
spice cloud logout
spice cloud logout --scope all
```

Discards stored credentials from both the `.env` file and the platform keychain, and clears the active organization.

- `--scope <SCOPE>` Which stored sessions to discard: `active` (default) for the organization in effect, or `all` for every stored organization credential plus the shared user credential and the OAuth client pair.

`--scope active` is refused while a shared user credential is stored, because that credential may authenticate to every organization the user belongs to — use `--scope all`.

Logging out does not revoke the token in Spice Cloud. Revoke it from the portal.

### `whoami`

```shell
spice cloud whoami
```

Prints the authenticated identity, the organization in effect, and where that organization came from.

## Organizations

Commands act on one organization at a time. Name it inline as `<org>/<project>`, select it for a single invocation with `--org`, or set it for good with `spice cloud org use`.

### `orgs`

```shell
spice cloud orgs
```

Lists the organizations this identity can act on, marking the active one and which have a stored credential.

### `org`

```shell
spice cloud org use <ORG>
spice cloud org current
spice cloud org clear
```

- `use` — Set the organization subsequent commands act on, persisted for this machine. Alias: `switch`.
- `current` — Show the organization in effect.
- `clear` — Return to the organization the credential was issued for.

For scripts and CI prefer `SPICE_CLOUD_ORG`, which is scoped to the shell rather than to the machine.

## Enrolling a directory

An enrolled directory holds an instance identity in `.spice/identity.json`, and that identity is what attaches the instance to a project. Once a directory is enrolled and attached, commands run from it without `--project`.

### `link`

```shell
spice cloud link
spice cloud link <org>/<project>
```

Enrolls the current directory as a Spice Cloud instance and attaches it to a project. Omit the argument to choose from the projects available to you.

`link` requires an interactive terminal and a Spice Cloud user login — an OAuth client-credentials session cannot enroll an instance. For unattended enrollment, mint an enrollment key in the portal and start the runtime with [`spiced --token <enrollment-key>`](./spiced#spice-cloud-connect-flags).

Linking also:

- Adds `.spice/` to `.gitignore`, so the instance's mTLS private key is not committed.
- Uploads the local `spicepod.yaml` when the project has no stored Spicepod. When the project already has one, the local file is left alone; replace the stored Spicepod explicitly with `spice cloud project update --spicepod <path>`.

`link` does not start the runtime. Start it from the enrolled directory with [`spice run`](./run), or install a supervised service with [`spice cloud service install`](#service).

### `unlink`

```shell
spice cloud unlink
```

Detaches the current directory's instance, releases it in Spice Cloud, removes the directory's service when one is installed, and clears the local identity.

Stop the runtime before running it — `unlink` refuses while an instance is running in the directory.

`unlink` does not delete the project. Delete a project with [`spice cloud project delete`](#project). To remove the service and keep the Cloud identity, use [`spice cloud service uninstall`](#service).

## Project resolution

Commands that act on a project take `--project <org>/<project>` (alias `--app`). When it is omitted, the project comes from the enrolled instance in the current directory. Only `.spice/identity.json` is consulted; no other file in `.spice` selects a project.

A command with no `--project` and no enrolled identity fails rather than guessing.

The organization a command acts on is resolved separately, most authoritative first:

| Rank | Source                                             |
| ---- | -------------------------------------------------- |
| 1    | The `<org>` half of an `<org>/<project>` argument  |
| 2    | The `--org` flag                                    |
| 3    | The `SPICE_CLOUD_ORG` environment variable          |
| 4    | The enrolled instance in the current directory      |
| 5    | The active organization, set by `spice cloud org use` |
| 6    | The organization the credential was issued for      |

Commands that do not resolve a project — `orgs`, `projects`, `regions`, `images`, and `project create` — skip rank 4.

A bare `--project <name>` with no `<org>/` prefix takes the organization in effect.

When two explicitly stated sources name different organizations, the command fails and names both rather than picking one. The `<org>/<project>` argument, `--org`, and `SPICE_CLOUD_ORG` are explicit; the enrolled instance conflicts with `--org` and `SPICE_CLOUD_ORG` too. The active organization is a standing default and yields to any of them.

Commands that change something print the fully-qualified target and where its organization came from before they act.

## Managing projects

### `projects`

```shell
spice cloud projects [--org <ORG>]
```

Lists the projects in the organization in effect. Alias: `apps`.

### `project`

```shell
spice cloud project create <NAME> [flags]
spice cloud project get <org>/<project>
spice cloud project update [--project <org>/<project>] [flags]
spice cloud project delete <org>/<project> [--yes]
```

#### `project create`

`--kind` decides which kind of project is created. Either way, the command prints the new project's primary API key.

```shell
spice cloud project create <NAME>                              # Cloud Connect project
spice cloud project create <NAME> --kind set --region <REGION> # Spice-managed project
```

- **Omit `--kind`** for a **Cloud Connect** project — one Spice Cloud does not run, served by your own runtime. This is the project [`spice cloud link`](#link) attaches an instance to.
- **Name a `--kind`**, `set` or `cluster`, for a **Spice-managed** project, whose runtime Spice Cloud hosts. `--region` is required alongside it.

Flags that configure a hosted runtime are **refused, not ignored**, when no `--kind` is named: `--region`, `--replicas`, `--cpu`, `--memory`, `--storage-size-gb`, `--executor-replicas`, `--executor-cpu`, `--executor-memory`, and `--channel` each fail the command. A Cloud Connect project's region is not chosen here — it follows from the stamp its attached instance's control stream terminates on.

Flags:

- `--kind <KIND>` `set` or `cluster`. Omit for a Cloud Connect project.
- `--region <REGION>` Required with `--kind`, refused without it. Accepts a short region name (`us-east-1`) or a full data region name (`us-east-1-prod-aws-data`). List them with [`spice cloud regions`](#regions-and-images).
- `--description <TEXT>`
- `--visibility <VISIBILITY>` `private` (default) or `public`.
- `--spicepod <PATH>` Path to a `spicepod.yaml` to store on the project.

Hosted-runtime flags, each requiring `--kind`:

- `--replicas <N>` Scheduler replicas.
- `--cpu <VCPUS>` Scheduler CPU limit, in vCPUs.
- `--memory <SIZE>` Scheduler memory limit (for example `16Gi`).
- `--storage-size-gb <GB>` Block storage size.
- `--executor-replicas <N>`, `--executor-cpu <VCPUS>`, `--executor-memory <SIZE>` Executor sizing.
- `--channel <CHANNEL>` Update channel: `stable`, `preview`, `nightly`, or `internal`.

`--kind cluster` requires `--replicas 1` and all three executor flags.

The kind reported for the new project is Spice Cloud's answer, read from the create response rather than restated from the request.

#### `project get`

Shows one project's configuration.

#### `project update`

Changes a project's configuration. Takes `--description`, `--visibility`, `--replicas`, `--image`, `--region`, the CPU, memory, storage and executor flags, `--spicepod`, and `--channel`.

#### `project delete`

Deletes a project. Prompts for confirmation unless `--yes` is passed. Alias: `rm`.

## Deploying

### `deploy`

```shell
spice cloud deploy [--project <org>/<project>] [flags]
```

Deploys the project's stored Spicepod. Local edits are not synchronized — replace the stored Spicepod with `spice cloud project update --spicepod <path>`, or deploy a different repository revision with `--branch` / `--commit`.

- `--project <ORG/PROJECT>`
- `--image <IMAGE>` Container image tag to deploy.
- `--branch <BRANCH>` Git branch to deploy the Spicepod from. Defaults to the project's production branch.
- `--commit <SHA>` Git commit SHA to deploy the Spicepod from.
- `--replicas <N>`
- `--debug` Enable debug mode.
- `--wait` Wait for the deployment to reach a terminal status.
- `--timeout <DURATION>` How long to wait with `--wait`. Default `10m`.
- `-o`, `--output <FORMAT>` `table` (default) or `json`.

### `deployments`

```shell
spice cloud deployments
```

Lists a project's deployments, most recent first.

- `--project <ORG/PROJECT>`
- `--limit <N>` Default `10`.
- `--status <STATUS>` Filter by deployment status.
- `-o`, `--output <FORMAT>`

## Inspecting

### `status`

```shell
spice cloud status [--project <org>/<project>] [--instance <NAME>]
```

Reports the project, its latest deployment, every instance serving it with per-instance health, and any dataset that is not loading. The current directory's own enrolled-instance state — connection, service, and deployment — is appended under `Local enrolled-instance state:`.

The project half of the report comes from Spice Cloud, so the command needs an authenticated session and a project it can resolve. Run with no `--project` from a directory that holds no enrolled identity, it exits non-zero with `No app specified.` It also exits non-zero when the local state is degraded, or when instance and dataset health could not be read.

- `--project <ORG/PROJECT>`
- `--instance <NAME>` Pin the report to one instance. Without it the report comes from the project's general endpoint and describes the deployment as a whole.
- `-o`, `--output <FORMAT>` `table` (default) or `json`.

`--output json` carries the project report at the top level and the local enrolled-instance state under `link`:

```json
{
  "schema_version": 1,
  "project": {},
  "org": "acme",
  "instance": null,
  "latest_deployment": {},
  "instances": [],
  "datasets_total": 0,
  "datasets_unhealthy": [],
  "runtime_error": null,
  "link": { "connection": {}, "service": {}, "deployment": {} }
}
```

### `logs`

```shell
spice cloud logs
spice cloud logs --level error --limit 500
spice cloud logs -f
```

Reads logs from the runtime instances serving the project. When Spice Cloud returns no logs, or cannot be reached, and the current directory's enrolled instance is attached to that project, the directory's installed service logs are read instead and a warning names the cause.

- `--project <ORG/PROJECT>`
- `--limit <N>` Maximum entries to request per runtime instance. Default `100`, maximum `100000`. Alias: `--tail`.
- `--level <LEVEL>` `all` (default), `warn`, or `error`. Entries with no level are always shown.
- `--since <TIMESTAMP>` Only entries after this RFC 3339 timestamp.
- `-f`, `--follow` Stream new entries. Supported only on local service logs, and not combinable with `--level`, `--since`, or `--output json`.
- `-o`, `--output <FORMAT>` `table` (default) or `json`.

### `datasets`

```shell
spice cloud datasets
```

Shows the dataset load state for a project. Takes `--project`, `--instance`, and `-o`.

### `metrics`

```shell
spice cloud metrics --window 5m
```

Shows resource usage for a project's instances. Takes `--project`, `-o`, and `--window <DURATION>` for the counter metrics window.

### `api-keys`

```shell
spice cloud api-keys [--regenerate <1|2>]
```

Shows a project's API keys. `--regenerate <1|2>` reissues one of the two keys. Takes `--project` and `-o`.

## Secrets

```shell
spice cloud secrets list
spice cloud secrets set <NAME> <VALUE>
spice cloud secrets get <NAME>
spice cloud secrets delete <NAME>
```

Manages a project's secrets. Every subcommand takes `--project <ORG/PROJECT>` and `-o`. `list` has the alias `ls`.

## Service

```shell
spice cloud service install
spice cloud service uninstall
spice cloud service start
spice cloud service stop
spice cloud service restart
```

Manages a supervised service that runs the enrolled instance in the current directory. Every action resolves its target from that directory — there is no way to name a systemd unit or a launchd label.

- `install` — Stage the runtime, write the service definition, and start it. Idempotent: re-running restages the current runtime and restarts the service without touching the enrolled identity. Requires an enrolled identity and an installed runtime.
- `uninstall` — Stop and remove the service, keeping the Cloud identity. [`spice cloud unlink`](#unlink) is what releases the identity.
- `start` — Start an installed, stopped service. Succeeds if it is already running.
- `stop` — Stop a running service, leaving it installed and enabled.
- `restart` — Restart the service through its supervisor and wait for the result.

Run `spice cloud service install` to install a user service, and `sudo spice cloud service install` for a system service that starts at boot without a user login.

Supported on Linux with systemd and on macOS with launchd. On other hosts, run `spiced` from the enrolled directory under your own supervisor.

Read the service's logs with [`spice cloud logs -f`](#logs), and its health with [`spice cloud status`](#status).

## Regions and images

`spice cloud regions` lists the regions available for `spice cloud project create --region`, marking the default.

`spice cloud images [--channel <CHANNEL>]` lists the container images available for `spice cloud deploy --image`.

## Flags

Accepted by every `spice cloud` command:

- `--org <ORG>` Organization to act on, outranking `SPICE_CLOUD_ORG` and the active organization.
- `--machine` Machine-readable mode: prefer JSON output where supported, and always emit structured JSON errors. Alias: `--programmatic`.
- `-v`, `--verbose` Increase log verbosity. `-v` for debug, `-vv` for trace.
- `-h`, `--help` Print the help message.

Most subcommands also take `-o`, `--output <FORMAT>`, which is `table` or `json`.

## Environment variables

| Variable                     | Purpose                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| `SPICE_CLOUD_ORG`            | Organization to act on, outranking the active organization                 |
| `SPICE_CLOUD_PAT`            | Access token for `spice cloud login token`                                 |
| `SPICE_CLOUD_CLIENT_ID`      | OAuth client ID for `spice cloud login api`                                |
| `SPICE_CLOUD_CLIENT_SECRET`  | OAuth client secret for `spice cloud login api`                            |
| `SPICE_CONFIG_DIR`           | Complete path to the instance state directory, instead of `<dir>/.spice`   |

## See also

- [Spice Cloud Platform](../../deployment/cloud/index.md)
- [Cloud Connect](../../deployment/cloud/cloud-connect/index.md)
- [`spiced`](./spiced#spice-cloud-connect-flags) — unattended enrollment with `--token`
- [`spice login`](./login) — data source credentials, and the Spice.ai browser login flow
