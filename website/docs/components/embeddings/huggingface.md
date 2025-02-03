---
title: 'HuggingFace Text Embedding Models'
sidebar_label: 'HuggingFace'
sidebar_position: 3
---

To use an embedding model from HuggingFace with Spice, specify the `huggingface` path in the `from` field of your configuration. The model and its related files will be automatically downloaded, loaded, and served locally by Spice.

The following parameters are specific to HuggingFace models:

| Parameter  | Description                                                                                                                                                                   | Default |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `hf_token` | The Huggingface access token.                                                                                                                                                 | -       |
| `pooling`  | The [pooling method](https://huggingface.co/docs/text-embeddings-inference/en/cli_arguments) for embedding models. Supported values are `cls`, `mean`, `splade`, `last_token` | -       |

Here is an example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: all_minilm_l6_v2
```

Supported models include:

- All models tagged as [text-embeddings-inference](https://huggingface.co/models?other=text-embeddings-inference) on Huggingface
- Any Huggingface repository with the correct files to be loaded as a [local embedding model](/docs/components/embeddings/local.md).

With the same semantics as [language models](/docs/components/models/huggingface#access-tokens), `spice` can run private HuggingFace embedding models:

```yaml
embeddings:
  - from: huggingface:huggingface.co/secret-company/awesome-embedding-model
    name: top_secret
    params:
      hf_token: ${ secrets:HF_TOKEN }
```
