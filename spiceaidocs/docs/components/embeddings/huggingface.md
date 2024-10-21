---
title: 'HuggingFace Text Embedding Models'
sidebar_label: 'HuggingFace'
sidebar_position: 2
---

To run an embedding model from HuggingFace, specify the `huggingface` path in `from`. This will handle downloading and running the embedding model locally.
```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
    name: all_minilm_l6_v2
```

Supported models include:
 - All models tagged as [text-embeddings-inference](https://huggingface.co/models?other=text-embeddings-inference) on Huggingface
 - Any Huggingface repository with the correct files to be loaded as a [local embedding model](/components/embeddings/local.md).


With the same semantics as [language models](/components/models/huggingface#access-tokens), `spice` can run private HuggingFace embedding models:
```yaml
embeddings:
  - from: huggingface:huggingface.co/secret-company/awesome-embedding-model
    name: top_secret
    params:
      hf_token: ${ secrets:HF_TOKEN }
```
