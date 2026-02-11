---
title: 'Cluster-Based Deployment (Spice.ai Enterprise)'
sidebar_label: 'Cluster'
description: 'Deploying Spice as a cluster'
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

A Kubernetes-native, large-scale deployment leveraging **Spice.ai Enterprise**, which includes advanced services and integrations purpose-built for Kubernetes. This method is ideal for organizations requiring large-scale or complex deployments, including specialized clustering capabilities.

<img width="740" alt="cluster" src="https://github.com/user-attachments/assets/643e0a5c-6745-40c0-8695-0955c795179b" />

**Benefits**

- **Kubernetes-native** — designed to run on Kubernetes with native orchestration, scaling, and lifecycle management.
- Provides **enterprise-grade features**: advanced security, monitoring, and support.
- Simplifies **managing multiple nodes** for high availability and large workloads.
- Offers **direct integration** with Spice Cloud or on-prem Kubernetes clusters.

**Considerations**

- **Requires a commercial license** or subscription to Spice Enterprise.
- More **complex initial setup**, typically involving specialized DevOps expertise.

**Use This Approach When**

- You operate at **significant scale** or have stringent availability requirements.
- You need **enterprise-level support** and advanced monitoring, security, or compliance features.
- Your team can manage a **robust Kubernetes environment** or you plan to integrate with the Spice Cloud at scale.

**Not Ideal When**

- The deployment is small-scale or single-application — the overhead of a full cluster is unnecessary. Consider [Sidecar](./sidecar) or [Microservice](./microservice).
- Budget or licensing constraints exist — Spice Enterprise requires a commercial license. Consider open-source [Microservice](./microservice) or [Hybrid](./hybrid) deployments.
- The team lacks Kubernetes expertise — cluster deployments require robust Kubernetes management. Consider [Hosted](./hosted) for a managed alternative.

**Example Use Case**
A large financial services firm requiring a highly available, secure environment. They run Spice.ai across multiple clusters using Spice Enterprise for advanced monitoring, role-based access control, and dedicated support.
