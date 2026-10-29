---
title: 'Docker'
description: 'Run Spice.ai as a Docker container.'
sidebar_label: 'Docker'
sidebar_position: 4
tags:
  - deployment
  - docker
  - spiceai
---

This guide describes how to run Spice.ai as a Docker container, either directly with `docker run`, with Docker Compose, or by building a custom image that bundles a Spicepod and data files. For Kubernetes deployments, see the [Kubernetes deployment guide](../kubernetes/index.md).

## Quickstart

Run the latest Spice.ai image with a local Spicepod mounted into the container:

```bash
docker run --rm -it \
  -p 127.0.0.1:8090:8090 \
  -p 127.0.0.1:9090:9090 \
  -p 127.0.0.1:50051:50051 \
  -v "$(pwd)":/app \
  spiceai/spiceai:latest \
  --http 0.0.0.0:8090 --metrics 0.0.0.0:9090 --flight 0.0.0.0:50051
```

The arguments after the image name are passed to `spiced`. Without them, `spiced` listens only on `127.0.0.1` inside the container, and the published ports cannot reach it.

The examples on this page publish the ports on the host's `127.0.0.1` only. On Docker Engine versions before 28.0.0, [hosts on the same local network can still reach ports published on `127.0.0.1`](https://docs.docker.com/engine/network/port-publishing/), so on those versions also configure API key authentication or a host firewall. To accept connections from other machines, publish them on all interfaces (for example, `-p 8090:8090`) and require [API key authentication](../../api/auth/index.md), because a runtime without it serves every client that can reach the port.

Spice listens on three ports:

- `8090` — HTTP API and `/health` endpoint
- `9090` — Prometheus metrics (optional)
- `50051` — Arrow Flight (gRPC) for high-throughput query results

As of Spice v2.0, AI features (embeddings, local model inference, search) are included in the default image — no separate tag is required. The data-only image, without AI/ML dependencies, is published only in nightly builds for open source and is available as a production-ready distribution through [Spice Cloud and Spice.ai Enterprise](https://spice.ai/pricing).

Browse all published tags at [hub.docker.com/r/spiceai/spiceai/tags](https://hub.docker.com/r/spiceai/spiceai/tags).

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) 20.10 or newer (or Docker Desktop).
- A `spicepod.yaml` file. See [Spicepods](https://spiceai.org/docs/getting-started/spicepods).
- Optional: [Docker Compose v2](https://docs.docker.com/compose/) for multi-container setups.

## Image Tags

| Tag         | Description                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `latest`    | Latest stable release. Includes AI features (embeddings, local model inference, vector search) by default.                 |
| `<version>` | A specific stable release, e.g. `2.0.0`. Recommended for production for reproducible deployments.                          |

:::note
The `-models` image tags were removed in Spice v2.0 — AI/ML support is now part of the default image. The data-only image (without AI/ML dependencies) is published only in nightly builds for open source.
:::

Pin to a specific version in production to avoid unexpected upgrades:

```bash
docker run -p 127.0.0.1:8090:8090 spiceai/spiceai:2.4.0 --http 0.0.0.0:8090
```

## Run with Docker Compose

`docker-compose.yaml`:

```yaml
services:
  spiced:
    image: spiceai/spiceai:latest
    container_name: spiced
    ports:
      - '127.0.0.1:8090:8090'
      - '127.0.0.1:9090:9090'
      - '127.0.0.1:50051:50051'
    volumes:
      - ./spicepod.yaml:/app/spicepod.yaml:ro
      - ./data:/app/data
    env_file:
      - .env
    command: ['--http', '0.0.0.0:8090', '--metrics', '0.0.0.0:9090', '--flight', '0.0.0.0:50051']
    restart: unless-stopped
```

Start the container:

```bash
docker compose up
```

## Build a Custom Image

For deployments that ship a Spicepod and data with the runtime, build a custom image that copies them in:

```dockerfile
# AI features are included in the default image as of Spice v2.0.
# See https://hub.docker.com/r/spiceai/spiceai/tags for all tags.
FROM spiceai/spiceai:2.4.0

WORKDIR /app

# Spicepod definition
COPY spicepod.yaml ./

# Optional: bundled data files
COPY data ./data

# Optional: environment files (.env, .env.local). Avoid baking secrets
# into images — prefer runtime --env-file or a secret manager.
COPY .env* ./

# --metrics is optional; omit if Prometheus metrics are not needed.
CMD ["--http", "0.0.0.0:8090", "--metrics", "0.0.0.0:9090", "--flight", "0.0.0.0:50051"]

EXPOSE 8090 9090 50051
```

Build and run:

```bash
docker build -t my-spiceai-app .
docker run --rm -p 127.0.0.1:8090:8090 -p 127.0.0.1:50051:50051 my-spiceai-app
```

:::warning Do not bake secrets into images
Image layers are cached and distributed. Use `--env-file`, `docker run -e`, or a secret manager such as [Docker secrets](https://docs.docker.com/engine/swarm/secrets/), [HashiCorp Vault](https://www.vaultproject.io/), or [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) to inject credentials at runtime.
:::

## Environment Variables and Secrets

The [environment secret store](../components/secret-stores/env) resolves `${secrets:<key>}` from the environment variable `SPICE_<key>` or `<key>`, trying the key as written and then in uppercase. For example, `${secrets:pg_pass}` reads `SPICE_PG_PASS` or `PG_PASS`.

Pass secrets at runtime with `--env-file` (preferred) or `-e`:

```bash
docker run --rm -p 127.0.0.1:8090:8090 \
  -v "$(pwd)/spicepod.yaml":/app/spicepod.yaml:ro \
  --env-file .env \
  -e SPICED_LOG=INFO \
  spiceai/spiceai:latest \
  --http 0.0.0.0:8090
```

Common runtime variables:

| Variable              | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `SPICED_LOG`          | Log level: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`. Default `INFO`. |
| `SPICE_<NAME>`        | A secret referenced from a Spicepod as `${secrets:<name>}`.             |
| `TMPDIR`              | Temporary directory. The image sets it to `/app/tmp`; see [Temporary files](#temporary-files). |

## Persistence

For workloads that use file-based acceleration (for example, DuckDB or SQLite), mount a host directory or named volume so data survives container restarts:

```bash
docker run --rm -p 127.0.0.1:8090:8090 \
  -v spice-data:/data \
  -v "$(pwd)/spicepod.yaml":/app/spicepod.yaml:ro \
  spiceai/spiceai:latest \
  --http 0.0.0.0:8090
```

In the Spicepod, configure the accelerator to write under the mount path, for example `duckdb_file: /data/taxi_trips.db`.

## Temporary files

The published images are built `FROM scratch` and contain only the files the runtime needs — there is no `/tmp`. The image therefore ships `TMPDIR=/app/tmp` and creates that directory owned by the `nobody` (`65534`) user it runs as, so anything resolving the OS temporary directory has somewhere to write. Acceleration snapshots stage their tar archive there before uploading, and it is also the default target for query spill when [`runtime.query.temp_directory`](../reference/spicepod/runtime#runtimequerytemp_directory) is unset.

`/app/tmp` lives on the container's writable layer, which is usually small and is discarded when the container is removed. For workloads that snapshot large accelerations or spill large sorts and joins, give the temporary directory a volume of its own:

```bash
docker run --rm -p 127.0.0.1:8090:8090 \
  -v spice-tmp:/tmp-volume \
  -e TMPDIR=/tmp-volume \
  -v "$(pwd)/spicepod.yaml":/app/spicepod.yaml:ro \
  spiceai/spiceai:latest \
  --http 0.0.0.0:8090
```

Setting `runtime.query.temp_directory` in the Spicepod covers query spill specifically; `TMPDIR` covers everything else that asks the operating system for a temporary path.

## Health Checks

Spice exposes `/health` (process up) and `/v1/ready` (components ready) on the HTTP port. Use these in container orchestrators or load balancers:

```bash
curl http://localhost:8090/health
curl http://localhost:8090/v1/ready
```

The `spiceai/spiceai` image contains only `spiced` and its libraries, with no shell, `curl`, or `wget`, so a Docker or Docker Compose `healthcheck` that runs a command inside the container cannot work. Probe these endpoints over HTTP from outside the container instead, for example with a Kubernetes `httpGet` probe or a load balancer health check.

## Cookbook

- [Running Spice.ai in Docker](https://github.com/spiceai/cookbook/tree/trunk/docker)
