---
title: 'Kubernetes - Helm'
sidebar_label: 'Helm'
sidebar_position: 1
description: 'Deploy Spice.ai in Kubernetes using Helm.'
tags:
  - deployment
  - kubernetes
  - helm
  - spiceai
---

## Quickstart

```bash
helm repo add spiceai https://helm.spiceai.org
helm repo update
helm upgrade --install spiceai spiceai/spiceai
```

:::info Deployment Architecture
By default, the Spice.ai Helm chart deploys the application as a stateless Kubernetes Deployment. To persist data between restarts (e.g., for file-based acceleration), enable and configure the `stateful` section in the values file. Refer to the [Stateful Configuration](#stateful-configuration) section for details.
:::

## What are Kubernetes and Helm?

**Kubernetes** is an open-source platform for automating deployment, scaling, and management of containerized applications.  
**Helm** is a package manager for Kubernetes that simplifies the installation and configuration of applications using reusable templates called charts.

Spice publishes a Helm chart that simplifies the deployment of Spice.ai OSS on Kubernetes.

## Deploy Spice using Helm in Kubernetes

### Prerequisites

- Access to a Kubernetes cluster.
  - For local testing, try running a local Kubernetes cluster using [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/).
- `kubectl` CLI installed and configured to interact with the target Kubernetes cluster. Visit the [Kubernetes docs](https://kubernetes.io/docs/tasks/tools/#kubectl) for installation instructions.
- Helm CLI installed. Visit the [Helm docs](https://helm.sh/docs/intro/install/) for installation instructions.

### Add the Spice Helm repository

A Helm repository (Helm repo) is a storage location where Helm charts are hosted and can be accessed for deployment in Kubernetes clusters. Add the Spice Helm repository to your local Helm client and update the index to get the latest charts:

```bash
helm repo add {repository-name} https://helm.spiceai.org
helm repo update
```

The repository name is customizable and can be set to any preferred value. For example:

```bash
helm repo add spiceai https://helm.spiceai.org
# or
helm repo add my-spiceai-repo https://helm.spiceai.org
```

### Install the Spice Helm chart as a new release

Once the repository with the chart is added, install the chart into the Kubernetes cluster with the following command:

```bash
helm install {release-name} {repository-name}/spiceai --namespace {namespace}
```

For example:

```bash
helm install spiceai spiceai/spiceai --namespace default
```

Spice can be installed multiple times in the same cluster by specifying a different release name for each installation.

#### Command Breakdown

- `helm install`: Installs a new Helm chart. To upgrade an existing release, use `helm upgrade`. Combine both upgrade and install by specifying `helm upgrade --install`.
- `spiceai`: The name of the release. This name is customizable and can be set to any preferred value, e.g., `spiceai-my-app-v1` and `spiceai-my-app-v2` are valid release names. Each Helm release is a distinct installation of the same chart.
- `spiceai/spiceai`: The chart to install. The first `spiceai` is the repository name added earlier, and the second `spiceai` is the name of the chart to install. While the repository name is customizable, the chart name is not.
- `--namespace default`: The Kubernetes namespace to install the chart into. This is optional and defaults to `default`.

Another valid command to install the chart is (assuming the repository name is `my-spiceai-repo`):

```bash
helm upgrade --install spiceai-my-app-1 my-spiceai-repo/spiceai
```

### Upgrade the Spice Helm chart

To upgrade an existing release, use the `helm upgrade` command:

```bash
helm upgrade {release-name} {repository-name}/{chart-name}
```

For example:

```bash
helm upgrade spiceai-my-app-1 my-spiceai-repo/spiceai
```

### Rollback a Helm release

On occasion, you may need to roll back a Spice Helm release to a previous version. To do so, use the `helm rollback` command. This will notify Kubernetes to redeploy Spice back to a previous version of the Helm release:

```bash
helm rollback {release-name} --namespace {namespace}
```

For example:

```bash
helm rollback spiceai-my-app-1 --namespace default
```

### Uninstall a Helm release

To uninstall a Helm release, use the `helm uninstall` command. This will cause Kubernetes to remove the Spice deployment entirely. Note that any data stored in volumes created by configuring the `stateful` parameter will be preserved and must be manually deleted if desired:

```bash
helm uninstall {release-name} --namespace {namespace}
```

For example:

```bash
helm uninstall spiceai-my-app-1 --namespace default
```

## Customize the Helm release

By default, the Helm release installs a minimal Spice.ai setup with an empty Spicepod. To add a Spicepod and adjust other settings, customize the release as needed by creating a `values.yaml` file or by using the `--set` flag.

:::note
`values.yaml` is the configuration file used in Helm to define the user-configurable parameters of a Helm chart. The `--set` flag is used to specify individual values on the command line. Visit the [Helm docs](https://helm.sh/docs/chart_template_guide/values_files/#helm) for more information.
:::

Create a `values.yaml` file and override the default values as needed.
The full list of configurable parameters and their defaults are specified in the [values.yaml file](https://github.com/spiceai/spiceai/blob/trunk/deploy/chart/values.yaml) in the `spiceai/spiceai` repository.
The [Common Parameters](#common-parameters) section below lists the most commonly used configurable parameters and their descriptions.

### Spicepod

To customize the Spicepod that the Spice.ai runtime will load, define a [Spicepod](https://spiceai.org/docs/getting-started/spicepods) in a new `values.yaml` file.

```yaml
spicepod:
  name: app
  version: v1
  kind: Spicepod

  datasets:
    - from: s3://spiceai-demo-datasets/taxi_trips/2024/
      name: taxi_trips
      params:
        file_format: parquet
```

Upgrade or install a new release with the custom Spicepod:

```bash
helm upgrade --install spiceai spiceai/spiceai -f values.yaml
```

:::note
The Helm convention is to use a file called `values.yaml`, but any file name can be used and passed to the `-f` flag.
:::

## Common Parameters

| **Name**                        | **Description**                                                                                                                                                                           | **Value**         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `additionalEnv`                 | Additional environment variables to set in the Spice.ai container.                                                                                                                        | `[]`              |
| `additionalLabels`              | Additional labels to add to all resources.                                                                                                                                                | `{}`              |
| `image.pullSecrets`             | Specify Docker registry secret names as an array.                                                                                                                                         | `[]`              |
| `image.repository`              | The repository of the Docker image.                                                                                                                                                       | `spiceai/spiceai` |
| `image.tag`                     | Replace with a specific version of Spice.ai to run.                                                                                                                                       | `latest-models`   |
| `monitoring.podMonitor.enabled` | Enable Prometheus metrics collection for the Spice pods. Requires the [Prometheus Operator](https://prometheus-operator.dev/docs/operator/api/#monitoring.coreos.com/v1.PodMonitor) CRDs. | `false`           |
| `replicaCount`                  | Number of Spice.ai replicas to run.                                                                                                                                                       | `1`               |
| `resources`                     | Resource requests and limits for the Spice.ai container. See [Container resource examples](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#example-1).     | `{}`              |
| `service.type`                  | Kubernetes service type. Can be null, ClusterIP, NodePort, or LoadBalancer.                                                                                                               | `null`            |
| `serviceAccount.create`         | Specifies whether a ServiceAccount should be created.                                                                                                                                     | `false`           |
| `spicepod`                      | Define the [Spicepod](https://spiceai.org/docs/getting-started/spicepods) to be loaded by the Spice.ai runtime.                                                                           | `{}`              |
| `stateful.enabled`              | Use a StatefulSet with a PVC (Persistent Volume Claim) for the data volume.                                                                                                               | `false`           |
| `stateful.mountPath`            | Mount path in container for the persistent volume.                                                                                                                                        | `/data`           |
| `stateful.size`                 | Size of each PV in the StatefulSet.                                                                                                                                                       | `1Gi`             |
| `stateful.storageClass`         | Storage class for the volume claim template in the StatefulSet.                                                                                                                           | `standard`        |
| `tolerations`                   | List of node taints to tolerate.                                                                                                                                                          | `[]`              |

## Environment Variables and Secrets

Add extra environment variables using the `additionalEnv` property. This can be useful when combining with the [Environment Secret Store](../../../components/secret-stores/env).

```yaml
additionalEnv:
  - name: SPICED_LOG
    value: 'DEBUG'
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

The Spice Helm chart includes compatibility with the [Prometheus Operator](https://prometheus-operator.dev/) for collecting Prometheus metrics that can be visualized in the [Spice Grafana dashboard](../../../monitoring/grafana). To enable this feature, set the `monitoring.podMonitor.enabled` value to `true`. This will create a `PodMonitor` resource for the Spice.ai pods that will configure Prometheus to scrape metrics from the Spice.ai pods.

<details>
  <summary>Install the Prometheus Operator</summary>
  <div>
    The easiest way to install the Prometheus Operator along with Grafana is to use the [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/blob/main/charts/kube-prometheus-stack/README) Helm chart.

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

Once the monitoring is enabled, import the [Spice Grafana dashboard](../../../monitoring/grafana) to visualize the Spice.ai metrics.

### Health and Readiness

Spice provides two HTTP endpoints for monitoring the runtime state: `/health` and `/v1/ready`. These endpoints are used for Kubernetes health and readiness probes in the Spice deployment. The Spice Helm chart automatically configures these probes.

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

:::tip[Spice.ai Enterprise]
For production stateful workloads, the [Spice.ai Enterprise](https://spice.ai) Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) resource offers per-replica StatefulSets with automatic PVC resizing, configurable update strategies, and crashloop protection. For distributed query execution with separate scheduler and executor tiers, see [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster).
:::

Enabling the StatefulSet architecture requires configuration of the `stateful` section:

```yaml
# Use a StatefulSet with a PVC for the data volume
stateful:
  enabled: true
  # Storage class for the volume claim template
  storageClass: 'standard'
  # Size of each PV in the StatefulSet
  size: 1Gi
  # Mount path in container
  mountPath: /data
```

When `stateful.enabled` is set to `true`, the Helm chart creates a StatefulSet instead of a Deployment and provisions a PersistentVolumeClaim for each replica. The persistent volume is mounted at the specified path, so data persists across pod restarts and rescheduling events.

## Example values.yaml

```yaml
additionalLabels:
  environment: production
  app: spice

image:
  repository: spiceai/spiceai
  tag: latest-models
replicaCount: 1

service:
  type: ClusterIP
  additionalAnnotations:
    service.beta.kubernetes.io/aws-load-balancer-internal: 'true'

resources:
  limits:
    # cpu: 1000m  # Do not set CPU limits - can cause throttling
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi

additionalEnv:
  - name: SPICED_LOG
    value: 'INFO'
  - name: SPICE_SECRET_SPICEAI_KEY
    valueFrom:
      secretKeyRef:
        name: spice-secrets
        key: spiceai-key

stateful:
  enabled: true
  storageClass: 'standard'
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
