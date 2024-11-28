---
title: 'POST /v1/datasets/<name>/acceleration/refresh'
sidebar_label: 'POST /v1/datasets/<name>/acceleration/refresh'
description: ''
sidebar_position: 3
pagination_prev: null
pagination_next: null
---

Performs an on-demand refresh for an accelerated dataset. On-demand refresh applies only to `full` and `append` refresh modes (not `changes`).

Request Body:

- `refresh_sql` (String, Optional): Refresh SQL to use, see [Refresh SQL docs](/components/data-accelerators/data-refresh.md#refresh-sql). Defaults to the `refresh_sql` specified in the spicepod.
- `refresh_mode` (String, Optional): Refresh mode to use, see [Refresh Modes docs](/components/data-accelerators/data-refresh.md#refresh-modes). Defaults to `refresh_mode` specified in the spicepod.

Example:

```bash
curl -i -XPOST 127.0.0.1:8090/v1/datasets/taxi_trips/acceleration/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_sql": "SELECT * FROM taxi_trips WHERE tip_amount > 10.0",
    "refresh_mode": "full"
  }'
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
