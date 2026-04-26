---
title: 'Kubernetes - Argo CD'
sidebar_label: 'Argo CD'
sidebar_position: 2
description: 'Deploy Spice.ai on self-hosted Kubernetes using Argo CD and the Spice Helm chart.'
tags:
  - deployment
  - kubernetes
  - argocd
  - gitops
  - spiceai
---

This guide describes how to deploy Spice.ai on a self-hosted Kubernetes cluster using [Argo CD](https://argo-cd.readthedocs.io/) and the official [Spice Helm chart](https://github.com/spiceai/spiceai/tree/trunk/deploy/chart). Argo CD continuously reconciles the cluster state with manifests stored in Git, providing a GitOps workflow for managing Spice.ai deployments.

## Quickstart

```bash
kubectl apply -n argocd -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: spiceai
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://helm.spiceai.org
    chart: spiceai
    targetRevision: '*'
    helm:
      releaseName: spiceai
  destination:
    server: https://kubernetes.default.svc
    namespace: spiceai
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF
```

:::info Deployment Architecture
By default, the Spice.ai Helm chart deploys Spice as a stateless Kubernetes Deployment. To persist data between restarts (for example, to use file-based acceleration), enable the `stateful` section in the Helm values. See the [Stateful Configuration](../helm#stateful-configuration) section in the Helm guide for details.
:::

:::tip[Spice.ai Enterprise]
For production stateful or distributed deployments managed via Argo CD, the [Spice.ai Enterprise](https://spice.ai) Operator's [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) (per-replica StatefulSets, automatic PVC resizing, advanced update strategies) and [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster) (scheduler/executor topology with mTLS) resources can be reconciled by Argo CD just like any other CRD-backed manifest.
:::

## What is Argo CD?

[Argo CD](https://argo-cd.readthedocs.io/) is a declarative, GitOps continuous delivery tool for Kubernetes. It watches Git repositories or Helm registries for changes and automatically applies them to the cluster, keeping the live state in sync with the desired state defined in Git.

This guide uses the Spice Helm chart as the source. For a direct Helm-based deployment without Argo CD, see [Kubernetes - Helm](../helm).

## Prerequisites

- Access to a self-hosted Kubernetes cluster.
- `kubectl` CLI installed and configured for the target cluster. See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/#kubectl).
- Argo CD installed in the cluster. See the [Argo CD Getting Started guide](https://argo-cd.readthedocs.io/en/stable/getting_started/) for installation instructions.
- Optional: the `argocd` CLI for command-line management. See [Install the Argo CD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/).

## Deploy Spice.ai with Argo CD

Argo CD reconciles a Kubernetes resource of kind `Application`, which describes the source (Helm chart, kustomization, or plain manifests), the destination cluster and namespace, and the sync policy.

### Option 1: Helm chart from the Spice Helm repository

Define an `Application` that references the Spice Helm chart directly. Inline overrides are provided through `helm.valuesObject`.

Save the following as `spiceai-application.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: spiceai
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://helm.spiceai.org
    chart: spiceai
    # Pin to a specific chart version for reproducible deployments
    targetRevision: 1.11.5
    helm:
      releaseName: spiceai
      valuesObject:
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
  destination:
    server: https://kubernetes.default.svc
    namespace: spiceai
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - ServerSideApply=true
```

Apply the manifest:

```bash
kubectl apply -f spiceai-application.yaml
```

Argo CD detects the new `Application`, fetches the chart, renders the templates, and applies the resulting resources to the destination namespace.

### Option 2: Helm chart with values from Git

For larger or more sensitive configurations, store the Helm values in a Git repository and reference them with [Argo CD multiple sources](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/). This keeps configuration version-controlled and reviewable through pull requests.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: spiceai
  namespace: argocd
spec:
  project: default
  sources:
    - repoURL: https://helm.spiceai.org
      chart: spiceai
      targetRevision: 1.11.5
      helm:
        releaseName: spiceai
        valueFiles:
          - $values/clusters/production/spiceai/values.yaml
    - repoURL: https://github.com/your-org/your-gitops-repo.git
      targetRevision: main
      ref: values
  destination:
    server: https://kubernetes.default.svc
    namespace: spiceai
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

The first source supplies the chart, and the second source (`ref: values`) provides the values file referenced by `$values`. Update the Spice configuration by committing changes to `clusters/production/spiceai/values.yaml`; Argo CD reconciles the change automatically.

A `values.yaml` example is available in [Example values.yaml](../helm#example-valuesyaml).

## Sync Policy

The `syncPolicy.automated` block enables continuous reconciliation:

- `prune: true` removes resources from the cluster when they are removed from Git.
- `selfHeal: true` reverts manual changes made directly to the cluster, restoring the state defined in Git.
- `syncOptions: [CreateNamespace=true]` instructs Argo CD to create the destination namespace if it does not exist.
- `syncOptions: [ServerSideApply=true]` is recommended for charts that produce large CRDs or resources that exceed the client-side apply annotation size limit.

To trigger a manual sync from the CLI:

```bash
argocd app sync spiceai
```

## Upgrade Spice.ai

Upgrade the running Spice.ai deployment by changing `spec.source.targetRevision` (or `spec.sources[].targetRevision`) to a newer chart version, then committing the change to Git or reapplying the `Application` manifest. Argo CD reconciles the new revision and performs a rolling upgrade.

```yaml
spec:
  source:
    targetRevision: 1.11.5
```

To pin to the latest chart version automatically, set `targetRevision: '*'`. Pinning to a specific version is recommended for production environments to ensure reproducible deployments.

The list of published chart versions is available at [helm.spiceai.org](https://helm.spiceai.org/index.yaml).

## Rollback

Roll back to a previous revision using the Argo CD CLI or UI:

```bash
argocd app history spiceai
argocd app rollback spiceai <history-id>
```

When the `Application` is managed by Git, prefer reverting the commit that introduced the change so the desired state in Git matches the live state. With `selfHeal: true` enabled, Argo CD will otherwise re-apply the Git state.

## Uninstall

Delete the `Application` to remove the Spice.ai deployment. With `prune: true`, all resources created by the chart are removed:

```bash
kubectl delete application spiceai -n argocd
```

PersistentVolumeClaims created by a StatefulSet are retained by default and must be deleted manually if no longer needed:

```bash
kubectl delete pvc -n spiceai -l app.kubernetes.io/name=spiceai
```

## Secrets Management

Do not commit plain-text secrets to Git. Reference Kubernetes `Secret` resources from `additionalEnv` and manage the secrets themselves with one of:

- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) — encrypted secrets safe to store in Git.
- [External Secrets Operator](https://external-secrets.io/) — sync secrets from AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, and similar.
- [SOPS](https://github.com/getsops/sops) with the [Argo CD Vault Plugin](https://argocd-vault-plugin.readthedocs.io/).

Example referencing a pre-existing `Secret` named `spice-secrets`:

```yaml
spec:
  source:
    helm:
      valuesObject:
        additionalEnv:
          - name: SPICE_SECRET_SPICEAI_KEY
            valueFrom:
              secretKeyRef:
                name: spice-secrets
                key: spiceai-key
```

See [Environment Variables and Secrets](../helm#environment-variables-and-secrets) in the Helm guide for additional configuration patterns.

## Monitoring

The Spice Helm chart integrates with the [Prometheus Operator](https://prometheus-operator.dev/) through a `PodMonitor` resource. Enable it with:

```yaml
spec:
  source:
    helm:
      valuesObject:
        monitoring:
          podMonitor:
            enabled: true
            additionalLabels:
              release: prometheus-stack
```

Once metrics are collected, import the [Spice Grafana dashboard](../../../monitoring/grafana) for visualization.

## Manage Multiple Spice.ai Releases

To deploy multiple Spice.ai instances (for example, one per environment or tenant), create one `Application` per release with distinct names, namespaces, and values. The [App of Apps](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/) pattern or [ApplicationSets](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/) can manage these declaratively at scale.

Example `ApplicationSet` that deploys Spice.ai to multiple namespaces:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: spiceai
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - name: spiceai-dev
            namespace: spiceai-dev
            chartVersion: 1.11.5
          - name: spiceai-prod
            namespace: spiceai-prod
            chartVersion: 1.11.5
  template:
    metadata:
      name: '{{name}}'
    spec:
      project: default
      source:
        repoURL: https://helm.spiceai.org
        chart: spiceai
        targetRevision: '{{chartVersion}}'
        helm:
          releaseName: '{{name}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{namespace}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
```

## Further Reading

- [Kubernetes - Helm deployment guide](../helm) — full reference for the Spice Helm chart, including all configurable parameters.
- [Argo CD Helm chart documentation](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/)
- [Argo CD ApplicationSet controller](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/)
- [Spice Helm chart source](https://github.com/spiceai/spiceai/tree/trunk/deploy/chart)

## Cookbook

- [Running Spice.ai in Kubernetes](https://github.com/spiceai/cookbook/tree/trunk/kubernetes)
