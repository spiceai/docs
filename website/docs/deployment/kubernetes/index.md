---
title: 'Kubernetes Deployment'
sidebar_label: 'Kubernetes'
sidebar_position: 4
description: 'Deploy Spice.ai on Kubernetes using Helm, Argo CD, or Flux.'
tags:
  - deployment
  - kubernetes
  - spiceai
---

Spice.ai runs on any Kubernetes cluster — managed (EKS, GKE, AKS) or self-hosted (kubeadm, k3s, Kind, RKE2). The official [Spice Helm chart](https://github.com/spiceai/helm-charts) is the foundation for all three deployment paths covered here.

Choose the workflow that matches the operating model:

| Path                         | When to use                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Helm](kubernetes/helm)      | Direct, imperative deploys with `helm install` / `helm upgrade`. Simplest path for getting started or CI-driven pipelines that already invoke Helm. |
| [Argo CD](kubernetes/argocd) | GitOps with continuous reconciliation. Define the desired state in Git; Argo CD applies and self-heals.                                             |
| [Flux](kubernetes/flux)      | GitOps with native Kubernetes-style controllers (`HelmRelease`, `HelmRepository`, `Kustomization`). Lightweight alternative to Argo CD.             |

All three options consume the same chart and `values.yaml`, so configuration learned in one path transfers directly to the others.

:::tip[Spice.ai Enterprise Operator]
For production lifecycle management beyond what the Helm chart provides, the [Spice.ai Enterprise](https://spice.ai) Kubernetes Operator introduces two custom resources:

- [`SpicepodSet`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodset) — declarative replica management with automatic PVC resizing, rolling/parallel update strategies, crashloop protection, and per-replica `StatefulSet`s when persistent volumes are configured. Use it instead of the chart's `stateful` mode for stateful workloads.
- [`SpicepodCluster`](https://docs.spice.ai/docs/enterprise/kubernetes-operator/spicepodcluster) — distributed query clusters with dedicated scheduler and executor nodes, automatic mTLS, and shared object-store-backed state. Use it for horizontally scaled query execution and high availability.

The operator works alongside Helm, Argo CD, and Flux — install the operator chart and manage `SpicepodSet` / `SpicepodCluster` resources from the same GitOps pipeline.
:::

## Prerequisites

- Access to a Kubernetes cluster (v1.25+ recommended).
- `kubectl` configured for the target cluster. See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/#kubectl).
- For local testing, [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) or [k3d](https://k3d.io/) provide a quick single-node cluster.

## Cookbook

- [Running Spice.ai in Kubernetes](https://github.com/spiceai/cookbook/tree/trunk/kubernetes)
