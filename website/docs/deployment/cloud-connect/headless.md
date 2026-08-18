---
title: 'Headless Cloud Connect'
sidebar_label: 'Headless'
description: 'Connect a Spice instance to Spice Cloud without an interactive terminal.'
keywords: [spice.ai, cloud connect, enrollment key, docker, helm, headless]
sidebar_position: 3
tags:
  - deployment
  - cloud-connect
  - docker
  - kubernetes
  - spiceai
---

Use an enrollment key to connect a container or unattended host to Spice Cloud.

## Before you start

Get an [enrollment key](https://spice.ai/connect). Each key can enroll one instance.

Prepare writable persistent storage for the instance identity. If you lose the identity, you must enroll the instance again.

## Run `spiced`

```shell
SPICE_CONFIG_DIR=/data/.spice spiced --token "$SPICE_ENROLL_KEY"
```

After the runtime starts, open the portal link in the runtime log. Use the link to create a project for the instance.

After a successful enrollment, remove `--token` and the enrollment key. Keep `SPICE_CONFIG_DIR` on persistent storage.

## Docker

Create a persistent volume. Pass the key through an environment variable:

```shell
docker volume create spice-identity

docker run --rm \
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

When the runtime is ready, stop the container. Start it again without `--token`:

```shell
docker run -d \
  --restart unless-stopped \
  -p 8090:8090 \
  -p 50051:50051 \
  -v spice-identity:/data \
  -e SPICE_CONFIG_DIR=/data/.spice \
  spiceai/spiceai:latest \
  --http 0.0.0.0:8090 \
  --flight 0.0.0.0:50051
```

## Helm

Create a Kubernetes Secret:

```shell
kubectl create secret generic spice-cloud-connect \
  --from-literal=enroll-key="$SPICE_ENROLL_KEY"
```

Add the key and a persistent volume to `values.yaml`:

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

additionalEnv:
  - name: SPICE_ENROLL_KEY
    valueFrom:
      secretKeyRef:
        name: spice-cloud-connect
        key: enroll-key
  - name: SPICE_CONFIG_DIR
    value: /data/.spice
```

Install the chart:

```shell
helm upgrade --install spiceai spiceai/spiceai -f values.yaml
```

When the pod is ready, remove `--token` and `SPICE_ENROLL_KEY` from `values.yaml`. Then run the Helm command again.

:::warning
Use one replica. Multiple replicas cannot share one Cloud Connect identity.
:::

For more chart options, see the [Helm deployment guide](../kubernetes/helm/index.md).

## Optional region label

Use `--region` to record the instance location:

```shell
spiced --token "$SPICE_ENROLL_KEY" --region on-prem-syd
```

The label must contain 2–64 lowercase letters, digits, or hyphens.

## Check the connection

```shell
spice connect status --output json
```

For all runtime options, see the [`spiced` command reference](../../cli/reference/spiced.md).
