---
title: 'Docker - Kubernetes'
description: 'Running Spice.ai as Docker container'
sidebar_label: 'Docker'
sidebar_position: 3
tags:
  - deployment
  - docker
  - kubernetes
  - spiceai
---

## Running Spice.ai as a Docker Container

For information on using Helm deployment, refer to the [Deploy Spice.ai in Kubernetes using Helm](./kubernetes) section.

Use the [`spiceai/spiceai` Docker image](https://hub.docker.com/r/spiceai/spiceai/tags) to run Spice.ai as a Docker container:

```yaml
# To use AI features including embeddings, models, and search use the spiceai/spiceai:latest-models tag. See supported tags at https://hub.docker.com/r/spiceai/spiceai/tags
FROM spiceai/spiceai:latest

# Copy the Spicepod configuration file
COPY spicepod.yaml /app/spicepod.yaml

# Copy your local data
COPY data /app/data

# Copy the .env.local & .env files
COPY .env* /app/

# Spice runtime start-up arguments
CMD ["--http","0.0.0.0:8090","--metrics", "0.0.0.0:9090","--flight","0.0.0.0:50051"]

EXPOSE 8090
EXPOSE 9090
EXPOSE 50051

# Start the Spicepod
```

Example Docker Compose configuration to build and start the container:

```yaml
services:
  spiced:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: spiced-container
    ports:
      - '50051:50051'
      - '8090:8090'
      - '9090:9090'
```

```bash
docker-compose up --build
```

```bash
[+] Building 0.4s (10/10) FINISHED                                                                                                                         docker:desktop-linux
 => [spiced internal] load build definition from Dockerfile                                                                                                                0.0s
 => => transferring dockerfile: 470B                                                                                                                                       0.0s
 => [spiced internal] load metadata for docker.io/spiceai/spiceai:latest                                                                                                   0.3s
 => [spiced internal] load .dockerignore                                                                                                                                   0.0s
 => => transferring context: 2B                                                                                                                                            0.0s
 => [spiced 1/4] FROM docker.io/spiceai/spiceai:latest@sha256:96bedafa678343e8acb977001ddbde335d8d66476c2ed891f9b7873d277f2b84                                             0.0s
 => [spiced internal] load build context                                                                                                                                   0.0s
 => => transferring context: 262B                                                                                                                                          0.0s
 => CACHED [spiced 2/4] COPY spicepod.yaml /app/spicepod.yaml                                                                                                              0.0s
 => CACHED [spiced 3/4] COPY data /app/data                                                                                                                                0.0s
 => CACHED [spiced 4/4] COPY .env* /app/                                                                                                                                   0.0s
 => [spiced] exporting to image                                                                                                                                            0.0s
 => => exporting layers                                                                                                                                                    0.0s
 => => writing image sha256:7f753171835316954b7072ba9b59c388c6295d3cfc677bc2de1271ba85a1f040                                                                               0.0s
 => => naming to docker.io/library/accounts-spiced                                                                                                                         0.0s
 => [spiced] resolving provenance for metadata file                                                                                                                        0.0s
[+] Running 1/0
 ✔ Container spiced-container  Recreated                                                                                                                                   0.0s
Attaching to spiced-container
spiced-container  | 2024-12-19T00:43:13.844091Z  INFO runtime::init::dataset: No datasets were configured. If this is unexpected, check the Spicepod configuration.
spiced-container  | 2024-12-19T00:43:13.844615Z  INFO runtime::opentelemetry: Spice Runtime OpenTelemetry listening on 127.0.0.1:50052
spiced-container  | 2024-12-19T00:43:13.844750Z  INFO runtime::metrics_server: Spice Runtime Metrics listening on 0.0.0.0:9090
spiced-container  | 2024-12-19T00:43:13.844778Z  INFO runtime::flight: Spice Runtime Flight listening on 0.0.0.0:50051
spiced-container  | 2024-12-19T00:43:13.844882Z  INFO runtime::http: Spice Runtime HTTP listening on 0.0.0.0:8090
spiced-container  | 2024-12-19T00:43:13.844899Z  INFO runtime::init::results_cache: Initialized results cache; max size: 128.00 MiB, item ttl: 5s
```
