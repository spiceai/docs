---
title: 'Spice Cloud Platform'
description: 'Instructions for using language models served by the Spice.ai Cloud Platform with Spice.'
sidebar_label: 'Spice Cloud Platform'
sidebar_position: 6
---

To use a large language model served by the Spice.ai Cloud Platform AI gateway — or by another Spice runtime — specify the `spice.ai` path in the `from` field and the associated `spiceai_api_key` parameter.

| Param              | Description                                                                                                                                            | Default                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| `spiceai_api_key`  | The API key for the Spice.ai Cloud Platform, or for the Spice runtime serving the model. **Required** when the endpoint is the Spice.ai Cloud Platform. | -                          |
| `spiceai_endpoint` | The endpoint serving the model: the Spice.ai Cloud Platform, or another Spice runtime.                                                                  | `https://data.spiceai.io`  |

Example:

```yaml
models:
  - from: spice.ai:openai/gpt-4o
    name: cloud_llm
    params:
      spiceai_api_key: ${secrets:SPICEAI_API_KEY}
```

## `from` Format

The `from` field is the source prefix — `spice.ai` or `spiceai` — followed by a `:` or `/` separator and the model identifier:

- `spice.ai:openai/gpt-4o`
- `spice.ai/openai/gpt-4o`
- `spiceai:openai/gpt-4o`
- `spiceai/openai/gpt-4o`

All four forms resolve to the same model identifier, `openai/gpt-4o`. Both spellings of the prefix are accepted so that a `from` reads the same whether it names a model or a [dataset](../data-connectors/spiceai/index.md).

Model identifiers take the form `<provider>/<model>` (for example `openai/gpt-4o` or `anthropic/claude-3-5-sonnet`); the identifiers available depend on what the endpoint serves. A `from` that names only the prefix (e.g. `from: spice.ai` or `from: spice.ai:`) carries no model identifier and fails to load.

## Connecting to Another Spice Runtime

Because the model is reached over an OpenAI-compatible HTTP API, `spiceai_endpoint` can point at another Spice runtime instead of the Cloud Platform. The endpoint is the root of the deployment — the OpenAI-compatible API is served under `/v1`, and an endpoint that already names `/v1` is used as-is.

```yaml
models:
  - from: spice.ai:openai/gpt-4o
    name: upstream_llm
    params:
      spiceai_endpoint: http://localhost:8090
```

An API key is optional for a self-hosted Spice runtime, which may not have authentication enabled. The Spice.ai Cloud Platform always authenticates, so omitting `spiceai_api_key` when the endpoint resolves to the Cloud Platform is rejected at load time.

:::note

The `spice.ai` model source serves large language models only. Support for loading and serving traditional machine learning (ONNX) models was removed in vNext — see [Machine Learning Models](../../features/machine-learning-models).

:::
