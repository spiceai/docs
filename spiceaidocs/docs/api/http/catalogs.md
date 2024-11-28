---
title: 'GET /v1/catalogs'
sidebar_label: 'GET /v1/catalogs'
description: 'Fetch catalogs'
sidebar_position: 5
---

The `GET /v1/catalogs` endpoint returns a list of configured catalogs.

Example request:

```bash
curl --request GET \
  --url http://localhost:8090/v1/catalogs
```

Response:

```json
[
  {
    "from": "spiceai",
    "name": "spiceai"
  }
]
```
