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

:::info Deployment Architecture
The Spice.ai Helm chart deploys the application as a stateless Kubernetes Deployment by default. This configuration does not persist data between pod restarts. For workloads requiring data persistence, such as file-based acceleration, the chart supports deploying Spice.ai as a StatefulSet with persistent volume claims by enabling and configuring the `stateful` section in the values file.
:::

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
| `additionalLabels`                   | Additional labels to add to all resources.                                                                                                                                                     | `{}`       |
| `image.repository`                   | The repository of the Docker image.                                                                                                                                                            | `spiceai`  |
| `image.tag`                          | Replace with a specific version of Spice.ai to run.                                                                                                                                            | `1.0.5`    |
| `replicaCount`                       | Number of Spice.ai replicas to run.                                                                                                                                                            | `1`        |
| `service.type`                       | Kubernetes service type. Can be null, ClusterIP, NodePort, or LoadBalancer.                                                                                                                    | `null`     |
| `monitoring.podMonitor.enabled`      | Enable Prometheus metrics collection for the Spice pods. Requires the [Prometheus Operator](https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.PodMonitor) CRDs.     | `false`    |
| `image.pullSecrets`                  | Specify Docker registry secret names as an array.                                                                                                                                              | `[]`       |
| `tolerations`                        | List of node taints to tolerate.                                                                                                                                                               | `[]`       |
| `resources`                          | Resource requests and limits for the Spice.ai container. See [Container resource examples](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#example-1).        | `{}`       |
| `additionalEnv`                      | Additional environment variables to set in the Spice.ai container.                                                                                                                             | `[]`       |
| `stateful.enabled`                   | Use a StatefulSet with a PVC for the data volume.                                                                                                                                              | `false`    |
| `stateful.storageClass`              | Storage class for the volume claim template in the StatefulSet.                                                                                                                                | `standard` |
| `stateful.size`                      | Size of each PV in the StatefulSet.                                                                                                                                                            | `1Gi`      |
| `stateful.mountPath`                 | Mount path in container for the persistent volume.                                                                                                                                             | `/data`    |
| `serviceAccount.create`              | Specifies whether a ServiceAccount should be created.                                                                                                                                          | `false`    |

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

Further reading:

- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Good practices for Kubernetes Secrets](https://kubernetes.io/docs/concepts/security/secrets-good-practices/)

## Monitoring

The Spice Helm chart includes compatibility with the [Prometheus Operator](https://prometheus-operator.dev/) for collecting Prometheus metrics that can be visualized in the [Spice Grafana dashboard](../../clients/grafana/index.md). To enable this feature, set the `monitoring.podMonitor.enabled` value to `true`. This will create a `PodMonitor` resource for the Spice.ai pods that will configure Prometheus to scrape metrics from the Spice.ai pods.

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
helm upgrade --install spiceai spiceai/spiceai --set monitoring.podMonitor.enabled=true
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

## Service Configuration

Configure the Kubernetes service for Spice.ai:

```yaml
service:
  # type can be null, ClusterIP, NodePort, or LoadBalancer
  type: LoadBalancer
  additionalAnnotations: {}
  # If service type is LoadBalancer, specify the source IP ranges to whitelist
  loadBalancerSourceRanges:
    - 10.0.0.0/8
    - 172.16.0.0/12
  # The selector to use for the service
  selector:
    custom-selector: value
```

## Service Account

Configure a Kubernetes ServiceAccount for Spice.ai:

```yaml
serviceAccount:
  # Specifies whether a ServiceAccount should be created
  create: true
  # The name of the ServiceAccount to use.
  # If not set and create is true, a name is generated using the fullname template
  name: spice-service-account
```

## Volumes and Volume Mounts

Define custom volumes and volume mounts for the Spice.ai container:

```yaml
# Define volumes to be mounted to the container
volumes:
  - name: custom-data
    persistentVolumeClaim:
      claimName: my-custom-pvc
  - name: config-volume
    configMap:
      name: custom-config

# Define volume mounts for the container
volumeMounts:
  - name: custom-data
    mountPath: /data
  - name: config-volume
    mountPath: /config
```

## Stateful Configuration

The Spice.ai Helm chart provides two deployment architectures to accommodate different persistence requirements. The default architecture deploys Spice.ai as a stateless Kubernetes Deployment, suitable for workloads that do not require data persistence between pod restarts.

For workloads requiring data persistence, the chart supports deploying Spice.ai as a StatefulSet with persistent storage. This architecture becomes essential when implementing file-based acceleration for datasets or when maintaining state between pod restarts is critical.

Enabling the StatefulSet architecture requires configuration of the `stateful` section:

```yaml
# Use a StatefulSet with a PVC for the data volume
stateful:
  enabled: true
  # Storage class for the volume claim template
  storageClass: "standard"
  # Size of each PV in the StatefulSet
  size: 1Gi
  # Mount path in container
  mountPath: /data
```

When `stateful.enabled` is set to `true`, the Helm chart creates a StatefulSet instead of a Deployment and provisions a PersistentVolumeClaim for each replica. The persistent volume is mounted at the specified path, allowing data to persist across pod restarts and rescheduling events.

## Example values.yaml

```yaml
additionalLabels:
  environment: production
  app: spice

image:
  repository: spiceai/spiceai
  tag: 1.0.5
replicaCount: 1

service:
  type: ClusterIP
  additionalAnnotations:
    service.beta.kubernetes.io/aws-load-balancer-internal: "true"

resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi

additionalEnv:
  - name: SPICED_LOG
    value: "INFO"
  - name: SPICE_SECRET_SPICEAI_KEY
    valueFrom:
      secretKeyRef:
        name: spice-secrets
        key: spiceai-key

stateful:
  enabled: true
  storageClass: "standard"
  size: 5Gi
  mountPath: /data

monitoring:
  podMonitor:
    enabled: true
    additionalLabels:
      release: prometheus

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
        engine: duckdb
        mode: file
        params:
          duckdb_file: /data/taxi_trips.db
        # Uncomment to refresh the acceleration on a schedule
        # refresh_check_interval: 1h
        # refresh_mode: full
```

## Cookbook

- [Running Spice.ai in Kubernetes](https://github.com/spiceai/cookbook/tree/trunk/kubernetes)
