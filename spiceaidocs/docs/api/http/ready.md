---
title: 'GET /v1/ready'
sidebar_label: 'GET /v1/ready'
sidebar_position: 1
description: 'HTTP Readiness API'
---

Spice indicates when all datasets have finished loading and is ready to accept queries by returning a 200 status code on the `/v1/ready` endpoint. Before this endpoint returns a 200 status code, queries may return an error. The behavior for when an accelerated dataset is considered ready is configurable via the `ready_state` parameter, see [Data Refresh](/components/data-accelerators/data-refresh#ready-state) for more details.

Example request:

```shell
curl -i "127.0.0.1:8090/v1/ready"
```

Ready response:

```bash
HTTP/1.1 200 OK
content-type: text/plain; charset=utf-8
content-length: 5
date: Sat, 02 Nov 2024 07:37:14 GMT

Ready
```

Not ready response:

```bash
HTTP/1.1 503 Service Unavailable
content-type: text/plain; charset=utf-8
content-length: 9
date: Sat, 02 Nov 2024 07:44:55 GMT

Not Ready
```

## Readiness Probe

In production deployments, the `/v1/ready` endpoint can be used as a [readiness probe](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/#readiness-probe) for a Spice deployment to ensure traffic is routed to the Spice runtime only after all datasets have finished loading.

Example Kubernetes readiness probe:

```yaml
readinessProbe:
  httpGet:
    path: /v1/ready
    port: 8090
```
