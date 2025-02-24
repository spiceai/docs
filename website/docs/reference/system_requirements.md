---
title: 'Spice.ai Open Source System Requirements'
sidebar_label: 'Reference'
sidebar_position: 30
description: 'System requirements for running Spice.ai Open Source'
pagination_prev: null
pagination_next: null
---

This document outlines the system requirements for running Spice.ai Open Source. Ensure your environment meets these requirements to achieve optimal performance and stability. Note that resource requirements, particularly memory and storage, are highly dependent on workload and data. Specific recommendations are provided later in this document.

## Operating Systems and Architectures

Spice.ai supports the following operating systems and architectures:

- **Linux**: Distributions as noted (x86_64, ARM)
- **macOS**: macOS 12.0 (Monterey) or later (ARM/M-series only)
- **Windows**: Windows 11 or later (x86_64)

## Linux Distribution Support

Spice.ai supports the following Linux distributions:

- **Ubuntu Server LTS**: 22.04 or later
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
      image: spiceai/spiceai:latest
      resources:
        requests:
          memory: '8Gi'
          cpu: '2'
```

## Resource Requirements Based on Workload and Data

Spice resource requirements, particularly memory, are highly dependent on workload and data. The following table provides memory recommendations based on the dataset size and `refresh_mode`:

| Refresh Mode           | Memory Recommendation |
| ---------------------- | --------------------- |
| `refresh_mode: full`   | 2.5x the dataset size |
| `refresh_mode: append` | 1.5x the dataset size |

### DuckDB Memory Usage

When using DuckDB (as an accelerator or connector), it by default uses 80% of available memory. For more details, refer to the [DuckDB operations manual limits](https://duckdb.org/docs/operations_manual/limits.html).

## Additional Considerations

- **Security**: Regularly update your operating system and software dependencies to the latest versions to ensure security and stability.
- **Backups**: Implement a regular backup strategy for your database and configuration files.
- **Monitoring**: Ensure proper observability tools are in place for monitoring system performance and resource utilization.
