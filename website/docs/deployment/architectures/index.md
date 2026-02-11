---
title: 'Deployment Architectures'
sidebar_label: 'Architectures'
description: 'Explore Spice deployment architectures including sidecar, microservice, tiered, sharded, and cluster configurations.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

<img width="740" alt="Spice.ai OSS as a data and AI compute engine over disaggregated storage" src="https://github.com/user-attachments/assets/da3c0e90-4c48-48ca-b4bd-72eda816cfec" />

```mermaid
flowchart TB
    subgraph Sidecar["Sidecar — lowest latency"]
        direction LR
        A1["App"] <-->|"loopback"| S1["Spice"]
    end

    subgraph Microservice["Microservice — shared, scalable"]
        direction LR
        A2["App A"] & A3["App B"] -->|"network"| LB["Load Balancer"]
        LB --> S2["Spice Replica 1"]
        LB --> S3["Spice Replica 2"]
    end

    subgraph Tiered["Tiered — hybrid"]
        direction LR
        A4["App (real-time)"] <-->|"loopback"| S4["Spice Sidecar"]
        A5["App (batch)"] -->|"network"| S5["Spice Microservice"]
    end

    subgraph Hybrid["Hybrid — sidecar cache + cluster"]
        direction LR
        A6["App"] <-->|"loopback"| SC["Sidecar (cache)"]
        SC -->|"Arrow Flight"| CL["Spice Cluster"]
    end
```

Spice supports multiple deployment architectures:

- [Sidecar Deployment](./sidecar) - Deploy alongside applications
- [Microservice Deployment (Single or Multiple Replicas)](./microservice) - Standalone service deployment
- [Tiered Deployment](./tiered) - Edge, application, and cloud tiers
- [Hybrid Deployment](./hybrid) - Kubernetes-native sidecar caching with centralized cluster
- [Cloud-Hosted in the Spice Cloud Platform](./hosted) - Managed cloud deployment
- [Sharded Deployment](./sharded) - Horizontal data partitioning
- [Cluster Deployment (Spice.ai Enterprise)](./cluster) - Kubernetes-native distributed cluster architecture
