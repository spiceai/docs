---
title: 'Cloud Hosted'
sidebar_label: 'Hosted'
description: 'Deploying Spice cloud hosted in the Spice Cloud Platform'
sidebar_position: 6
pagination_prev: null
pagination_next: null
---

The Spice Runtime is deployed on a fully managed service within the Spice Cloud Platform, minimizing the operational burden of managing clusters, upgrades, and infrastructure.

<img width="740" alt="hosted" src="https://github.com/user-attachments/assets/a985527b-3481-40f4-a689-f784c893b314" />

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

**Not Ideal When**

- Ultra-low-latency colocated access is required — hosted deployments introduce network latency between your application and the Spice Runtime. Consider [Sidecar](./sidecar) or [Hybrid](./hybrid).
- Strict data residency or compliance requirements prohibit external hosting — data must remain within your own infrastructure. Consider self-managed [Microservice](./microservice) or [Cluster](./cluster) deployments.
- Full control over infrastructure, configuration, and upgrades is needed — managed services abstract these away. Consider [Kubernetes](../kubernetes) with self-managed deployments.

**Example Use Case**
A startup or team with limited DevOps support that needs a reliable, managed environment. Quick deployment and minimal in-house infrastructure responsibilities are priorities.
