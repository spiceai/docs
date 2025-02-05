---
title: 'Microservice Deployment (Single or Multiple Replicas)'
sidebar_label: 'Microservice'
description: 'Deploying Spice as a microservice'
sidebar_position: 2
pagination_prev: null
pagination_next: null
---

The Spice Runtime operates as an independent microservice. Multiple replicas may be deployed behind a load balancer to achieve high availability and handle spikes in demand.

![microservice](https://github.com/user-attachments/assets/906e417d-24eb-4e81-ba2a-ff0413ea30fb)


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

**Example Use Case**  
A large organization where multiple services (recommendations, analytics, etc.) need to share AI insights. A centralized Spice Runtime microservice cluster helps separate teams consume AI outputs without duplicating efforts.
