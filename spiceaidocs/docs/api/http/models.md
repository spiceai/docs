---
title: 'GET /v1/models'
sidebar_label: 'GET /v1/models'
description: 'Fetch AI/ML models'
sidebar_position: 5
---

Returns all [models](/components/models/index.md) known by the runtime.

Parameters:

- `format`: The response payload format `'json'` or `'csv'`. Default `'json'`.

Response:

Returns the list of models and their properties. Example:

```json
[
  {
    "name": "rf_forecast",
    "from": "file://usr/me/model.onnx",
    "datasets": ["input_times"]
  },
  {
    "name": "my_language_model",
    "from": "openai:gpt-3.5-turbo",
    "datasets": []
  }
]
```
