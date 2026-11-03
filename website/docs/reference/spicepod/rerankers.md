---
title: 'Rerankers'
sidebar_label: 'Rerankers'
description: 'Rerankers YAML reference'
---

The `rerankers` section of a Spicepod defines reranker models. A reranker scores candidate documents against a query, and the [`rerank()`](../sql/search.md#reranking-rerank) SQL table function uses these scores to reorder search results. Rerankers can be hosted APIs (Cohere, Voyage AI, Jina AI), an HTTP endpoint, or cross-encoder models that run locally. For the provider pages, see [Reranker Models](../../components/rerankers/index.md).

| Field         | Required | Description                                                       |
| ------------- | -------- | ----------------------------------------------------------------- |
| `name`        | Yes      | Unique name for the reranker. The `model` argument of `rerank()`. |
| `from`        | Yes      | The provider prefix and the model ID or location.                 |
| `description` | No       | Additional details about the reranker.                            |
| `params`      | No       | Parameters for the provider, for example the API key.             |
| `dependsOn`   | No       | Components that must load before this reranker.                   |

A reranker has no `files` or `datasets` field. A Spicepod with an unknown field fails to load, for example: `Unknown field datasets. Expected one of from, name, description, params, dependsOn, metrics`.

## `rerankers`

The `rerankers` section in the Spicepod specifies one or more rerankers.

Example:

```yaml
rerankers:
  - from: cohere:rerank-v3.5
    name: cohere_rr
    description: Reranks support articles
    params:
      api_key: ${secrets:COHERE_API_KEY}

  - from: huggingface:huggingface.co/BAAI/bge-reranker-base
    name: local_rr
    params:
      truncate: end
```

```sql
SELECT * FROM rerank(
  vector_search(docs, 'delta lake time travel', limit => 50),
  document => 'content',
  model    => 'cohere_rr',
  limit    => 10
);
```

A reranker can also be in a separate file. `ref` is a directory relative to the Spicepod, which contains a `rerankers.yaml` (or `rerankers.yml`) file with one reranker:

```yaml
rerankers:
  - ref: rerankers/cohere_rr
```

```yaml
# rerankers/cohere_rr/rerankers.yaml
from: cohere:rerank-v3.5
name: cohere_rr
params:
  api_key: ${secrets:COHERE_API_KEY}
```

A chat model or a decision model from the [`models`](./models.md) section can also rerank, with no entry in `rerankers`. See [LLM and Decision Model Rerankers](../../components/rerankers/llm.md).

### `from`

The `from` field specifies the provider of the reranker, and the model ID or location of the model for that provider:

```yaml
- from: <provider>:<model_id>
```

#### Provider

The prefix of the `from` field selects the provider. `/` can replace `:` after the provider name, for example `cohere/rerank-v3.5`.

| Prefix                    | Provider                                                  | Runs              |
| ------------------------- | --------------------------------------------------------- | ----------------- |
| `cohere:`                 | [Cohere](../../components/rerankers/cohere.md)            | Hosted API        |
| `voyage:`                 | [Voyage AI](../../components/rerankers/voyage.md)         | Hosted API        |
| `jina:`                   | [Jina AI](../../components/rerankers/jina.md)             | Hosted API        |
| `http://`, `https://`     | [HTTP](../../components/rerankers/http.md)                | Any HTTP endpoint |
| `huggingface:` (or `hf:`) | [Hugging Face](../../components/rerankers/huggingface.md) | Local, in-process |
| `file:`                   | [File](../../components/rerankers/file.md)                | Local, in-process |

A `from` value with a different prefix does not load, and Spice logs an error such as `Unknown reranker source in from: openai:gpt-4o`.

#### Model ID

The part of the `from` field after the prefix identifies the model:

- For Cohere, Voyage AI, and Jina AI: the provider's model ID, which Spice sends as the `model` field of each request.
  - `cohere:rerank-v3.5`
  - `voyage:rerank-2`
  - `jina:jina-reranker-v2-base-multilingual`
- For HTTP: the full URL of the rerank endpoint. Spice sends a `POST` request to this URL and does not add a path to it.
  - `https://rerank.internal/v1/rerank`
- For Hugging Face: a repository ID and, optionally, a revision (branch, tag, or commit). `huggingface.co/` is optional.
  - `huggingface:huggingface.co/BAAI/bge-reranker-base` (no revision, uses `main`)
  - `huggingface:huggingface.co/BAAI/bge-reranker-base:main` (with revision)
- For local files: the path of a directory that contains `config.json`, `tokenizer.json`, and the model weights.
  - `file:/models/bge-reranker-base`

### `name`

Required. A unique name for the reranker. Use this name as the `model` argument of `rerank()`. When two rerankers have the same name, the Spicepod fails to load: `Unable to load duplicate spicepod reranker component '<name>'`.

### `description`

Optional. Additional details about the reranker.

### `params`

Optional. A map of parameters for the provider. Values can use [secrets](../../components/secret-stores/index.md), for example `${secrets:COHERE_API_KEY}`. Spice ignores a parameter that the provider does not support and logs a warning, which suggests the closest supported parameter: `Ignoring parameter api_kye: not supported for reranker a. Did you mean api_key?`

| Parameter        | Providers                  | Description                                                                                                                               |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `api_key`        | Cohere, Voyage AI, Jina AI | Required. The API key, sent as `Authorization: Bearer <api_key>`. Also accepted as `cohere_api_key`, `voyage_api_key`, or `jina_api_key`. |
| `api_key`        | HTTP                       | Optional. A token sent as `Authorization: Bearer <api_key>`.                                                                              |
| `endpoint`       | Cohere, Voyage AI, Jina AI | Optional. The full URL of the rerank endpoint, to replace the provider's default URL.                                                     |
| `model`          | HTTP                       | Optional. A model ID sent as the `model` field of the request.                                                                            |
| `hf_token`       | Hugging Face               | Optional. The Hugging Face access token, for private or gated repositories. Also accepted as `api_key`.                                   |
| `hf_endpoint`    | Hugging Face               | Optional. The Hugging Face Hub endpoint, to download through a mirror or proxy of the Hub.                                                |
| `max_seq_length` | Hugging Face, File         | Optional. The maximum number of tokens for one `(query, document)` pair. Defaults to the model's own maximum.                             |
| `truncate`       | Hugging Face, File         | Optional. `none` (default), `end`, or `start`: what to do with a pair that has more tokens than the maximum.                              |

For defaults and more detail, see the page for each provider.

### `dependsOn`

Optional. A list of components that must load before this reranker.

## Loading

Spice loads rerankers at startup, before datasets, and sends one test request to each reranker. A reranker that fails to load is not retried, and a change to the `rerankers` section does not reload rerankers. Restart the runtime after you correct the configuration. See [Loading and Readiness](../../components/rerankers/index.md#loading-and-readiness).
