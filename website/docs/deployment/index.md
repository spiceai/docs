---
title: 'Spice.ai Deployment Guide'
sidebar_label: 'Deployment'
description: 'Deploy Spice.ai in your environment using Docker, Kubernetes, AWS, Azure, or the Spice Cloud Platform. Learn about sidecar, microservice, tiered, and cluster deployment architectures.'
keywords:
  [
    spice.ai,
    deployment,
    docker,
    kubernetes,
    aws,
    azure,
    sidecar,
    microservice,
    cluster,
    helm,
    cloud platform
  ]
image: /img/og/spiceai.png
sidebar_position: 11
---

Spice runs as a single binary, a container, a Kubernetes workload, or a fully managed app on the Spice Cloud Platform. This guide helps choose a target environment and a deployment architecture to match an application's latency, scale, and operational requirements.

## Choose a deployment target

Most users fall into one of three groups:

- **Run Spice next to an application** — start with [Docker](deployment/docker) for a local container, or follow [Getting Started](getting-started) to run the binary directly.
- **Operate Spice in production on Kubernetes** — use the [Spice Helm chart](deployment/kubernetes/helm). For automated rollouts, see the [CI/CD guide](deployment/ci-cd) for Helm pipelines and GitOps with [Argo CD](deployment/kubernetes/argocd) or [Flux](deployment/kubernetes/flux).
- **Use a managed service** — deploy a Spicepod to the [Spice Cloud Platform](deployment/cloud) and connect a [GitHub repository](https://docs.spice.ai/docs/portal/apps/connect-github) for continuous delivery.

:::tip Self-hosted enterprise deployments
For production self-hosted clusters, the [Spice.ai Enterprise Kubernetes Operator](https://docs.spice.ai/docs/enterprise/kubernetes-operator/kubernetes) provides per-replica StatefulSets, automatic PVC resizing, configurable update strategies, crashloop protection, and distributed query execution through `SpicepodSet` and `SpicepodCluster` custom resources.
:::

## Deployment architectures

Architecture refers to where Spice runs in relation to the application and data sources, and how it scales. Pick an architecture before choosing a guide; the same target environment can host any of these patterns.

- [Overview](deployment/architectures) — when to choose each architecture.
- [Sidecar](deployment/architectures/sidecar) — Spice runs alongside the application for the lowest latency.
- [Microservice](deployment/architectures/microservice) — single or multiple replicas behind a load balancer.
- [Tiered](deployment/architectures/tiered) — separate read and write tiers for mixed workloads.
- [Cluster-Sidecar](deployment/architectures/cluster-sidecar) — combine local and remote Spice instances.
- [Hosted](deployment/architectures/hosted) — managed on the Spice Cloud Platform.
- [Sharded](deployment/architectures/sharded) — partition data across multiple Spice instances.
- [Cluster](deployment/architectures/cluster) — distributed query execution with Spice.ai Enterprise.

## Deployment guides

Step-by-step instructions for each target environment.

| Guide                                                     | When to use                                                                |
| --------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Kubernetes](deployment/kubernetes)                       | Self-hosted production deployments. Covers Helm, Argo CD, and Flux.        |
| [Docker](deployment/docker)                               | Local development, single-host deployments, and container-based pipelines. |
| [Spice Cloud](deployment/cloud)                           | Fully managed deployments without operating infrastructure.                |
| [AWS](deployment/aws)                                     | Deployments on AWS using the published CloudFormation template.            |
| [Azure](deployment/azure)                                 | Deployments on Azure using ARM/Bicep templates.                            |
| [GCP](deployment/gcp)                                     | Deployments on Google Cloud using GKE, Cloud Run, or Compute Engine.       |
| [CI/CD](deployment/ci-cd)                                 | Automating any of the above through pipelines or GitOps.                   |
| [Read/Write Separation](deployment/read-write-separation) | Production pattern that splits ingest from reads using shared snapshots.   |
