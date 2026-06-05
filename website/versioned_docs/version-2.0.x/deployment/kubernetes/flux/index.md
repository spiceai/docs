---
title: 'Kubernetes - Flux'
sidebar_label: 'Flux'
sidebar_position: 3
description: 'Deploy Spice.ai on Kubernetes using Flux CD and the Spice Helm chart.'
tags:
  - deployment
  - kubernetes
  - flux
  - fluxcd
  - gitops
  - spiceai
---

This guide describes how to deploy Spice.ai on Kubernetes using [Flux CD](https://fluxcd.io/) and the official [Spice Helm chart](https://github.com/spiceai/helm-charts). Flux is a GitOps toolkit that continuously reconciles cluster state with manifests in a Git repository or a Helm chart repository, using native Kubernetes custom resources.

## Quickstart

Register the Spice Helm repository and create a `HelmRelease` in a single manifest:

```bash
kubectl apply -n flux-system -f - <<EOF
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: spiceai
  namespace: flux-system
spec:
  interval: 1h
  url: https://helm.spiceai.org
---
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: spiceai
  namespace: flux-system
spec:
  interval: 10m
  releaseName: spiceai
  targetNamespace: spiceai
  install:
    createNamespace: true
  chart:
    spec:
      chart: spiceai
      version: '*'
      sourceRef:
        kind: HelmRepository
        name: spiceai
        namespace: flux-system
EOF
```

:::info Deployment Architecture
By default, the Spice.ai Helm chart deploys Spice as a stateless Kubernetes Deployment. To persist data between restarts (for example, to use file-based acceleration), enable the `stateful` section in the Helm values. See the [Stateful Configuration](../helm/index.md#stateful-configuration) section in the Helm guide for details.
:::

:::tip[Spice.ai Enterprise]
For production stateful or distributed deployments managed via Flux, the [Spice.ai Enterprise](https://spice.ai) Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) (per-replica StatefulSets, automatic PVC resizing, advanced update strategies) and [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster) (scheduler/executor topology with mTLS) resources can be reconciled through a `Kustomization` alongside the operator `HelmRelease`.
:::

## What is Flux?

[Flux](https://fluxcd.io/) is a CNCF-graduated GitOps toolkit for Kubernetes. It is composed of focused controllers — `source-controller`, `helm-controller`, `kustomize-controller`, `notification-controller`, and `image-automation-controller` — each reconciling a Kubernetes custom resource. For Helm-based deployments, the `HelmRepository` source and the `HelmRelease` resource together replace `helm install`/`helm upgrade` invocations with a continuously reconciled, Git-managed equivalent.

For a non-GitOps Helm deployment, see [Kubernetes - Helm](../helm/index.md). For an Argo CD-based GitOps workflow, see [Kubernetes - Argo CD](../argocd/index.md).

## Prerequisites

- Access to a Kubernetes cluster.
- `kubectl` configured for the target cluster. See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/#kubectl).
- Flux installed in the cluster. See the [Flux installation guide](https://fluxcd.io/flux/installation/) and the [`flux bootstrap`](https://fluxcd.io/flux/installation/bootstrap/) command for Git-managed installations.
- The `flux` CLI for command-line management. See [Install the Flux CLI](https://fluxcd.io/flux/installation/#install-the-flux-cli).

## Deploy Spice.ai with Flux

Flux reconciles two resource kinds for Helm chart deployments:

- `HelmRepository` (`source.toolkit.fluxcd.io/v1`) — points to a Helm chart repository and periodically refreshes the index.
- `HelmRelease` (`helm.toolkit.fluxcd.io/v2`) — describes the desired release, including chart version, target namespace, and values.

### Option 1: HelmRelease with inline values

Define the source and release together. Inline values are provided through `spec.values`.

Save the following as `spiceai.yaml`:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: HelmRepository
metadata:
  name: spiceai
  namespace: flux-system
spec:
  interval: 1h
  url: https://helm.spiceai.org
---
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: spiceai
  namespace: flux-system
spec:
  interval: 10m
  releaseName: spiceai
  targetNamespace: spiceai
  install:
    createNamespace: true
    remediation:
      retries: 3
  upgrade:
    remediation:
      retries: 3
  chart:
    spec:
      chart: spiceai
      # Pin to a specific chart version for reproducible deployments
      version: 1.11.5
      sourceRef:
        kind: HelmRepository
        name: spiceai
        namespace: flux-system
      interval: 1h
  values:
    replicaCount: 1
    image:
      repository: spiceai/spiceai
      tag: latest-models
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

Apply the manifest. With `flux bootstrap`, commit it to the Git repository Flux watches; otherwise apply directly:

```bash
kubectl apply -f spiceai.yaml
```

Flux fetches the chart, renders the templates, and applies the resulting resources to the `spiceai` namespace.

### Option 2: HelmRelease with values from ConfigMap or Secret

For larger or more sensitive configurations, store values in a `ConfigMap` or `Secret` and reference them with `valuesFrom`. This keeps the `HelmRelease` itself small and lets multiple resources share configuration.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: spiceai-values
  namespace: flux-system
data:
  values.yaml: |
    replicaCount: 1
    spicepod:
      name: app
      version: v1
      kind: Spicepod
      datasets:
        - from: s3://spiceai-demo-datasets/taxi_trips/2024/
          name: taxi_trips
          params:
            file_format: parquet
---
apiVersion: helm.toolkit.fluxcd.io/v2
kind: HelmRelease
metadata:
  name: spiceai
  namespace: flux-system
spec:
  interval: 10m
  releaseName: spiceai
  targetNamespace: spiceai
  install:
    createNamespace: true
  chart:
    spec:
      chart: spiceai
      version: 1.11.5
      sourceRef:
        kind: HelmRepository
        name: spiceai
        namespace: flux-system
  valuesFrom:
    - kind: ConfigMap
      name: spiceai-values
      valuesKey: values.yaml
```

Multiple `valuesFrom` entries are merged in order, with later entries overriding earlier ones. Combine `ConfigMap` (non-sensitive defaults) with `Secret` (credentials) for layered configuration.

A full `values.yaml` example is available in [Example values.yaml](../helm/index.md#example-valuesyaml).

## Reconciliation Intervals

Two intervals control how often Flux checks for changes:

- `HelmRepository.spec.interval` — how often the chart index is refreshed from `helm.spiceai.org`.
- `HelmRelease.spec.interval` — how often the release is reconciled against its desired state.

For production, an interval of `1h` for the repository and `10m` for the release is a reasonable default. Decrease for faster propagation; increase to reduce API load.

To trigger an immediate reconciliation from the CLI:

```bash
flux reconcile helmrelease spiceai -n flux-system --with-source
```

## Upgrade Spice.ai

Upgrade by changing `spec.chart.spec.version` to a newer chart version, then committing the change to Git or reapplying the manifest. Flux performs a rolling Helm upgrade.

```yaml
spec:
  chart:
    spec:
      version: 1.11.5
```

To track the latest chart version automatically, set `version: '*'` or a semver range such as `1.x`. Pinning to a specific version is recommended for production.

The list of published chart versions is available at [helm.spiceai.org](https://helm.spiceai.org/index.yaml).

## Rollback

Flux records each Helm release revision. List history and roll back with the Helm CLI directly, or by reverting the Git commit that introduced the change (preferred for GitOps consistency):

```bash
helm history spiceai -n spiceai
helm rollback spiceai <revision> -n spiceai
```

For automatic rollback on failed upgrades, configure `spec.upgrade.remediation` on the `HelmRelease`:

```yaml
spec:
  upgrade:
    remediation:
      retries: 3
      strategy: rollback
```

## Suspend and Resume

Suspend reconciliation to make manual changes without Flux reverting them:

```bash
flux suspend helmrelease spiceai -n flux-system
# ... manual changes ...
flux resume helmrelease spiceai -n flux-system
```

## Uninstall

Delete the `HelmRelease` to remove the Spice.ai deployment. Flux runs `helm uninstall`, which removes all chart-managed resources:

```bash
kubectl delete helmrelease spiceai -n flux-system
```

PersistentVolumeClaims created by a StatefulSet are retained by default and must be deleted manually if no longer needed:

```bash
kubectl delete pvc -n spiceai -l app.kubernetes.io/name=spiceai
```

## Secrets Management

Do not commit plain-text secrets to Git. Reference Kubernetes `Secret` resources from `additionalEnv` and manage the secrets themselves with one of:

- [SOPS](https://github.com/getsops/sops) — Flux has built-in support via `kustomize-controller`. See [Manage Kubernetes secrets with SOPS](https://fluxcd.io/flux/guides/mozilla-sops/).
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) — encrypted secrets safe to store in Git.
- [External Secrets Operator](https://external-secrets.io/) — sync secrets from AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, and similar.

Example referencing a pre-existing `Secret` named `spice-secrets`:

```yaml
spec:
  values:
    additionalEnv:
      - name: SPICE_SECRET_SPICEAI_KEY
        valueFrom:
          secretKeyRef:
            name: spice-secrets
            key: spiceai-key
```

See [Environment Variables and Secrets](../helm/index.md#environment-variables-and-secrets) in the Helm guide for additional configuration patterns.

## Monitoring

The Spice Helm chart integrates with the [Prometheus Operator](https://prometheus-operator.dev/) through a `PodMonitor` resource. Enable it in the `HelmRelease` values:

```yaml
spec:
  values:
    monitoring:
      podMonitor:
        enabled: true
        additionalLabels:
          release: prometheus-stack
```

Once metrics are collected, import the [Spice Grafana dashboard](../../monitoring/grafana) for visualization.

## Manage Multiple Spice.ai Releases

To deploy multiple Spice.ai instances (for example, one per environment or tenant), create one `HelmRelease` per release with distinct names, target namespaces, and values. Group related releases under a single `Kustomization` so Flux applies them together.

Example directory layout in a Flux-managed repository:

```
clusters/
└── production/
    ├── flux-system/
    │   └── ...
    └── spiceai/
        ├── kustomization.yaml
        ├── helmrepository.yaml
        ├── spiceai-app.yaml
        └── spiceai-analytics.yaml
```

`clusters/production/spiceai/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - helmrepository.yaml
  - spiceai-app.yaml
  - spiceai-analytics.yaml
```

Each `HelmRelease` in this directory references the shared `HelmRepository` source.

## Further Reading

- [Kubernetes - Helm deployment guide](../helm/index.md) — full reference for the Spice Helm chart, including all configurable parameters.
- [Flux Helm Controller documentation](https://fluxcd.io/flux/components/helm/)
- [Flux `HelmRelease` API reference](https://fluxcd.io/flux/components/helm/helmreleases/)
- [Flux `HelmRepository` API reference](https://fluxcd.io/flux/components/source/helmrepositories/)
- [Flux GitOps guides](https://fluxcd.io/flux/guides/)
- [Spice Helm chart source](https://github.com/spiceai/helm-charts)

## Cookbook

- [Running Spice.ai in Kubernetes](https://github.com/spiceai/cookbook/tree/trunk/kubernetes)
