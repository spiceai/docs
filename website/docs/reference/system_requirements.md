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
- **Microsoft Windows (x64)**: Windows 11 or later with [WSL 2](https://learn.microsoft.com/windows/wsl/install) running Ubuntu 24.04 or later. The Spice runtime does not run natively on Windows in v2.x.

## Linux Distribution Support

The pre-built Spice Linux binaries (the `spice` CLI and the `spiced` runtime) require **glibc 2.39 or later**. Spice.ai supports the following Linux distributions:

- **Ubuntu LTS**: 24.04 "Noble Numbat" or later
- **Debian**: 13 "Trixie" or later
- Other distributions that ship glibc 2.39 or later

Check the glibc version with `ldd --version`. Distributions with an older glibc, such as Ubuntu 22.04, Debian 12, Amazon Linux 2, Amazon Linux 2023, and RHEL 9, cannot run the pre-built binaries and fail with an error such as ``version `GLIBC_2.39' not found``. On these systems, run Spice with the [Docker image](../deployment/docker/index.md) instead.

## TLS certificate trust

Outbound TLS does not use one trust store for every client.

The HTTP client verifies server certificates with the operating system's CA store. On Linux that store is the `ca-certificates` bundle, read when the client is created. Arrow Flight client connections load the same system store.

The PostgreSQL logical-replication client checks the server certificate only when [`pg_sslmode`](../features/cdc/postgres-replication.md#pg_sslmode-for-wal-streaming) is `verify-ca` or `verify-full`. With no `pg_sslrootcert`, those modes use the Mozilla roots compiled into the `webpki-roots` crate shipped with that Spice build. `require` encrypts the stream and does not check the certificate. `disable`, and `prefer` on the replication transport, send plaintext. An unset `pg_sslmode` is `prefer` when the connection uses discrete parameters, and `verify-full` when a `pg_connection_string` omits `sslmode`.

When a public CA is distrusted, update the store that connection uses. For `verify-ca` or `verify-full` with no CA file, upgrade Spice so the new build's `webpki-roots` verifies the certificate. For the HTTP client and Arrow Flight, rebuild a custom Docker image so it installs a current `ca-certificates` package, or update that package on the host when `spiced` runs outside Docker. The runtime reads the system bundle when the client is created, so a package update applies on the next start.

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

| Description                         | Port  | Required                                          |
| ----------------------------------- | ----- | ------------------------------------------------- |
| HTTP / HTTPS (if TLS is configured) | 8090  | Yes                                               |
| Metrics Endpoint                    | 9090  | No (disabled by default, enable with `--metrics`) |
| Arrow Flight / ADBC/ODBC/JDBC       | 50051 | Yes                                               |

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
          cpu: '4'
        limits:
          memory: '16Gi'  # Set higher than request for burst capacity
          # Do not set CPU limits - see recommendations below
```

:::tip[CPU Limits]

Avoid setting CPU limits for Spice pods. CPU limits can cause [throttling](https://home.robusta.dev/blog/stop-using-cpu-limits) even when CPU is available, leading to degraded query performance and increased latency. Instead, set appropriate CPU requests to guarantee scheduling and allow pods to burst when needed. For more details, see [Kubernetes CPU requests and limits](https://www.datadoghq.com/blog/kubernetes-cpu-requests-limits/).

:::

## Resource Requirements Based on Workload and Data

Spice resource requirements, particularly memory, are highly dependent on workload and data. The following table provides memory recommendations based on the dataset size and `refresh_mode`:

| Refresh Mode           | Memory Recommendation |
| ---------------------- | --------------------- |
| `refresh_mode: full`   | 2.5x the dataset size |
| `refresh_mode: append` | 1.5x the dataset size |

See [Memory Management and Best Practices](memory) for a detailed guide on memory considerations.

## Additional Considerations

- **Security**: Regularly update your operating system and software dependencies to the latest versions to ensure security and stability.
- **Backups**: Implement a regular backup strategy for your database and configuration files.
- **Monitoring**: Ensure proper observability tools are in place for monitoring system performance and resource utilization.
