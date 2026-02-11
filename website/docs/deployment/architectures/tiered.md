---
title: 'Tiered Deployment'
sidebar_label: 'Tiered'
description: 'Deploying Spice in tiers'
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

A hybrid approach combining sidecar deployments for performance-critical tasks and a shared microservice for batch processing or less time-sensitive workloads.

<img width="740" alt="tiered" src="https://github.com/user-attachments/assets/e602bad4-bd0d-4069-bc91-5b5678a10710" />

**Benefits**

- Real-time responsiveness where needed (sidecar).
- Centralized microservice handles broader or shared tasks.
- Balances resource usage by limiting sidecar instances to high-priority operations.
- Helps balance performance and latency with cost and complexity.

**Considerations**

- More complex deployment structure, mixing two patterns.
- Must ensure consistent versioning between sidecar and microservice instances.
- Potentially higher operational complexity and cost.

**Use This Approach When**

- Certain application components require ultra-low-latency responses, while others do not.
- Centralized AI or analytics is needed, but localized real-time decision-making is also required.
- The system can handle the operational complexity of running multiple deployment patterns.
- Balancing performance and latency with cost and complexity is the goal.

**Not Ideal When**

- All workloads have similar latency requirements — the complexity of mixing two patterns isn't justified. Use [Sidecar](./sidecar) if everything needs low-latency, or [Microservice](./microservice) if shared access is sufficient.
- The team cannot manage two deployment patterns simultaneously — operational overhead is significant. Consider [Microservice](./microservice) or [Hosted](./hosted) for simplicity.
- Centralized data ingestion and acceleration are needed — the microservice tier doesn't provide cluster-level features. Consider [Hybrid](./hybrid) or [Cluster](./cluster).

**Example Use Case**
A logistics application that calculates routing decisions in real time (sidecar) while a microservice component processes aggregated data for periodic analysis or re-training models.
