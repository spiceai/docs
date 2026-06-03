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
  -p 8090:8090 \
  -p 9090:9090 \
  -p 50051:50051 \
  -v "$(pwd)":/app \
  spiceai/spiceai:latest
```

Spice listens on three ports:

- `8090` — HTTP API and `/health` endpoint
- `9090` — Prometheus metrics (optional)
- `50051` — Arrow Flight (gRPC) for high-throughput query results

To use AI features (embeddings, models, search), substitute the `latest-models` tag:

```bash
docker run --rm -it -p 8090:8090 -p 50051:50051 \
  -v "$(pwd)":/app \
  spiceai/spiceai:latest-models
```

Browse all published tags at [hub.docker.com/r/spiceai/spiceai/tags](https://hub.docker.com/r/spiceai/spiceai/tags).

## Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) 20.10 or newer (or Docker Desktop).
- A `spicepod.yaml` file. See [Spicepods](https://spiceai.org/docs/getting-started/spicepods).
- Optional: [Docker Compose v2](https://docs.docker.com/compose/) for multi-container setups.

## Image Tags

| Tag                | Description                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `latest`           | Latest stable release. Excludes large model dependencies for a smaller image.                      |
| `latest-models`    | Latest stable release including AI features (embeddings, local model inference, vector search).    |
| `<version>`        | A specific stable release, e.g. `1.11.5`. Recommended for production for reproducible deployments. |
| `<version>-models` | A specific stable release with AI features included.                                               |

Pin to a specific version in production to avoid unexpected upgrades:

```bash
docker run -p 8090:8090 spiceai/spiceai:1.11.5
```

## Run with Docker Compose

`docker-compose.yaml`:

```yaml
services:
  spiced:
    image: spiceai/spiceai:latest
    container_name: spiced
    ports:
      - '8090:8090'
      - '9090:9090'
      - '50051:50051'
    volumes:
      - ./spicepod.yaml:/app/spicepod.yaml:ro
      - ./data:/app/data
    env_file:
      - .env
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:8090/health']
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped
```

Start the container:

```bash
docker compose up
```

## Build a Custom Image

For deployments that ship a Spicepod and data with the runtime, build a custom image that copies them in:

```dockerfile
# Use spiceai/spiceai:latest-models for AI features.
# See https://hub.docker.com/r/spiceai/spiceai/tags for all tags.
FROM spiceai/spiceai:1.11.5

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
docker run --rm -p 8090:8090 -p 50051:50051 my-spiceai-app
```

:::warning Do not bake secrets into images
Image layers are cached and distributed. Use `--env-file`, `docker run -e`, or a secret manager such as [Docker secrets](https://docs.docker.com/engine/swarm/secrets/), [HashiCorp Vault](https://www.vaultproject.io/), or [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) to inject credentials at runtime.
:::

## Environment Variables and Secrets

Spice loads secrets from environment variables prefixed with `SPICE_SECRET_`. See the [Environment Secret Store](../../components/secret-stores/env) for details.

Pass secrets at runtime with `--env-file` (preferred) or `-e`:

```bash
docker run --rm -p 8090:8090 \
  -v "$(pwd)/spicepod.yaml":/app/spicepod.yaml:ro \
  --env-file .env \
  -e SPICED_LOG=INFO \
  spiceai/spiceai:latest
```

Common runtime variables:

| Variable              | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `SPICED_LOG`          | Log level: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE`. Default `INFO`. |
| `SPICE_SECRET_<NAME>` | Inject a named secret referenced from a Spicepod.                     |

## Persistence

For workloads that use file-based acceleration (for example, DuckDB or SQLite), mount a host directory or named volume so data survives container restarts:

```bash
docker run --rm -p 8090:8090 \
  -v spice-data:/data \
  -v "$(pwd)/spicepod.yaml":/app/spicepod.yaml:ro \
  spiceai/spiceai:latest
```

In the Spicepod, configure the accelerator to write under the mount path, for example `duckdb_file: /data/taxi_trips.db`.

## Health Checks

Spice exposes `/health` (process up) and `/v1/ready` (components ready) on the HTTP port. Use these in container orchestrators or load balancers:

```bash
curl http://localhost:8090/health
curl http://localhost:8090/v1/ready
```

A Docker Compose healthcheck example is included in the [Run with Docker Compose](#run-with-docker-compose) section above.

## Cookbook

- [Running Spice.ai in Docker](https://github.com/spiceai/cookbook/tree/trunk/docker)
