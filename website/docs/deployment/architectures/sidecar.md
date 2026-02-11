---
title: 'Sidecar Deployment'
sidebar_label: 'Sidecar'
description: 'Deploying Spice as a application sidecar'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

Run the Spice Runtime in a separate container or process on the same machine as the main application. For example, in Kubernetes as a [Sidecar Container](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/). This approach minimizes communication overhead as requests to the Spice Runtime are transported over local loopback.

<img width="740" alt="sidecar" src="https://github.com/user-attachments/assets/716f7c23-1939-4947-85f5-b0ee2bbd63fc" />

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

**Not Ideal When**

- Many applications need access to the same datasets — each sidecar independently ingests and accelerates data, increasing load on data sources. Consider [Microservice](./microservice) or [Hybrid](./hybrid) instead.
- Cost efficiency is the priority — resource duplication across pods adds up at scale. Consider [Microservice](./microservice) or [Hosted](./hosted).
- Centralized data management is required — sidecars operate independently with no shared state. Consider [Hybrid](./hybrid) or [Cluster](./cluster).

**Example Use Case**
A real-time trading bot or a data-intensive application that relies on immediate feedback, where minimal latency is critical. Both containers in the same pod ensure very fast data exchange.
