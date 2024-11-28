---
title: 'POST /v1/embeddings'
sidebar_label: 'POST /v1/embeddings'
description: ''
sidebar_position: 7
---

The `POST /v1/embeddings` endpoint is an OpenAI compatible endpoint for generating embeddings.

Specify the embedding model by providing the component name in the `model` key. For example:

```shell
curl http://localhost:8090/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "input": "The food was delicious and the waiter...",
    "model": "text-embedding-ada-002",
    "encoding_format": "float"
  }'
```
