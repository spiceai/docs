---
title: 'Hugging Face Rerankers'
sidebar_label: 'Hugging Face'
description: 'Download a cross-encoder reranker from the Hugging Face Hub and run it locally in Spice.'
sidebar_position: 5
tags:
  - rerankers
  - search
  - huggingface
---

To run a cross-encoder reranker locally, in the Spice process, set the `from` field to a Hugging Face Hub repository with the `huggingface:` prefix. Spice downloads the model files from the Hub at startup, then scores documents locally. Spice does not send documents to an external service.

```yaml
rerankers:
  - from: huggingface:huggingface.co/BAAI/bge-reranker-base
    name: local_rr
```

To load a model from a local directory instead, see [File](./file.md).

## Configuration

### `from`

The `from` field has the format `huggingface:huggingface.co/<org>/<model>[:<revision>]`:

- `huggingface.co/` is optional. `huggingface:BAAI/bge-reranker-base` is the same model.
- `hf:` is a short form of `huggingface:`, and `/` can replace `:` after the prefix, for example `hf/BAAI/bge-reranker-base`.
- `:<revision>` is optional. It pins a branch, tag, or commit, for example `huggingface:huggingface.co/BAAI/bge-reranker-base:main`. When not set, Spice uses `main`.

The repository must contain a cross-encoder model for sequence classification, with `config.json`, `tokenizer.json`, and the weights. For example: `BAAI/bge-reranker-base`, `Alibaba-NLP/gte-reranker-modernbert-base`, `cross-encoder/ms-marco-MiniLM-L-6-v2`. Spice loads `model.safetensors` (or sharded safetensors with `model.safetensors.index.json`). When the repository has no safetensors weights, Spice loads `pytorch_model.bin`, which is significantly slower, and logs a warning.

### `name`

A unique name for the reranker. Use this name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank).

### `params`

All parameters are optional.

| Parameter        | Description                                                                                                                                                                                                                                 | Default                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `hf_token`       | The Hugging Face access token, for private or gated repositories. Also accepted as `api_key`. See [access tokens](../models/huggingface/index.md#access-tokens).                                                                            | See [access tokens](../models/huggingface/index.md#access-tokens) |
| `hf_endpoint`    | The Hugging Face Hub endpoint to download from, to read through a mirror or proxy of the Hub. See [endpoint](../models/huggingface/index.md#endpoint).                                                                                      | `HF_ENDPOINT`, then `https://huggingface.co`                      |
| `max_seq_length` | The maximum number of tokens for one `(query, document)` pair.                                                                                                                                                                              | The model's own maximum                                           |
| `truncate`       | What to do with a pair that has more tokens than the maximum: `none` fails the query with an input-validation error, `end` removes tokens from the end of the pair, `start` removes tokens from the start. The value is not case-sensitive. | `none`                                                            |

Hugging Face rerankers use the same [token, endpoint, cache, and offline settings](../models/huggingface/index.md#hugging-face-hub) as other Hugging Face models.

## Sequence Length and Truncation

A cross-encoder scores the query and one document together, as one sequence of tokens. When this sequence has more tokens than the maximum and `truncate` is `none`, the whole `rerank()` query fails. For example, with `max_seq_length: 16`:

```text
Reranker model 'local_rr' failed: Input validation error: `inputs` must have less than 16 tokens. Given: 17
```

To score documents that are longer than the maximum, set `truncate: end` or `truncate: start`. Spice then removes tokens from the pair until it fits, and scores the remaining tokens:

```yaml
rerankers:
  - from: huggingface:huggingface.co/BAAI/bge-reranker-base
    name: local_rr
    params:
      truncate: end
```

## Usage

```sql
SELECT * FROM rerank(
  vector_search(docs, 'delta lake time travel', limit => 50),
  document => 'content',
  model    => 'local_rr',
  limit    => 10
);
```

The `rerank_score` column contains the score that the model gives each document.

Spice downloads and loads the model at startup, before it loads datasets. A large model can make startup slower. When the download fails, the reranker does not load. See [Loading and Readiness](./index.md#loading-and-readiness).

Local rerankers require the `models` feature, which the default `spiced` build includes.
