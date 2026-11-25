---
title: 'Spice.ai Embedding Models'
sidebar_label: 'Spice.ai'
sidebar_position: 9
description: 'Use embedding models served by the Spice.ai Cloud Platform or by another Spice runtime, such as the cluster an application sidecar reads from.'
tags:
  - embeddings
  - spiceai
---

The `spiceai` embedding source calls an embedding model served by the Spice.ai Cloud Platform, or by another Spice runtime, over the OpenAI-compatible [`/v1/embeddings`](../../api/HTTP/post-embeddings) API. An application [sidecar](../../deployment/architectures/cluster-sidecar) can use it to embed text with a model that runs on its cluster, so the sidecar loads no model of its own.

```yaml
embeddings:
  - from: spice.ai:openai/text-embedding-3-small
    name: cloud_embeddings
    params:
      spiceai_api_key: ${secrets:SPICEAI_API_KEY}
```

## Parameters

| Parameter          | Description                                                                                                                                         | Default                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `spiceai_api_key`  | The API key for the Spice.ai Cloud Platform, or for the Spice runtime serving the model. **Required** when the endpoint is the Spice.ai Cloud Platform. | -                         |
| `spiceai_endpoint` | The endpoint serving the model: the Spice.ai Cloud Platform, or another Spice runtime's HTTP endpoint.                                               | `https://data.spiceai.io` |

## `from` Format

The `from` field is the source prefix, `spice.ai` or `spiceai`, followed by a `:` or `/` separator and the model identifier. `spice.ai:openai/text-embedding-3-small`, `spice.ai/openai/text-embedding-3-small`, `spiceai:openai/text-embedding-3-small`, and `spiceai/openai/text-embedding-3-small` all resolve to the model identifier `openai/text-embedding-3-small`. A `from` that names only the prefix, such as `from: spice.ai:`, carries no model identifier and fails to load.

The model identifiers available depend on what the endpoint serves. Spice sends the identifier as the `model` field of each `/v1/embeddings` request.

## Use an Embedding Model on Another Spice Runtime

Set `spiceai_endpoint` to the HTTP endpoint of the Spice runtime that serves the model, and use the `name` of an embedding model in that runtime's Spicepod as the model identifier. The endpoint is the root of the deployment: Spice adds `/v1`, and uses an endpoint that already ends in `/v1` as-is.

For example, a cluster defines an embedding model named `minilm`:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: minilm
```

A sidecar embeds text with that model:

```yaml
embeddings:
  - from: spice.ai:minilm
    name: minilm
    params:
      spiceai_endpoint: http://spice-cluster:8090
```

An API key is optional for a Spice runtime that does not have [API key authentication](../../api/auth) enabled. The Spice.ai Cloud Platform always authenticates, so when `spiceai_endpoint` is unset or resolves to `https://data.spiceai.io`, an embedding model without `spiceai_api_key` fails to load with an error that begins ``Missing `spiceai_api_key`.``

For chat models served the same way, see [Spice Cloud Platform models](../models/spiceai.md).
