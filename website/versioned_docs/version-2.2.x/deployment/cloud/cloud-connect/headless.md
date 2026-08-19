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

An enrollment key connects a container or unattended host to Spice Cloud, with no interactive terminal involved.

## Requirements

An [enrollment key](https://spice.ai/connect), which enrolls exactly one instance, and writable persistent storage for the identity the enrollment issues. A lost identity cannot be recovered — that instance has to enroll again.

## Run `spiced`

```shell
SPICE_CONFIG_DIR=/data/.spice spiced --token "$SPICE_ENROLL_KEY"
```

The runtime log carries a portal link that creates the instance's project. Once enrollment succeeds, `--token` and the key are no longer needed; `SPICE_CONFIG_DIR` stays, on persistent storage.

## Docker

The key travels in an environment variable rather than on the command line, and the identity lives on a named volume:

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

Once the runtime is ready, the container is recreated without `--token`:

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

The key comes from a Kubernetes Secret:

```shell
kubectl create secret generic spice-cloud-connect \
  --from-literal=enroll-key="$SPICE_ENROLL_KEY"
```

`values.yaml` injects it and mounts a volume for the identity:

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

Installing the chart:

```shell
helm upgrade --install spiceai spiceai/spiceai -f values.yaml
```

Once the pod is ready, `--token` and `SPICE_ENROLL_KEY` come out of `values.yaml` and the release is upgraded again.

:::warning
One replica only. Two replicas cannot share one Cloud Connect identity.
:::

The [Helm deployment guide](../../kubernetes/helm/index.md) documents the rest of the chart.

## Region label

`--region` records where the instance runs, which Spice Cloud uses to resolve its gateway:

```shell
spiced --token "$SPICE_ENROLL_KEY" --region on-prem-syd
```

The label is 2–64 lowercase letters, digits, or hyphens, and is a declared value rather than a probed one.

## Checking the connection

```shell
spice connect status --output json
```

The [`spiced` command reference](../../../cli/reference/spiced.md) documents every runtime option.
