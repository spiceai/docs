---
description: Define semantic data models in Spice to improve dataset understanding for AI
---

# Semantic Models

A semantic model is a structured representation of data that captures the meaning and relationships between elements in a dataset.

In Spice, semantic models transform raw data into meaningful business concepts by defining metadata, descriptions, and relationships at both the dataset and column level. This makes the data more interpretable for both AI language models and human analysis.

### Use-Cases

#### Large Language Models (LLMs)

The semantic model is automatically used by [Spice Models](../building-blocks/spice-models.md) as context to produce more accurate and context-aware AI responses.

### Defining a Semantic Model

Semantic data models are defined within the `spicepod.yaml` file, specifically under the `datasets` section. Each dataset supports `description`, `metadata`, and a `columns` field where individual columns are described with metadata and features for utility and clarity.

#### Example Configuration

Example `spicepod.yaml`:

```yaml
datasets:
  - name: taxi_trips
    description: NYC taxi trip rides
    metadata:
      instructions: Always provide citations with reference URLs.
      reference_url_template: https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_<YYYY-MM>.parquet
    columns:
      - name: tpep_pickup_time
        description: 'The time the passenger was picked up by the taxi'
      - name: notes
        description: 'Optional notes about the trip'
        embeddings:
          - from: hf_minilm # A defined Spice Model
            chunking:
              enabled: true
              target_chunk_size: 512
              overlap_size: 128
              trim_whitespace: true
```

### Dataset Metadata

Datasets can be defined with the following metadata:

* `instructions`: Optional. Instructions to provide to a language model when using this dataset.
* `reference_url_template`: Optional. A URL template for citation links.

For detailed `metadata` configuration, see the Spice OSS [Dataset Reference](https://docs.spiceai.org/reference/spicepod/datasets#metadata)

### Column Definitions

Each column in the dataset can be defined with the following attributes:

* `description`: Optional. A description of the column's contents and purpose.
* `embeddings`: Optional. Vector embeddings configuration for this column.

For detailed `columns` configuration, see the Spice OSS [Dataset Reference](https://docs.spiceai.org/reference/spicepod/datasets#columns)
