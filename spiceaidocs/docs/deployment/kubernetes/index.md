---
title: 'Helm - Kubernetes'
sidebar_label: 'Helm - Kubernetes'
sidebar_position: 1
description: 'Deploy Spice.ai in Kubernetes using Helm.'
pagination_prev: 'deployment/index'
pagination_next: null
---

## TL;DR

```bash
helm repo add spiceai https://helm.spiceai.org
helm upgrade --install spiceai spiceai/spiceai
```

Deploy Spice using Helm in Kubernetes.

## Values

The following table lists the configurable parameters of the Spice.ai chart and their default values. Override the default values by creating a `values.yaml` file.

```bash
helm upgrade --install spiceai spiceai/spiceai -f values.yaml
```

### Spicepod

Add a custom Spicepod to be loaded by the Spice.ai runtime by overriding the `spicepod` value in the `values.yaml` file.

```yaml
spicepod:
  name: app
  version: v1beta1
  kind: Spicepod

  datasets:
    - from: s3://spiceai-demo-datasets/taxi_trips/2024/
      name: taxi_trips
      description: Demo taxi trips in s3
      acceleration:
        enabled: true
```

### Common Parameters

| Name                | Description                                                                                          | Value                  |
| ------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| `image.repository`    | The repository of the Docker image .                                                                           | `spiceai`        |
| `image.tag`  | Replace with a specific version of Spice.ai to run.                                                                              | `latest` |
| `replicaCount`      | Number of Spice.ai replicas to run | `1`                   |
| `image.pullSecrets` | Specify docker-registry secret names as an array                                                     | `[]`                   |
| `tolerations`      | List of node taints to tolerate                                        | `[]`                   |
| `resources`        | Resource requests and limits for the Spice.ai container                                              | `{}`                   |
| `additionalEnv`    | Additional environment variables to set in the Spice.ai container                                   | `[]`                   |


### Adding extra environment variables

Add extra environment variables using the `additionalEnv` property. This can be useful when combining with the [Environement Secret Store](../../secret-stores/env/index.md).

```yaml
additionalEnv:
  - name: SPICE_SECRET_SPICEAI_KEY
    valueFrom:
      secretKeyRef:
        name: spice-secrets
        key: spiceai-key
```

### Example values.yaml

```yaml
image:
  repository: spiceai/spiceai
  tag: 0.10.0-alpha
replicaCount: 1
additionalEnv:
  - name: SPICE_SECRET_SPICEAI_KEY
    valueFrom:
      secretKeyRef:
        name: spice-secrets
        key: spiceai-key
spicepod:
  name: app
  version: v1beta1
  kind: Spicepod

  datasets:
    - from: s3://spiceai-demo-datasets/taxi_trips/2024/
      name: taxi_trips
      description: Demo taxi trips in s3
      acceleration:
        enabled: true
        # Uncomment to refresh the acceleration on a schedule
        # refresh_interval: 1h
        # refresh_mode: full
```