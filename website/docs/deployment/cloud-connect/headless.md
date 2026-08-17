---
title: 'Headless Cloud Connect'
sidebar_label: 'Headless'
description: 'Enroll a Spice instance with no browser, login, or terminal using spiced --token — for Docker, Helm, and unattended provisioning.'
keywords:
  [spice.ai, cloud connect, enrollment key, spiced --token, docker, helm, headless, unattended]
sidebar_position: 3
tags:
  - deployment
  - cloud-connect
  - docker
  - kubernetes
  - spiceai
---

`spiced --token <enrollment-key>` is the direct path for a host or container with no browser, no saved Spice login, and no interactive terminal. It is the same flag for `docker run`, for a Helm values block, and for a bare `spiced` under your own supervisor.

```shell
spiced --token "$SPICE_ENROLL_KEY"
```

## Get an enrollment key

Mint one in the Spice Cloud portal. An enrollment key is:

- **single-use** — it enrolls exactly one instance;
- **short-lived** — it carries an expiry;
- **organization-scoped** — the key's organization is authoritative and cannot be overridden by a saved login;
- written `spice-enroll-…`, and shown once.

Treat the prefix as a secret-scanner signature.

## How enrollment behaves

`--token` enrolls the instance **before** the runtime is built and before any listener binds. The process stays unready until the issued identity is durable on disk, then discards the key and starts normally.

| Situation                             | Result                                                        |
| ------------------------------------- | ------------------------------------------------------------- |
| Valid key, no existing identity       | Enrolls, persists the identity, starts serving                |
| A valid identity already exists       | The identity wins; the key is **not** redeemed                |
| Invalid, expired, or already-used key | Startup fails non-zero — there is no prompt to fall back to   |
| Retryable Cloud error                 | The runtime stays unready and retries with bounded backoff    |
| No key and no identity                | The runtime starts normally and never connects to Spice Cloud |

There is no `--cloud-connect` flag. An enrolled identity in the instance's `.spice` directory is what connects a runtime; without one, `spiced` does not connect.

An instance enrolled with a key is **not attached to a project** — a key authorizes enrollment, not project creation. The final startup log carries the link to create one:

```console
INFO Spice Cloud Connect: connected to acme — not yet attached to a project
INFO Create one: https://spice.ai/acme/new?instance=inst_0123456789
```

Open that link to create the project with this instance preselected. Alternatively, on a host with a terminal and a login for the same organization, run `spice connect` from the instance directory — it detects the enrolled-but-unattached instance and offers to attach one:

```console
? Create a project for this instance now? › no / yes
? Project name › edge-analytics
```

## Persist the identity

:::danger The identity is the restart credential, not the key
A consumed enrollment key cannot restart an instance. What restarts it is the identity written to the Spice config directory. Mount that directory as writable persistent storage.

If the storage is lost, the instance cannot reconnect and needs a fresh enrollment key.
:::

`SPICE_CONFIG_DIR` places the identity wherever the persistent volume is mounted:

```shell
SPICE_CONFIG_DIR=/data/.spice
```

## Docker

Pass the key from the environment, never as a literal in a script or image:

```bash
docker run --rm -it \
  -p 8090:8090 \
  -p 50051:50051 \
  -v spice-identity:/data \
  -e SPICE_CONFIG_DIR=/data/.spice \
  -e SPICE_ENROLL_KEY \
  spiceai/spiceai:latest \
  --token "$SPICE_ENROLL_KEY" \
  --http 0.0.0.0:8090 \
  --flight 0.0.0.0:50051
```

No Spicepod is mounted, and that is fine: a Cloud Connected runtime with no local Spicepod starts with no app and waits for its first deployment, so the control plane can still reach it.

The named volume `spice-identity` holds the issued identity, so later starts reconnect. Recreate the container without `--token` once the runtime is ready:

```bash
docker run -d \
  -p 8090:8090 \
  -p 50051:50051 \
  -v spice-identity:/data \
  -e SPICE_CONFIG_DIR=/data/.spice \
  spiceai/spiceai:latest \
  --http 0.0.0.0:8090 \
  --flight 0.0.0.0:50051
```

Use the container runtime's restart policy (`--restart unless-stopped`) for crash recovery. The [`spice connect service`](./service.md) commands are for hosts, not containers.

## Helm

Create the Secret first — never put the key in `values.yaml`:

```bash
kubectl create secret generic spice-cloud-connect \
  --from-literal=enroll-key="$SPICE_ENROLL_KEY"
```

Then deploy a single-replica StatefulSet whose volume retains the issued identity:

```yaml
replicaCount: 1

stateful:
  enabled: true
  size: 1Gi
  mountPath: /data

command:
  - /usr/local/bin/spiced
  - --token
  - '$(SPICE_ENROLL_KEY)'
  - --http
  - 0.0.0.0:8090
  - --metrics
  - 0.0.0.0:9090
  - --flight
  - 0.0.0.0:50051

additionalEnv:
  - name: SPICE_ENROLL_KEY
    valueFrom:
      secretKeyRef:
        name: spice-cloud-connect
        key: enroll-key
  - name: SPICE_CONFIG_DIR
    value: /data/.spice
```

```bash
helm upgrade --install spiceai spiceai/spiceai -f values.yaml
```

Once the pod is ready and the identity is on the volume, remove the `--token` entry and the `SPICE_ENROLL_KEY` variable and upgrade again. The identity on `/data` reconnects the instance on every later start.

:::warning One key, one replica
This is a **single-replica** deployment. One enrollment key creates one instance identity, and replicas sharing a volume would fight over the same identity. Scaling a Cloud Connected StatefulSet past one replica is not supported — multi-replica and operator-managed enrollment are a separate Kubernetes experience.
:::

See the [Helm deployment guide](../kubernetes/helm/index.md) for the rest of the chart's surface.

## Keep the key out of everything else

Spice never writes an enrollment key to a file, a log line, telemetry, status output, or a generated service definition, and never echoes it at a prompt. Two exposures are yours to manage:

- **Process listings.** A key passed on a command line is visible to same-host process listings for the lifetime of that process, because the operating system retains the original `argv`. Recreate the container or pod without the flag once the runtime is ready.
- **Stored manifests.** Keep the key in a Kubernetes Secret or a shell variable sourced at run time. Do not commit it to a values file, Compose file, or image.

`spice connect` refuses a key as a positional argument for the same reason:

```console
$ spice connect spice-enroll-...
ERROR Invalid argument: An enrollment key is not accepted as a positional argument. For unattended enrollment, run `spiced --token <enrollment-key>` from the instance directory. See: https://spiceai.org/docs
```

## Record where the instance runs

`--region <REGION>` records a location label on the instance at enrollment — for example `us-west-2` or `on-prem-syd`. It is a declared label of 2–64 lowercase letters, digits, and hyphens, not a probed fact, and Spice Cloud uses it to pick the nearest gateway. It is only meaningful with `--token`, and omitting it leaves any previously recorded region unchanged.

```shell
spiced --token "$SPICE_ENROLL_KEY" --region on-prem-syd
```

## Check state and restart

`spice connect status` works from the instance directory on any platform, including inside a container:

```shell
spice connect status --output json
```

Restart-required deployments are reported the same way as everywhere else — through the runtime log, `spice connect status`, and `GET /v1/cloud-connect/status`. In a container the restart is recreating the container or pod; there is no supervisor-managed service to restart.

## Next

- [Cloud Connect overview](./index.md) for deployment and restart semantics.
- [`spiced` CLI reference](../../cli/reference/spiced.md) for every runtime flag.
