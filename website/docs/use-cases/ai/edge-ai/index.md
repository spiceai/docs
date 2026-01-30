---
title: 'Edge-Enabled AI Applications and Agents'
sidebar_label: 'Edge AI'
sidebar_position: 8
description: 'Spice.ai deploys AI applications and agents across cloud and edge for low-latency decisions in security IoT use cases.'
pagination_prev: null
pagination_next: null
---

Spice.ai deploys AI applications and agents across cloud and edge for low-latency decisions in security IoT use cases, ensuring rapid threat detection and response in distributed environments.

Unlike cloud-centric AI platforms (e.g., AWS SageMaker, Google Vertex AI) that rely on constant connectivity and introduce latency, Spice.ai’s edge data materialization and local model inference enable real-time, resilient AI operations. This is critical for security applications requiring immediate action and functionality in low-connectivity scenarios, outperforming cloud-dependent solutions in speed and reliability.

## Why Spice.ai?

- **Edge Acceleration**: Materializes data (e.g., sensor logs, event streams) at the edge for fast, local queries, minimizing latency compared to cloud-only inference, essential for security IoT responsiveness.
- **Unified Queries**: Seamlessly accesses cloud and edge data sources (e.g., Databricks, on-premises sensors) via federated SQL, simplifying distributed architectures for security deployments.
- **Local Models**: Deploys lightweight AI models (e.g., NVIDIA NIM, OSS Llama) at the edge, reducing costs and ensuring data privacy, critical for sensitive security data in regulated environments.
- **Resilience**: Maintains edge functionality during network disruptions, ensuring continuous threat monitoring and response, unlike cloud-reliant platforms vulnerable to outages.

## Example

A security IoT system processes real-time sensor data from edge devices to detect unauthorized access attempts in a corporate facility, using local AI models to prioritize alerts without cloud dependency. This ensures instant threat detection and response, even during network outages, outperforming cloud-dependent systems that suffer from latency and connectivity issues. The [Running Llama3 Locally recipe](https://github.com/spiceai/cookbook/blob/trunk/llama/README) demonstrates edge model deployment for such scenarios.

## Benefits

- **Low Latency**: Edge processing delivers instant threat detection, critical for security IoT applications.
- **Reliability**: Offline capabilities ensure continuous operation in distributed environments, enhancing system uptime.
- **Privacy**: Local inference protects sensitive security data, aligning with compliance requirements in regulated industries.

### Learn More

- **AI Gateway**: [Documentation](../../../features/large-language-models/index) and [Running Llama3 Locally Recipe](https://github.com/spiceai/cookbook/blob/trunk/llama/README).
- **Federated SQL Queries**: [Documentation](../../../features/query-federation/index) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README).
- **Data Acceleration**: [Documentation](../../../features/data-acceleration/index) and [DuckDB Data Accelerator Recipe](https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README).
