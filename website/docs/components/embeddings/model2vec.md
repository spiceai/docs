---
title: 'Model2Vec Embedding Models'
sidebar_label: 'Model2Vec'
sidebar_position: 4
---

To use a Model2Vec embedding model with Spice, specify the `model2vec` prefix in the `from` field of your configuration. Model2Vec is a technique that distills embeddings from transformer models into static word embeddings, providing efficient embedding generation, in parallel, without performing external API calls.

The following parameters are specific to Model2Vec models:

| Parameter                   | Description                                                                                       | Default                    |
| --------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| `hf_token`                  | The Hugging Face access token for accessing private models.                                       | -                          |
| `normalize`                 | Whether to normalize embeddings (defaults to the model's configuration).                          | Model's default setting    |
| `subfolder`                 | Optional subfolder path when using Hugging Face models that reside in a subfolder of the repo.    | -                          |
| `parallelism`               | Number of parallel threads to use for embedding computation.                                      | System CPU count           |
| `embed_max_token_length`    | Maximum token length for embeddings.                                                              | -                          |
| `embed_custom_batch_size`   | Custom batch size override for embedding operations.                                              | -                          |

For more details on Model2Vec parameters and functionality, refer to the [model2vec-rs documentation](https://github.com/MinishLab/model2vec-rs).

Here is an example configuration in `spicepod.yaml` for [`minishlab/potion-base-8m`](https://huggingface.co/minishlab/potion-base-8M):

```yaml
embeddings:
  - from: model2vec:minishlab/potion-base-8M
    name: potion_base_8m
```

## Local Models

Model2Vec models can also be loaded from the local filesystem by specifying a file path:

```yaml
embeddings:
  - from: model2vec:/path/to/local/model
    name: local_model2vec
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

## Distilling Your Own Models

Create custom Model2Vec embeddings by distilling existing sentence transformer models. For more detailed instructions, see the [Model2Vec Quickstart guide](https://github.com/MinishLab/model2vec?tab=readme-ov-file#quickstart). Here's how to distill the popular [`sentence-transformers/all-MiniLM-L6-v2`](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) model:

1. **Install the Model2Vec Python library:**
   ```bash
   pip install model2vec
   ```

2. **Create a distillation script:**
   ```python
   from model2vec import StaticModel
   
   # Load a sentence transformer model and distill it to a static model
   model = StaticModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2", device="cpu")
   
   # Save the static model
   model.save_pretrained("./all-MiniLM-L6-v2-model2vec")
   
   print("Model distilled and saved to ./all-MiniLM-L6-v2-model2vec")
   ```

3. **Use the distilled model with Spice:**
   ```yaml
   embeddings:
     - from: model2vec:./all-MiniLM-L6-v2-model2vec
       name: distilled_minilm
     - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
       name: all_minilm_l6_v2
   ```

4. **Race!**

   Compare the throughput of the distilled embedding model with the full version by declaring both models in the same Spicepod. This uses example [Wikipedia article data from Kaggle](https://www.kaggle.com/datasets/jjinho/wikipedia-20230701):

   ```yaml
   datasets:
    - from: file://wiki_a.parquet
      name: wiki_a_distilled
      acceleration:
        enabled: true
      columns:
      - name: text_trunc
        embeddings:
          - from: minilm_distilled
    - from: file://wiki_a.parquet
      name: wiki_a_full
      acceleration:
        enabled: true
        refresh_sql: select * from wiki_a_full limit 100;
      columns:
        - name: text_trunc
          embeddings:
            - from: all_minilm_l6_v2
   embeddings:
   - from: model2vec:./all-MiniLM-L6-v2-model2vec
     name: distilled_minilm
   - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2
     name: all_minilm_l6_v2
   ```

   Start Spice with `spice run`:
   ```
   2025-08-25T15:59:39.033644Z  INFO runtime::init::embedding: Embedding Model minilm_distilled ready
   2025-08-25T15:59:39.969381Z  INFO runtime::init::embedding: Embedding Model all_minilm_l6_v2 ready
   2025-08-25T15:59:39.969713Z  INFO runtime::init::dataset: Dataset wiki_a_full initializing...
   2025-08-25T15:59:39.969713Z  INFO runtime::init::dataset: Dataset wiki_a_distilled initializing...
   2025-08-25T15:59:39.973287Z  INFO runtime::init::dataset: Dataset wiki_a_full registered (file://wiki_a2.parquet), acceleration (arrow), results cache enabled.
   2025-08-25T15:59:39.973344Z  INFO runtime::init::dataset: Dataset wiki_a_distilled registered (file://wiki_a2.parquet), acceleration (arrow), results cache enabled.
   2025-08-25T15:59:39.973637Z  INFO runtime::accelerated_table::refresh_task: Loading data for dataset wiki_a_distilled
   2025-08-25T15:59:39.973714Z  INFO runtime::accelerated_table::refresh_task: Loading data for dataset wiki_a_full
   2025-08-25T15:59:50.982854Z  INFO runtime::accelerated_table::refresh_task: Dataset wiki_a_distilled received 40,960 records
   2025-08-25T16:00:02.953192Z  INFO runtime::accelerated_table::refresh_task: Dataset wiki_a_distilled received 57,344 records
   2025-08-25T16:00:14.429262Z  INFO runtime::accelerated_table::refresh_task: Dataset wiki_a_distilled received 40,960 records
   2025-08-25T16:00:26.177483Z  INFO runtime::accelerated_table::refresh_task: Dataset wiki_a_distilled received 49,152 records
   2025-08-25T16:00:36.963177Z  INFO runtime::accelerated_table::refresh_task: Dataset wiki_a_distilled received 40,960 records
   2025-08-25T16:00:49.157552Z  INFO runtime::accelerated_table::refresh_task: Dataset wiki_a_distilled received 49,152 records
   2025-08-25T16:01:09.789714Z  INFO runtime::accelerated_table::refresh_task: Loaded 100 rows (904.41 kiB) for dataset wiki_a_full in 1m 29s 816ms.
   ```

   **Performance Results:**

   Note: The dramatic results are due to `model2vec` embedding execution being parallelized across all of the host's cores (default configuration). Per core, model2vec achieves a throughput of 300/400 rows/sec with this corpus. This specific test machine has 16 cores. Execution of SBERT models is currently not parallelized.

   | Model Name                               | Model Type            | Records Processed       | Throughput (records/sec) |
   | ---------------------------------------- | --------------------- | ----------------------- | ------------------------ |
   | `sentence-transformers/all-MiniLM-L6-v2` | Model2Vec (Distilled) | 278,528                 | ~4,043                   |
   | `sentence-transformers/all-MiniLM-L6-v2` | SBERT (Full)          | 100                     | ~1.1                     |
   | **Performance Gain** (model2vec)         | -                     | -                       | **~3,675x faster**       |
