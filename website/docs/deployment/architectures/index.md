---
title: 'Deployment Architectures'
sidebar_label: 'Architectures'
description: 'Spice.ai Open Source Deployment architectures'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [1. Sidecar Deployment](#1-sidecar-deployment)
- [2. Microservice Deployment (Single or Multiple Replicas)](#2-microservice-deployment-single-or-multiple-replicas)
- [3. Tiered Deployment](#3-tiered-deployment)
- [4. Cloud-Hosted in the Spice Cloud Platform](#4-cloud-hosted-in-the-spice-cloud-platform)
- [5. Sharded Deployment](#5-sharded-deployment)
- [6. Additional Considerations](#6-additional-considerations)
- [References](#references)

## 1. Sidecar Deployment

Run the Spice Runtime in a separate container or process on the same machine as the main application. For example, in Kubernetes as a [Sidecar Container](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/). This approach minimizes communication overhead as requests to the Spice Runtime are transported over local loopback.

**Benefits**

- Low-latency communication between the application and the Spice Runtime.
- Simplified lifecycle management (same pod).
- Isolated environment without needing a separate microservice.
- Helps ensure resiliency and redundancy by replicating data across sidecars.

**Considerations**

- Each application pod includes a copy of the Spice Runtime, increasing resource usage.
- Updating the Spice Runtime independently requires updating each pod.
- Accelerated data is replicated to each sidecar, adding resiliency and redundancy but increasing resource usage and requests to data sources.
- May increase overall cost due to resource duplication.

**Use This Approach When**

- Fast, low-latency interactions between the application and the Spice Runtime are needed (e.g., real-time decision-making).
- Scaling needs are small or moderate, making duplication of the Spice Runtime in each pod acceptable.
- Keeping the architecture simple without additional services or load balancers is preferred.
- Performance and latency are prioritized over cost and complexity.

**Example Use Case**  
A real-time trading bot or a data-intensive application that relies on immediate feedback, where minimal latency is critical. Both containers in the same pod ensure very fast data exchange.

---

## 2. Microservice Deployment (Single or Multiple Replicas)

The Spice Runtime operates as an independent microservice. Multiple replicas may be deployed behind a load balancer to achieve high availability and handle spikes in demand.

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

---

## 3. Tiered Deployment

**Overview**  
A hybrid approach combining sidecar deployments for performance-critical tasks and a shared microservice for batch processing or less time-sensitive workloads.

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

**Example Use Case**  
A logistics application that calculates routing decisions in real time (sidecar) while a microservice component processes aggregated data for periodic analysis or re-training models.

---

## 4. Cloud-Hosted in the Spice Cloud Platform

**Overview**  
The Spice Runtime is deployed on a fully managed service within the Spice Cloud Platform, minimizing the operational burden of managing clusters, upgrades, and infrastructure.

**Benefits**

- Reduced overhead for deployment, scaling, and maintenance.
- Access to specialized hosting features and quick setup.
- Helps reduce operational complexity and cost.

**Considerations**

- Reliance on external hosting and associated terms or limits.
- Potential compliance or data residency considerations for certain industries.
- May introduce latency depending on the cloud provider's infrastructure.

**Use This Approach When**

- Limited DevOps resources are available, or focus on application logic over infrastructure is preferred.
- A fully managed environment with minimal setup time is desired.
- A single, managed solution is prioritized over running own clusters.
- Minimizing operational complexity and cost is the goal.

**Example Use Case**  
A startup or team with limited DevOps support that needs a reliable, managed environment. Quick deployment and minimal in-house infrastructure responsibilities are priorities.

---

## 5. Sharded Deployment

**Overview**  
The Spice Runtime instances are sharded based on specific criteria, such as by customer, state, or other logical partitions. Each shard operates independently, with a 1:N Application to Spice instances ratio.

**Benefits**

- Helps distribute load across multiple instances, improving performance and scalability.
- Isolates failures to specific shards, enhancing resiliency.
- Allows tailored configurations and optimizations for different shards.

**Considerations**

- More complex deployment and management due to multiple instances.
- Requires effective sharding strategy to balance load and avoid hotspots.
- Potentially higher cost due to multiple instances.

**Use This Approach When**

- Distributing load across multiple instances for better performance is needed.
- Isolating failures to specific shards to improve resiliency is desired.
- The application can benefit from tailored configurations for different logical partitions.
- The complexity of managing multiple instances can be handled.

**Example Use Case**  
A multi-tenant application where each customer has a dedicated Spice Runtime instance. This helps ensure that heavy usage by one customer does not impact others, and allows for customer-specific optimizations.

---

## 6. Additional Considerations

**Hybrid/On-Premises**  
For organizations subject to strict data governance, the Spice Runtime can run entirely on-premises or in a hybrid setup (some services in the cloud, some on-prem). This helps ensure compliance with data residency requirements while balancing performance and cost.

**Edge/IoT**  
Specialized containers or hardware can be used where device resources are limited. Useful for near-sensor AI in manufacturing or industrial monitoring scenarios. This approach helps achieve low latency and high performance in resource-constrained environments.

---

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
