---
title: 'HuggingFace Text Embedding Models'
sidebar_label: 'HuggingFace'
sidebar_position: 3
---

To use an embedding model from HuggingFace with Spice, specify the `huggingface` path in the `from` field of your configuration. The model and its related files will be automatically downloaded, loaded, and served locally by Spice.

The following parameters are specific to HuggingFace models:

| Parameter     | Description                                                                                                                                                                   | Default |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `hf_token`    | The Huggingface access token. See [access tokens](../models/huggingface#access-tokens).                                                                                   | -       |
| `hf_endpoint` | The Hugging Face Hub endpoint to download the model from, to read through a mirror or proxy of the Hub. See [endpoint](../models/huggingface#endpoint).                   | `HF_ENDPOINT`, then `https://huggingface.co` |
| `pooling`  | The [pooling method](https://huggingface.co/docs/text-embeddings-inference/en/cli_arguments) for embedding models. Supported values are `cls`, `mean`, `splade`, `last_token`. When unset, the pooling the repository's `1_Pooling/config.json` selects, otherwise `mean`; see [Pooling](./deployment.md#pooling) | -       |

Here is an example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: all_minilm_l6_v2
```

Supported models include:

- All models tagged as [text-embeddings-inference](https://huggingface.co/models?other=text-embeddings-inference) on Huggingface
- Any Huggingface repository with the correct files to be loaded as a [local embedding model](local).

## Model Weights

Spice downloads the repository's `safetensors` weights. When a repository publishes none, it falls back to `pytorch_model.bin` and logs a warning at startup:

```text
safetensors weights not found; falling back to `pytorch_model.bin`. Model loading is significantly slower.
```

A repository that publishes neither format fails to load. Prefer a repository with `safetensors` weights where one is available.

With the same [token, endpoint, cache and offline settings](../models/huggingface#hugging-face-hub) as language models, `spice` can run private HuggingFace embedding models. An `hf_token` the Spicepod does not set is loaded from a secret named `hf_token` in the configured secret stores:

```yaml
embeddings:
  - from: huggingface:huggingface.co/secret-company/awesome-embedding-model
    name: top_secret
    params:
      hf_token: ${ secrets:HF_TOKEN }
```
