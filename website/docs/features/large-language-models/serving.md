---
title: 'Load and Serve Models Locally'
sidebar_label: 'Local Models'
description: 'Learn how to load and serve large learning models.'
sidebar_position: 6
pagination_prev: null
pagination_next: null
tags:
  - models
---

Spice supports loading and serving LLMs from various sources for embeddings and inference, including local filesystems and Hugging Face.

### Example: Loading a LLM from Hugging Face

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

## Filesystem

Models can be hosted on a local filesystem and referenced directly in the configuration. For more details, see the [Filesystem Model Component](/docs/components/models/filesystem).

## Hugging Face

Spice integrates with Hugging Face, enabling you to use a wide range of pre-trained models. For more information, see the [Hugging Face Model Component](/docs/components/models/huggingface).
