---
title: 'Sharded'
sidebar_label: 'Sharded'
description: 'Deploying Spice with shards'
sidebar_position: 1
pagination_prev: null
pagination_next: null
---

The Spice Runtime instances can be sharded based on specific criteria, such as by customer, state, or other logical partitions. Each shard operates independently, with a 1:N Application to Spice instances ratio.

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
