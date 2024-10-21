---
title: 'Embedding Models'
sidebar_label: 'Embeddings'
description: ''
sidebar_position: 6
pagination_prev: null
pagination_next: null
---

Embedding models are used to convert raw text into a numerical representation that can be used by machine learning models.

Spice supports running embedding models locally, or use remote services such as OpenAI, or [la Plateforme](https://console.mistral.ai/).

Embedding models are defined in the `spicepod.yaml` file as top-level components.

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: all_minilm_l6_v2

  - from: openai:text-embedding-3-large
    name: xl_embed
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: my_model
    from: file:model.safetensors
    files:
      - path: config.json
      - path: models/embed/tokenizer.json
```

Embedding models can be used either by:
 - An OpenAI-compatible [endpoint](/api/http/embeddings.md)
 - By augmenting a dataset with column-level [embeddings](/reference/spicepod/datasets.md#embeddings), to provide vector-based [search functionality](/features/search/index.md#vector-search).
