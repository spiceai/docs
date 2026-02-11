---
title: 'Microservice Deployment (Single or Multiple Replicas)'
sidebar_label: 'Microservice'
description: 'Deploying Spice as a microservice'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

The Spice Runtime operates as an independent microservice. Multiple replicas may be deployed behind a load balancer to achieve high availability and handle spikes in demand.

<img width="740" alt="microservice" src="https://github.com/user-attachments/assets/b46f050b-e500-4d53-b354-24f0ab30cad3" />

**Benefits**

- Loose coupling between the application and the Spice Runtime.
- Independent scaling and upgrades.
- Can serve multiple applications or services within an organization.
- Helps achieve high availability and redundancy.

**Considerations**

- Additional network hop introduces latency compared to sidecar.
- More complex infrastructure, requiring service discovery and load balancing.
- Potentially higher cost due to additional infrastructure components.

**Use This Approach When**

- A loosely coupled architecture and the ability to independently scale the AI service are desired.
- Multiple services or teams need to share the same AI engine.
- Heavy or varying traffic is anticipated, requiring independent scaling of the Spice Runtime.
- Resiliency and redundancy are prioritized over simplicity.

**Not Ideal When**

- Ultra-low-latency is required — the network hop between app and Spice adds latency compared to loopback. Consider [Sidecar](./sidecar) or [Hybrid](./hybrid).
- Applications need sub-millisecond reads for hot data — a local cache is faster. Consider [Sidecar](./sidecar) or [Hybrid](./hybrid) for caching with centralized management.
- The deployment is small-scale with a single application — the added infrastructure of service discovery and load balancing may not be justified. Consider [Sidecar](./sidecar).

**Example Use Case**
A large organization where multiple services (recommendations, analytics, etc.) share a centralized Spice Runtime. Separate teams consume data and query outputs without duplicating ingestion or acceleration efforts.
