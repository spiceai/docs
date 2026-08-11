---
title: 'Spice Runtime Distributions'
sidebar_label: 'Distributions'
sidebar_position: 31
description: 'Distribution variants of the Spice runtime for different use cases and deployment scenarios, including data-only, GPU-accelerated, NAS, and allocator variants.'
pagination_prev: null
pagination_next: null
---

The Spice open source project provides multiple distribution variants to support different use cases and deployment scenarios.

:::note
The Spice runtime is **64-bit only**. 32-bit platforms are not supported.
:::

## Image Channels

| Channel                                                                                                  | Image                             | Description                             |
| -------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------- |
| [DockerHub](https://hub.docker.com/r/spiceai/spiceai)                                                    | `spiceai/spiceai`                 | Official release images                 |
| [GitHub Container Registry](https://github.com/spiceai/spiceai/pkgs/container/spiceai)                   | `ghcr.io/spiceai/spiceai`         | Official release images                 |
| [GitHub Container Registry (Nightly)](https://github.com/spiceai/spiceai/pkgs/container/spiceai-nightly) | `ghcr.io/spiceai/spiceai-nightly` | Nightly builds with additional variants |
| [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jmf6jskjvnq7i)                          | —                                 | Enterprise image                        |
| Azure Marketplace                                                                                        | —                                 | Enterprise image (coming soon)          |
| [Spice Cloud Platform](https://spice.ai/pricing)                                                         | —                                 | Uses Enterprise image                   |
| [Spice.ai Enterprise](https://spice.ai/pricing)                                                          | —                                 | Uses Enterprise image                   |

:::note
Some variant distributions are only available in **nightly images** (data) or exclusively through the [Spice Cloud Platform and Spice.ai Enterprise](https://spice.ai/pricing) (NAS, CUDA, allocator variants).
:::

## Supported Platforms and Hardware Requirements

| Platform | Architecture            | Minimum CPU Features                   | Build Prerequisites |
| -------- | ----------------------- | -------------------------------------- | ------------------- |
| Linux    | x86_64                  | AVX2, FMA, BMI1/2, LZCNT, POPCNT       | —                   |
| Linux    | aarch64 (arm64)         | NEON, FP16 (FEAT_FP16), FHM (FEAT_FHM) | `clang`, `lld`      |
| macOS    | aarch64 (Apple Silicon) | Native (build host)                    | —                   |
| Windows  | x86_64 (MSVC)           | —                                      | MSVC toolchain      |

:::note
Windows support is CLI (`spice`) only. The runtime daemon (`spiced`) is not supported on Windows natively — use WSL instead.
:::

## Distribution Availability

| Distribution / Variant | Image Tag | Open Source | Spice Cloud | Enterprise |
| --- | --- | --- | --- | --- |
| Default (Data + AI) | `latest` | ✅ | ✅ | ✅ |
| Data-only | `latest-data` | Nightly only | ✅ | ✅ |
| NFS connector | — | Local build only | ❌ | ✅ |
| Metal (macOS) | — | Local build only | ✅ | ✅ |
| CUDA (Linux) | `latest-cuda` | Local build only | ✅ | ✅ |
| Allocator variants | `latest-{jemalloc,mimalloc,sysalloc}` | Local build only | ✅ | ✅ |
| ODBC connector | — | Local build only | ✅ | ✅ |

## Default Distribution

The default distribution includes all features including AI/ML model support. This is the recommended distribution for most users.

**Included Features:**

- All standard data connectors (PostgreSQL, MySQL, DuckDB, SQLite, ClickHouse, etc.)
- Embedded data accelerators (Spice Cayenne, DuckDB, SQLite)
- AI/ML model inference (LLMs, embeddings)
- Search capabilities (Vector and BM-25 Full-Text-Search)
- Default memory allocator (snmalloc)

:::note
The PostgreSQL data accelerator is only available in nightly builds. The PostgreSQL data connector is included in all distributions.
:::

**Installation:**

```bash
curl https://install.spiceai.org | /bin/bash
```

**Docker:**

```bash
docker pull ghcr.io/spiceai/spiceai:latest
# or
docker pull spiceai/spiceai:latest
```

## Data Distribution

The data distribution excludes AI/ML model support, resulting in a smaller binary size and reduced attack surface. Use this when data federation and acceleration capabilities are needed without AI features.

:::note
**Open Source:** Available in nightly builds only. **[Cloud Platform & Enterprise](https://spice.ai/pricing):** Production-ready data distribution available.
:::

**Included Features:**

- All data connectors
- All data accelerators
- Default memory allocator (snmalloc)

**Excluded Features:**

- AI/ML model inference
- LLM support
- Embedding models

**Docker (Nightly):**

```bash
docker pull ghcr.io/spiceai/spiceai-nightly:latest-data
```

**Local Build:**

```bash
make install-data-only
```

## GPU-Accelerated Distributions

### Metal (macOS)

For macOS systems with Apple Silicon, the Metal distribution enables GPU-accelerated AI/ML inference.

**Included Features:**

- All default features
- Metal GPU acceleration for model inference

**Local Build:**

```bash
make install-metal
```

### CUDA (Linux)

For Linux systems with NVIDIA GPUs, CUDA distributions enable GPU-accelerated AI/ML inference. Multiple CUDA compute capability versions are available.

:::note
CUDA distributions are available with the [Spice Cloud Platform and Spice.ai Enterprise](https://spice.ai/pricing). Open source users can build locally for development and testing.
:::

**Included Features:**

- All default features
- CUDA GPU acceleration for model inference

**Supported Compute Capabilities:**

- 80 (A100, A30)
- 86 (RTX 30xx, A40, A10)
- 87 (Jetson Orin)
- 89 (RTX 40xx, L40, L4)
- 90 (H100, H200)

**Local Build:**

```bash
CUDA_COMPUTE_CAP=89 make install-cuda
```

## NFS Distribution

The NFS (Network File System) distribution adds support for the NFS data connector, enabling federated queries against data stored on NFS exports.

:::note
The SMB data connector is **not** part of this variant — `smb` is in the default `spiced` feature set, so SMB shares are queryable from the standard distribution. Only the NFS connector is feature-gated.
:::

:::note
The NFS connector is available with [Spice.ai Enterprise](https://spice.ai/pricing). Open source users can build locally for development and testing.
:::

**Included Features:**

- All default features
- NFS data connector

**Local Build:**

```bash
make install-nfs
```

## Allocator Variants

Different memory allocators can significantly impact performance depending on workload characteristics.

:::note
Allocator variants are available with the [Spice Cloud Platform and Spice.ai Enterprise](https://spice.ai/pricing). Open source users can build locally for development and testing.
:::

### snmalloc (Default)

The default allocator, optimized for concurrent workloads.

### jemalloc

Alternative allocator that may perform better for certain memory allocation patterns.

### mimalloc

Microsoft's mimalloc allocator, designed for performance and security.

### System Allocator

Uses the system's default allocator (glibc malloc on Linux).

## Platform Support

| Platform                      | Default | Data            | NFS             | Metal | CUDA             |
| ----------------------------- | ------- | --------------- | --------------- | ----- | ---------------- |
| Linux x86_64                  | ✅       | Nightly         | Enterprise only | ❌     | Cloud/Enterprise |
| Linux aarch64                 | ✅       | Nightly         | Enterprise only | ❌     | ❌                |
| macOS aarch64 (Apple Silicon) | ✅       | Nightly         | Enterprise only | ✅     | ❌                |
| Windows (WSL)                 | ✅       | Nightly         | Enterprise only | ❌     | Cloud/Enterprise |
| Windows (Native)              | ❌       | Enterprise only | Enterprise only | ❌     | Enterprise only  |

:::note
Native Windows support for the Spice runtime is available with the [Spice Cloud Platform and Spice.ai Enterprise](https://spice.ai/pricing). Open source users on Windows should use Windows Subsystem for Linux (WSL).
:::

## Choosing a Distribution

| Use Case                                | Recommended Distribution |
| --------------------------------------- | ------------------------ |
| General purpose with AI capabilities    | Default                  |
| Data federation only, minimal footprint | Data (nightly)           |
| NFS exports                             | NFS                      |
| macOS with GPU acceleration             | Metal                    |
| Linux with NVIDIA GPU                   | CUDA                     |
| Memory allocation benchmarking          | Allocator variants       |

## Additional Connectors

Some connectors require additional dependencies and are available with the [Spice Cloud Platform and Spice.ai Enterprise](https://spice.ai/pricing):

- **ODBC** - Connect to any ODBC-compatible data source

These can be built locally for development and testing:

```bash
make install-odbc
```

## Platform-Specific Notes

### Linux arm64

- **FP16 (FEAT_FP16)** is required because the `gemm` matrix multiplication library (used by the Candle ML framework) contains half-precision ARM inline assembly that requires the `fullfp16` CPU feature. This is supported on AWS Graviton2+, Ampere Altra, Apple M-series (via Linux VM), and most ARMv8.2-A+ processors.
- **lld** is required as the linker because the spiced debug binary is large enough to exceed GNU ld's ±128 MiB branch range for `R_AARCH64_CALL26` relocations. lld automatically inserts range extension thunks.
- Install prerequisites on Ubuntu/Debian: `sudo apt-get install -y clang lld`

### Linux x86_64

- Release builds target AVX2+ for optimized SIMD performance, covering Intel Haswell (2013+) and AMD Excavator (2015+) processors, including all current AWS x86_64 instance families (C6/C7/C8).

## Building Custom Distributions

Custom distributions with specific feature combinations can be built:

```bash
# Build with specific features (replaces the default feature set)
SPICED_CUSTOM_FEATURES="duckdb,postgres,sqlite,models" make build

# Build with non-default features added to defaults
SPICED_NON_DEFAULT_FEATURES="odbc" make install
```

See the project [Makefile](https://github.com/spiceai/spiceai/blob/trunk/Makefile) for all available build targets and options.
