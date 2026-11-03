---
title: 'File Rerankers'
sidebar_label: 'File'
description: 'Load a cross-encoder reranker from a local directory and run it in Spice.'
sidebar_position: 6
tags:
  - rerankers
  - search
---

To run a cross-encoder reranker from model files on the local filesystem, set the `from` field to the directory with the `file:` prefix. Spice loads the model at startup and scores documents in the Spice process. Spice does not download files or send documents to an external service. Use this provider for air-gapped deployments, or for a model that you trained or changed.

```yaml
rerankers:
  - from: file:/models/bge-reranker-base
    name: dir_rr
```

## Configuration

### `from`

The `from` field has the format `file:<path>`, where `<path>` is a directory. The directory must contain:

| File             | Description                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `config.json`    | The model configuration.                                                                                               |
| `tokenizer.json` | The tokenizer.                                                                                                         |
| Weights          | `model.safetensors`, sharded safetensors with `model.safetensors.index.json`, or `pytorch_model.bin` (slower to load). |

The files of a Hugging Face Hub repository for a cross-encoder model have this layout. For example, a snapshot directory in the Hugging Face cache works as a `file:` reranker.

### `name`

A unique name for the reranker. Use this name as the `model` argument of [`rerank()`](../../reference/sql/search.md#reranking-rerank).

### `params`

All parameters are optional.

| Parameter        | Description                                                                                                                                                                                                                                 | Default                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `max_seq_length` | The maximum number of tokens for one `(query, document)` pair.                                                                                                                                                                              | The model's own maximum |
| `truncate`       | What to do with a pair that has more tokens than the maximum: `none` fails the query with an input-validation error, `end` removes tokens from the end of the pair, `start` removes tokens from the start. The value is not case-sensitive. | `none`                  |

For more about these parameters, see [Sequence Length and Truncation](./huggingface.md#sequence-length-and-truncation).

## Usage

```sql
SELECT * FROM rerank(
  text_search(docs, 'connection timeout', limit => 50),
  document => 'content',
  model    => 'dir_rr',
  limit    => 10
);
```

When the directory or a required file does not exist, the reranker does not load, and Spice logs an error such as `Failed to load local reranker model 'dir_rr': ... No such file or directory`. See [Loading and Readiness](./index.md#loading-and-readiness).

Local rerankers require the `models` feature, which the default `spiced` build includes.
