---
title: 'Spice.ai Open Source System Requirements'
sidebar_label: 'System Requirements'
sidebar_position: 30
description: 'System requirements for running Spice.ai Open Source'
pagination_prev: null
pagination_next: null
---

This document outlines the system requirements for running Spice.ai Open Source. Ensure your environment meets these requirements to achieve optimal performance and stability. Note that resource requirements, particularly memory and storage, are highly dependent on workload and data. Specific recommendations are provided later in this document.

## Operating Systems and Architectures

Spice.ai supports the following operating systems and architectures:

- **Linux (x86_64)**: Linux 5.10 or later, Intel 64-bit processor
- **Linux (ARM64)**: Linux 5.10 or later, ARM 64-bit processor
- **Apple macOS (ARM64)**: macOS 14 "Sonoma" or later, Apple 64-bit processor (M-series)
- **Microsoft Windows (x64)**: Windows 11 or later, Intel 64-bit processor

## Linux Distribution Support

Spice.ai supports the following Linux distributions:

- **Ubuntu Server LTS**: 22.04 "Jammy Jellyfish" or later
- **Debian**: 12 "Bookworm" or later
- **Amazon Linux**: 2 or later

## Server or Instance Hardware Requirements

Recommended minimum hardware specifications:

- **CPU**: Quad-core processor
- **Memory**: 8 GB RAM
- **Storage**: 50 GB available disk space

## Network Requirements

- **Internet Connection**: Required for downloading dependencies and updates.
- **Remote Data Sources**: A low-latency, high-bandwidth connection (1-10 Gbps+) is recommended for accessing remote data, model, tools, and embedding providers.

### Port Requirements

The following ports are used:

| Description                         | Port  |
| ----------------------------------- | ----- |
| HTTP / HTTPS (if TLS is configured) | 8090  |
| Metrics Endpoint                    | 9090  |
| Arrow Flight / ADBC/ODBC/JDBC       | 50051 |
| OpenTelemetry Ingestion             | 50052 |

## Kubernetes Requirements

When deploying Spice.ai on Kubernetes, it is important to configure your pod specifications appropriately to ensure optimal performance. Below are the recommended minimum configurations for CPU and memory requests:

### PodSpec Configuration

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: spice-ai-pod
spec:
  containers:
    - name: spice-ai-container
      image: spiceai/spiceai:latest-models
      resources:
        requests:
          memory: '8Gi'
          cpu: '4'
```

## Resource Requirements Based on Workload and Data

Spice resource requirements, particularly memory, are highly dependent on workload and data. The following table provides memory recommendations based on the dataset size and `refresh_mode`:

| Refresh Mode           | Memory Recommendation |
| ---------------------- | --------------------- |
| `refresh_mode: full`   | 2.5x the dataset size |
| `refresh_mode: append` | 1.5x the dataset size |

See [Memory Management and Best Pratices](memory.md) for a detailed guide on memory considerations.

## Additional Considerations

- **Security**: Regularly update your operating system and software dependencies to the latest versions to ensure security and stability.
- **Backups**: Implement a regular backup strategy for your database and configuration files.
- **Monitoring**: Ensure proper observability tools are in place for monitoring system performance and resource utilization.
