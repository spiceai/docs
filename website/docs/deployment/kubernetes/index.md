---
title: 'Helm - Kubernetes'
sidebar_label: 'Helm - Kubernetes'
sidebar_position: 2
description: 'Deploy Spice.ai in Kubernetes using Helm.'
pagination_prev: 'deployment/index'
pagination_next: null
tags:
  - deployment
  - kubernetes
  - spiceai
---

## TL;DR

```bash
helm repo add spiceai https://helm.spiceai.org
helm repo update
helm upgrade --install spiceai spiceai/spiceai
```

Deploy Spice using Helm in Kubernetes.

For a quick start with Helm, refer to the [Helm Quickstart Guide](https://helm.sh/docs/intro/quickstart/#initialize-a-helm-chart-repository).

## Values

The following table lists the configurable parameters of the Spice.ai chart and their [default values](https://github.com/spiceai/spiceai/blob/trunk/deploy/chart/values.yaml). Override the default values by creating a `values.yaml` file ([example](#example-valuesyaml)).

```bash
helm upgrade --install spiceai spiceai/spiceai -f values.yaml
```

## Spicepod

Define a [Spicepod](https://spiceai.org/docs/getting-started/spicepods) to be loaded by the Spice.ai runtime by overriding the `spicepod` value in the `values.yaml` file.

```yaml
spicepod:
  name: app
  version: v1
  kind: Spicepod

  datasets:
    - from: s3://spiceai-demo-datasets/taxi_trips/2024/
      name: taxi_trips
      description: Demo taxi trips in s3
      params:
        file_format: parquet
      acceleration:
        enabled: true
```

## Common Parameters

| **Name**                            | **Description**                                                                                                                                                                               | **Value**  |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| `image.repository`                   | The repository of the Docker image.                                                                                                                                                            | `spiceai`  |
| `image.tag`                          | Replace with a specific version of Spice.ai to run.                                                                                                                                            | `latest`   |
| `monitoring.podMonitoring.enabled`   | Enable Prometheus metrics collection for the Spice pods. Requires the [Prometheus Operator](https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.PodMonitor) CRDs.     | `false`    |
| `replicaCount`                       | Number of Spice.ai replicas to run.                                                                                                                                                            | `1`        |
| `image.pullSecrets`                  | Specify Docker registry secret names as an array.                                                                                                                                              | `[]`       |
| `tolerations`                        | List of node taints to tolerate.                                                                                                                                                               | `[]`       |
| `resources`                          | Resource requests and limits for the Spice.ai container. See [Container resource examples](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#example-1).        | `{}`       |
| `additionalEnv`                      | Additional environment variables to set in the Spice.ai container.                                                                                                                             | `[]`       |

## Environment Variables and Secrets

Add extra environment variables using the `additionalEnv` property. This can be useful when combining with the [Environment Secret Store](/docs/components/secret-stores/env/index.md).

```yaml
additionalEnv:
  - name: SPICED_LOG
    value: "DEBUG"
  - name: SPICE_SECRET_SPICEAI_KEY
    valueFrom:
      secretKeyRef:
        name: spice-secrets
        key: spiceai-key
```

To create a test secret:

```bash
kubectl create secret generic spice-secrets --from-literal=spiceai-key="secret-value"
```

Furthe reading:

- [Kubernets Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Good practices for Kubernetes Secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)

## Monitoring

The Spice Helm chart includes compatibility with the [Prometheus Operator](https://prometheus-operator.dev/) for collecting Prometheus metrics that can be visualized in the [Spice Grafana dashboard](../../clients/grafana/index.md). To enable this feature, set the `monitoring.podMonitoring.enabled` value to `true`. This will create a `PodMonitor` resource for the Spice.ai pods that will configure Prometheus to scrape metrics from the Spice.ai pods.

<details>
  <summary>Install the Prometheus Operator</summary>
  <div>
    The easiest way to install the Prometheus Operator along with Grafana is to use the [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README.md) Helm chart.

    ```bash
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install prometheus-stack prometheus-community/kube-prometheus-stack \
          --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
          --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
    ```

  </div>
</details>

Deploy the Spice.ai Helm chart with monitoring enabled:

```bash
helm upgrade --install spiceai spiceai/spiceai --set monitoring.podMonitoring.enabled=true
```

Once the monitoring is enabled, import the [Spice Grafana dashboard](../../clients/grafana/index.md) to visualize the Spice.ai metrics.

### Health and Readiness

Spice provides two HTTP endpoints for monitoring the runtime state: `/health` and `/v1/ready`. These endpoints are used for Kubernetes health and readiness probes in the Spice deployment.

#### Health Probe

The `/health` endpoint indicates whether the Spice process is up and running, ready to receive requests. A probe can be configured for custom deployment as follows:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8090
```

In Kubernetes, the pod will not be marked as healthy until the `/health` endpoint returns a `200` status.

#### Readiness Probe

The `/ready` endpoint indicates **whether the Spice components (datasets, models, etc) are ready**. While the `/health` endpoint might show that Spice is up and running, the `/ready` endpoint must return a `200` status to ensure that queries will return results.

```yaml
readinessProbe:
  httpGet:
    path: /v1/ready
    port: 8090
```

:::note
For more information on how Kubernetes uses probes to determine the health of a pod, see [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes)
:::

## Example values.yaml

```yaml
image:
  repository: spiceai/spiceai
  tag: 1.0.2
replicaCount: 1
additionalEnv:
  - name: SPICED_LOG
    value: "INFO"
  - name: SPICE_SECRET_SPICEAI_KEY
    valueFrom:
      secretKeyRef:
        name: spice-secrets
        key: spiceai-key
monitoring:
  podMonitor:
    enabled: true
spicepod:
  name: app
  version: v1
  kind: Spicepod

  datasets:
    - from: s3://spiceai-demo-datasets/taxi_trips/2024/
      name: taxi_trips
      description: Demo taxi trips in s3
      params:
        file_format: parquet
      acceleration:
        enabled: true
        # Uncomment to refresh the acceleration on a schedule
        # refresh_check_interval: 1h
        # refresh_mode: full
```

## Cookbook

- [Running Spice.ai in Kubernetes](hhttps://github.com/spiceai/cookbook/tree/trunk/kubernetes)
