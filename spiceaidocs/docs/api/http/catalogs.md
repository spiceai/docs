---
title: 'GET /v1/catalogs'
sidebar_label: 'GET /v1/catalogs'
description: 'Fetch catalogs'
sidebar_position: 5
---

Returns the list of configured [catalogs](/components/catalogs)

Example:

```bash
curl --request GET \
  --url http://localhost:3000/v1/catalogs
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
