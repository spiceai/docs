---
title: 'Docker Sandbox Guide - v1.3.0'
description: 'Migrating to v1.3.0'
sidebar_label: 'Sandbox Guide - v1.3.0'
sidebar_position: 1
tags:
  - deployment
  - docker
  - sandbox
---

## v1.3.0 Docker Sandbox

In the v1.3.0 release, the Docker image changed the sandbox from a script that ran at startup, to being baked into the Docker image itself. Prior to this, the Docker image would start up as a root user, and then set up a sandbox user with restricted permissions before starting the Spice runtime in that restricted context.

Additionally, the Docker image includes no standard Linux tools like `bash`.

Starting with v1.3.0, the sandboxing logic is baked directly into the final Docker image, and the Docker image starts up as the sandbox user.

For most users, this change will be transparent. However, there are a few cases where an action is required to update.

### Building a custom Docker image based on v1.3.0

Since v1.3.0, a custom Docker image that installs additional dependencies requires copying the `spiced` binary from the `spiceai/spiceai` image into an image whose glibc is 2.39 or later, such as `debian:trixie-slim`, the base of the `spiceai/spiceai` image. Debian 12 (`bookworm`) ships an older glibc and cannot run it. See [System Requirements](../../reference/system_requirements.md#linux-distribution-support). This approach can also be used to restore the previous behavior of including standard Linux tools like `bash`.

```dockerfile
FROM debian:trixie-slim

# Copy the spiced binary, and the PDFium library it loads to parse PDF documents,
# from the spiceai/spiceai image into the custom image.
COPY --from=spiceai/spiceai:2.4.2 /usr/local/bin/spiced /usr/local/bin/spiced
COPY --from=spiceai/spiceai:2.4.2 /usr/local/bin/libpdfium.so /usr/local/bin/libpdfium.so

# Install the packages the spiceai/spiceai image includes (TLS root certificates,
# OpenSSL, and time zone data), and any additional dependencies needed for the image.
RUN apt update && apt install -y --no-install-recommends ca-certificates libssl3 tzdata <your-dependencies>

# Any other customizations needed for the image.

WORKDIR /app

ENTRYPOINT ["/usr/local/bin/spiced"]
```

This will restore the previous behavior of starting as the root user and including standard Linux tools, like `bash`.

#### Running as a non-root user

Spice recommends that custom Docker images based on Spice run as a non-root user. i.e.

```dockerfile
RUN groupadd --system --gid 1001 sandboxgroup && useradd --system --uid 1001 --gid sandboxgroup --home-dir /app sandbox
# Spice writes file-mode accelerations under the working directory (/app/.spice/data by default),
# and caches downloaded models under $HOME.
RUN mkdir -p /app/.spice && chown -R sandbox:sandboxgroup /app
ENV HOME=/app
USER sandbox
```

This may require additional configuration of mounted volumes to ensure that the sandbox user has access to the necessary files. i.e. in Kubernetes, this requires adding a `securityContext` to the pod spec.

```yaml
securityContext:
  runAsUser: 1001
  runAsGroup: 1001
  # Tells Kubernetes to set the group of the files in the volume to sandboxgroup, 
  # which allows the sandbox user to access the files.
  fsGroup: 1001
```

:::note

The `fsGroup` directive does not work for all Kubernetes storage types. For example, it does not work for `hostPath` volumes. In this case, an init container can be used to set the group of the files in the volume.

:::

### Custom Kubernetes deployments

Kubernetes deployments that do not use the v1.3.0 Helm chart will need to add the following `securityContext` to their pod spec:

```yaml
securityContext:
  runAsUser: 65534
  runAsGroup: 65534
  fsGroup: 65534
```

### Debugging sandbox container

To debug issues with the sandbox container, see the [Debugging Sandbox Container](../../troubleshooting#debugging-sandbox-container) section of the troubleshooting guide.
