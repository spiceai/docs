---
title: 'POST /v1/datasets/<name>/acceleration/refresh'
sidebar_label: 'POST /v1/datasets/<name>/acceleration/refresh'
description: ''
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Performs an on-demand refresh for an accelerated dataset. On-demand refresh applies only to `full` and `append` refresh modes (not `changes`).

Example:

```bash
curl -i -XPOST 127.0.0.1:8090/v1/datasets/taxi_trips/acceleration/refresh
```

Response:

```console
HTTP/1.1 201 Created
content-type: application/json
content-length: 55
date: Thu, 11 Apr 2024 20:11:18 GMT

{"message":"Dataset refresh triggered for taxi_trips."}
```

:::warning[Note]
On-demand refresh always initiates a new refresh, terminating any in-progress refresh for the dataset.
:::
