---
title: 'Embeddings'
sidebar_label: 'Embeddings'
description: 'Embeddings YAML reference'
---

# Embeddings

Embeddings allow you to convert text or other data into vector representations, which can be used for various machine learning and natural language processing tasks.

## `embeddings`

The `embeddings` section in your configuration allows you to specify one or more embedding models to be used with your datasets.

Example:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2:latest
    name: text_embedder
    params:
      max_length: "128"
    datasets:
      - my_text_dataset
```

### `from`

The `from` field specifies the source of the embedding model. It supports the following prefixes:

- `huggingface:huggingface.co` - Models from Hugging Face
- `file:` - Local file paths
- `openai` - OpenAI models

### `name`

A unique identifier for this embedding configuration.

### `files`

Optional. An list of model files associated with this embedding. Each file has:

- `path`: The path to the file
- `type`: The type of the file (e.g., "model")

### `params`

Optional. A map of key-value pairs for additional parameters specific to the embedding model.

### `dependsOn`

Optional. A list of dependencies that must be processed before this embedding.
