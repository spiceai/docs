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

Building a custom Docker image based on v1.3.0 that installs additional dependencies will require using the `debian:bookworm-slim` base image and copying the `spiced` binary from the `spiceai/spiceai` image into the custom image. This approach can also be used to restore the previous behavior of including standard Linux tools like `bash`.

```dockerfile
FROM debian:bookworm-slim

# Copy the spiced binary from the spiceai/spiceai image into the custom image.
COPY --from=spiceai/spiceai:v1.3.0 /usr/local/bin/spiced /usr/local/bin/spiced

# Install any additional dependencies needed for the image.
RUN apt update && apt install -y --no-install-recommends <your-dependencies>

# Any other customizations needed for the image.

WORKDIR /app

ENTRYPOINT ["/usr/local/bin/spiced"]
```

This will restore the previous behavior of starting as the root user and including standard Linux tools, like `bash`.

#### Running as a non-root user

Spice recommends that custom Docker images based on Spice run as a non-root user. i.e.

```dockerfile
RUN addgroup -g 1001 -S sandboxgroup && adduser -u 1001 -S -G sandboxgroup sandbox
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
