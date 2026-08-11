---
title: 'Kubernetes Deployment'
sidebar_label: 'Kubernetes'
sidebar_position: 5
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

## CPU sizing

Spice sizes its thread pools, query fan-out, and accelerator concurrency from a single CPU entitlement. In Kubernetes that entitlement comes from the pod's own resources, and the default needs no configuration.

| Pod resources                          | Entitlement                                            |
| -------------------------------------- | ------------------------------------------------------ |
| `requests.cpu`, no `limits.cpu`        | **Twice the request**, floored at 2 cores and capped by the node — a `requests.cpu: 4` pod sizes for 8 cores |
| `limits.cpu` set                       | The limit                                              |
| Neither                                | Every CPU the pod can see                              |

Sizing above the request is deliberate: a CPU request is a scheduling floor rather than a ceiling, so a burstable pod keeps headroom to burst above it — while not building 64 worker threads for a node it only has a slice of.

This requires the pod spec to pass its CPU request in, since the runtime cannot read `resources.requests.cpu` itself. **The Spice Helm chart and the Spice Kubernetes Operator both do this by default** whenever a CPU request is set, so deployments using either — including all three paths above — get it automatically. A hand-written pod spec needs the [downward-API block](../reference/spicepod/runtime#sizing-from-a-cpu-request) itself; without it the pod sizes for the whole node, and the runtime warns at startup.

### Bursting across the whole machine

To pack many mostly-idle instances onto a node while letting each burst wide, state that intent once:

```yaml
runtime:
  cpu:
    cores: all # every available core, regardless of the CPU request
               # (a CPU limit, if one is set, is still respected)
```

The [Spice Cloud Platform](https://spice.ai) sets `SPICE_CPU_CORES=all` on hosted instances for exactly this reason — maximum burst capacity, so an instance is never sized down to a fraction of the machine it is scheduled on.

Prefer `runtime.cpu.cores` over `resources.limits.cpu` for bounding Spice. A CPU limit is a CFS quota and [throttles](https://home.robusta.dev/blog/stop-using-cpu-limits) even when the node has idle CPU; `runtime.cpu.cores` caps how much machine the runtime organizes itself around without capping how much CPU it may use. See [`runtime.cpu`](../reference/spicepod/runtime#runtimecpu) and [Resource Allocation](../reference/performance-tuning#resource-allocation).

## Prerequisites

- Access to a Kubernetes cluster (v1.25+ recommended).
- `kubectl` configured for the target cluster. See the [Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/#kubectl).
- For local testing, [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) or [k3d](https://k3d.io/) provide a quick single-node cluster.

## Cookbook

- [Running Spice.ai in Kubernetes](https://github.com/spiceai/cookbook/tree/trunk/kubernetes)
