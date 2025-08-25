---
title: 'Model2Vec Embedding Models'
sidebar_label: 'Model2Vec'
sidebar_position: 4
---

To use a Model2Vec embedding model with Spice, specify the `model2vec` path in the `from` field of your configuration. Model2Vec is a technique that distills embeddings from transformer models into static word embeddings, providing efficient embedding generation, in parallel, without performing external API calls.

The following parameters are specific to Model2Vec models:

| Parameter                   | Description                                                                                       | Default                    |
| --------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| `hf_token`                  | The Hugging Face access token for accessing private models.                                       | -                          |
| `normalize`                 | Whether to normalize embeddings (defaults to the model's configuration).                          | Model's default setting    |
| `subfolder`                 | Optional subfolder path when using Hugging Face models that reside in a subfolder of the repo.    | -                          |
| `parallelism`               | Number of parallel threads to use for embedding computation.                                      | System CPU count           |
| `embed_max_token_length`    | Maximum token length for embeddings.                                                              | -                          |
| `embed_custom_batch_size`   | Custom batch size override for embedding operations.                                              | -                          |

Here is an example configuration in `spicepod.yaml` for [`minishlab/potion-base-8m`](https://huggingface.co/minishlab/potion-base-8M):

```yaml
embeddings:
  - from: model2vec:minishlab/potion-base-8M
    name: potion_base_8m
```

## Private Models

Model2Vec supports private Hugging Face models with authentication:

```yaml
embeddings:
  - from: model2vec:your-organization/private-model
    name: private_embeddings
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

## Advanced Configuration

For performance optimization, you can configure parallelism and embedding batch sizes:

```yaml
embeddings:
  - from: model2vec:minishlab/potion-base-8M
    name: potion_optimized
    params:
      parallelism: 8
      embed_custom_batch_size: 32
      normalize: true
```
