---
title: 'GET /v1/datasets'
sidebar_label: 'GET /v1/datasets'
description: 'Fetch datasets'
sidebar_position: 2
---

The `GET /v1/datasets` endpoint returns a list of configured datasets.

Example request:

```bash
curl --request GET \
  --url http://localhost:8090/v1/datasets
```

Response:

```json
[
  {
    "from": "postgres:syncs",
    "name": "daily_journal_accelerated",
    "replication_enabled": false,
    "acceleration_enabled": true
  },
  {
    "from": "databricks:hive_metastore.default.messages",
    "name": "messages_accelerated",
    "replication_enabled": false,
    "acceleration_enabled": true
  },
  {
    "from": "postgres:aidemo_messages",
    "name": "general",
    "replication_enabled": false,
    "acceleration_enabled": false
  }
]
```
