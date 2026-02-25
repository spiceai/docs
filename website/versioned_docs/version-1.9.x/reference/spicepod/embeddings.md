---
title: 'Embeddings'
sidebar_label: 'Embeddings'
description: 'Embeddings YAML reference'
---

Embeddings convert text or other data into vector representations for machine learning and natural language processing tasks.

## `embeddings`

The `embeddings` section in your configuration specifies one or more embedding models for your datasets.

Example:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2:latest
    name: text_embedder
    params:
      max_length: '128'
    datasets:
      - my_text_dataset
```

### `from`

The `from` field specifies the source of the embedding model. It supports the following prefixes:

- `huggingface:huggingface.co` - Models from Hugging Face
- `file:` - Local file paths
- `openai` - OpenAI models

Follows the same convention as [`models.from`](./models.md#from).

### `name`

A unique identifier for this embedding component.

### `files`

Optional. A list of files associated with this model. Each file has:

- `path`: The path to the file
- `name`: Optional. A name for the file
- `type`: Optional. The type of the file (automatically determined if not specified)

Follows the same convention as [`models.files`](./models.md#files).

### `params`

Optional. A map of key-value pairs for additional parameters specific to the embedding model.

### `dependsOn`

Optional. A list of dependencies that must be loaded and available before this embedding model.
