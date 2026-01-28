---
title: 'Distributed Query'
sidebar_label: 'Distributed Query'
description: 'Learn how to run Spice in distributed mode for larger scale queries.'
sidebar_position: 4
pagination_prev: null
pagination_next: null
---

Learn how to configure and run Spice in distributed mode to handle larger scale queries across multiple nodes.

:::info Preview
Multi-node distributed query execution based on Apache Ballista is available as a preview feature in Spice `v1.9.0`.
:::

## Overview

Spice integrates [Apache Ballista](https://github.com/apache/datafusion-ballista) to schedule and coordinate distributed queries across multiple executor nodes. This integration is useful when querying large, partitioned datasets in data lake formats such as Parquet, Delta Lake, or Iceberg. For smaller workloads or non-partitioned data, a single Spice instance is typically sufficient.

## Architecture

A distributed Spice cluster consists of two components:

- **Scheduler** – Plans distributed queries and manages the work queue for the executor fleet.
- **Executors** – One or more nodes responsible for executing physical query plans.

The scheduler holds the cluster-wide configuration for a Spicepod, while executors connect to the scheduler to receive work. A cluster can run with a single scheduler for simplicity, or multiple schedulers for [high availability](#high-availability).

### Network Ports

Spice separates public and internal cluster traffic across different ports:

| Port | Service | Description |
|------|---------|-------------|
| 50051 | Flight SQL | Public query endpoint |
| 8090 | HTTP API | Public REST API |
| 9090 | Prometheus | Metrics endpoint |
| 50052 | Cluster Service | Internal scheduler/executor communication (mTLS enforced, by default) |

Internal cluster services are isolated on port 50052 with mTLS enforced by default.

## Secure Cluster Communication (mTLS)

Distributed query cluster mode uses mutual TLS (mTLS) for secure communication between schedulers and executors. Internal cluster communication includes highly privileged RPC calls like fetching Spicepod configuration and expanding secrets. mTLS ensures only authenticated nodes can join the cluster and access sensitive data.

### Certificate Requirements

Each node in the cluster requires:

- A CA certificate (`ca.crt`) trusted by all nodes
- A node certificate with the node's advertise address in the Subject Alternative Names (SANs)
- A private key for the node certificate

Production deployments should use the organization's PKI infrastructure to generate certificates with proper SANs for each node.

### Development Certificates

For local development and testing, the Spice CLI provides commands to generate self-signed certificates:

```bash
# Initialize CA and generate CA certificate
spice cluster tls init

# Generate certificate for the scheduler node
spice cluster tls add scheduler1

# Generate certificate for an executor node
spice cluster tls add executor1
```

Certificates are stored in `~/.spice/pki/` by default.

:::warning
CLI-generated certificates are not intended for production use. Production deployments should use certificates issued by the organization's PKI or a trusted certificate authority.
:::

### Insecure Mode

For local development and testing, mTLS can be disabled using the `--allow-insecure-connections` flag:

```bash
spiced --role scheduler --allow-insecure-connections
```

:::warning
Do not use `--allow-insecure-connections` in production environments. This flag disables authentication and encryption for internal cluster communication.
:::

### Network Ports

Spice separates public and internal cluster traffic across different ports:

| Port | Service | Description |
|------|---------|-------------|
| 50051 | Flight SQL | Public query endpoint |
| 8090 | HTTP API | Public REST API |
| 9090 | Prometheus | Metrics endpoint |
| 50052 | Cluster Service | Internal scheduler/executor communication (mTLS enforced, by default) |

Internal cluster services are isolated on port 50052 with mTLS enforced by default.

## Secure Cluster Communication (mTLS)

Distributed query cluster mode uses mutual TLS (mTLS) for secure communication between schedulers and executors. Internal cluster communication includes highly privileged RPC calls like fetching Spicepod configuration and expanding secrets. mTLS ensures only authenticated nodes can join the cluster and access sensitive data.

### Certificate Requirements

Each node in the cluster requires:

- A CA certificate (`ca.crt`) trusted by all nodes
- A node certificate with the node's advertise address in the Subject Alternative Names (SANs)
- A private key for the node certificate

Production deployments should use the organization's PKI infrastructure to generate certificates with proper SANs for each node.

### Development Certificates

For local development and testing, the Spice CLI provides commands to generate self-signed certificates:

```bash
# Initialize CA and generate CA certificate
spice cluster tls init

# Generate certificate for the scheduler node
spice cluster tls add scheduler1

# Generate certificate for an executor node
spice cluster tls add executor1
```

Certificates are stored in `~/.spice/pki/` by default.

:::warning
CLI-generated certificates are not intended for production use. Production deployments should use certificates issued by the organization's PKI or a trusted certificate authority.
:::

### Insecure Mode

For local development and testing, mTLS can be disabled using the `--allow-insecure-connections` flag:

```bash
spiced --role scheduler --allow-insecure-connections
```

:::warning
Do not use `--allow-insecure-connections` in production environments. This flag disables authentication and encryption for internal cluster communication.
:::

### Network Ports

Spice separates public and internal cluster traffic across different ports:

| Port | Service | Description |
|------|---------|-------------|
| 50051 | Flight SQL | Public query endpoint |
| 8090 | HTTP API | Public REST API |
| 9090 | Prometheus | Metrics endpoint |
| 50052 | Cluster Service | Internal scheduler/executor communication (mTLS enforced, by default) |

Internal cluster services are isolated on port 50052 with mTLS enforced by default.

## Secure Cluster Communication (mTLS)

Distributed query cluster mode uses mutual TLS (mTLS) for secure communication between schedulers and executors. Internal cluster communication includes highly privileged RPC calls like fetching Spicepod configuration and expanding secrets. mTLS ensures only authenticated nodes can join the cluster and access sensitive data.

### Certificate Requirements

Each node in the cluster requires:

- A CA certificate (`ca.crt`) trusted by all nodes
- A node certificate with the node's advertise address in the Subject Alternative Names (SANs)
- A private key for the node certificate

Production deployments should use the organization's PKI infrastructure to generate certificates with proper SANs for each node.

### Development Certificates

For local development and testing, the Spice CLI provides commands to generate self-signed certificates:

```bash
# Initialize CA and generate CA certificate
spice cluster tls init

# Generate certificate for the scheduler node
spice cluster tls add scheduler1

# Generate certificate for an executor node
spice cluster tls add executor1
```

Certificates are stored in `~/.spice/pki/` by default.

:::warning
CLI-generated certificates are not intended for production use. Production deployments should use certificates issued by the organization's PKI or a trusted certificate authority.
:::

### Insecure Mode

For local development and testing, mTLS can be disabled using the `--allow-insecure-connections` flag:

```bash
spiced --role scheduler --allow-insecure-connections
```

:::warning
Do not use `--allow-insecure-connections` in production environments. This flag disables authentication and encryption for internal cluster communication.
:::

## Getting Started

Cluster deployment typically starts with a scheduler instance, followed by one or more executors that register with the scheduler.

The following examples use CLI-generated development certificates. For production, substitute certificates from your organization's PKI.

### Generate Development Certificates

```bash
spice cluster tls init
spice cluster tls add scheduler1
spice cluster tls add executor1
```

### Start the Scheduler

The scheduler is the only `spiced` process that needs to be configured (i.e. have a `spicepod.yaml` in the current dir). Override the Flight bind address when it must be reachable outside of `localhost`:

```bash
spiced --role scheduler \
  --flight 0.0.0.0:50051 \
  --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
  --node-mtls-certificate-file ~/.spice/pki/scheduler1.crt \
  --node-mtls-key-file ~/.spice/pki/scheduler1.key
```

### Start Executors

Executors connect to the scheduler's internal cluster port (50052) to register and pull work. Executors do not require a `spicepod.yaml`; they fetch the configuration from the scheduler. Each executor automatically selects a free port if the default is unavailable:

```bash
spiced --role executor \
  --scheduler-address https://scheduler1:50052 \
  --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
  --node-mtls-certificate-file ~/.spice/pki/executor1.crt \
  --node-mtls-key-file ~/.spice/pki/executor1.key
```

Specifying `--scheduler-address` implies `--role executor`.

## Query Execution

Queries run against the scheduler endpoint. The `EXPLAIN` output confirms that distributed planning is active—Spice includes a `distributed_plan` section showing how stages are split across executors:

```sql
EXPLAIN SELECT count(id) FROM my_dataset;
```

:::warning[Limitations]

- Accelerated datasets are not yet supported; distributed query currently targets partitioned data lake sources.
- As a preview feature, clusters may encounter stability or performance issues.
- Accelerator support is planned for future releases; follow release notes for updates.

:::

## High Availability

For production deployments, Spice supports running multiple active schedulers in an active/active configuration. This eliminates the scheduler as a single point of failure and enables graceful handling of node failures.

### HA Architecture

In an HA cluster:

- Multiple schedulers run simultaneously, each capable of accepting queries
- Schedulers share state via an S3-compatible object store
- Executors discover all schedulers automatically
- A load balancer distributes client queries across schedulers

```
                    ┌─────────────────────┐
                    │    Load Balancer    │
                    └─────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Scheduler  │   │ Scheduler  │   │ Scheduler  │◄──►  Object Store
       │            │   │            │   │            │        (S3)
       └────────────┘   └────────────┘   └────────────┘
              ▲                ▲                ▲
              │    (executor-initiated)         │
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │  Executor  │   │  Executor  │   │  Executor  │
       └────────────┘   └────────────┘   └────────────┘
```

### Configuration

Enable HA by configuring `runtime.scheduler.state_location` in the Spicepod to point to an S3-compatible object store:

```yaml
runtime:
  scheduler:
    state_location: s3://my-bucket/spice-cluster
    params:
      region: us-east-1
```

The object store is used for scheduler registration and discovery. Job state persistence for query handoff between schedulers is planned for a future release.

### S3 Configuration

The `runtime.scheduler.params` section supports the following S3 parameters:

| Parameter        | Description                                           | Default    |
| ---------------- | ----------------------------------------------------- | ---------- |
| `region`         | AWS region for the S3 bucket                          | -          |
| `endpoint`       | Custom S3-compatible endpoint URL                     | -          |
| `auth`           | Authentication method: `iam_role` or `key`            | `iam_role` |
| `key`            | AWS access key ID (when `auth: key`)                  | -          |
| `secret`         | AWS secret access key (when `auth: key`)              | -          |
| `session_token`  | AWS session token for temporary credentials           | -          |
| `client_timeout` | S3 client timeout                                     | -          |
| `allow_http`     | Allow HTTP (non-TLS) connections to S3 endpoint       | `false`    |

Example with explicit credentials:

```yaml
runtime:
  scheduler:
    state_location: s3://my-bucket/spice-cluster
    params:
      region: us-east-1
      auth: key
      key: ${secrets:aws_access_key}
      secret: ${secrets:aws_secret_key}
```

### Starting an HA Cluster

1. **Configure shared state** in `spicepod.yaml`:

   ```yaml
   runtime:
     scheduler:
       state_location: s3://my-bucket/spice-cluster
       params:
         region: us-east-1
   ```

2. **Start multiple schedulers**, each with unique certificates:

   ```bash
   # Scheduler 1
   spiced --role scheduler \
     --flight 0.0.0.0:50051 \
     --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
     --node-mtls-certificate-file ~/.spice/pki/scheduler1.crt \
     --node-mtls-key-file ~/.spice/pki/scheduler1.key

   # Scheduler 2 (on a different node)
   spiced --role scheduler \
     --flight 0.0.0.0:50051 \
     --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
     --node-mtls-certificate-file ~/.spice/pki/scheduler2.crt \
     --node-mtls-key-file ~/.spice/pki/scheduler2.key
   ```

3. **Start executors** (they discover all schedulers automatically):

   ```bash
   spiced --role executor \
     --scheduler-address https://scheduler1:50052 \
     --node-mtls-ca-certificate-file ~/.spice/pki/ca.crt \
     --node-mtls-certificate-file ~/.spice/pki/executor1.crt \
     --node-mtls-key-file ~/.spice/pki/executor1.key
   ```

4. **Configure a load balancer** to distribute queries across scheduler Flight SQL endpoints (port 50051).

### HA Considerations

- **Object store latency** – The object store is accessed during scheduler coordination. Use a low-latency object store (e.g., S3 Express One Zone) for best performance.

:::info Object Store Requirements
The object store must support conditional writes (S3 ETags). Most S3-compatible stores support this, including AWS S3, MinIO, and Google Cloud Storage (with S3 compatibility mode).
:::
