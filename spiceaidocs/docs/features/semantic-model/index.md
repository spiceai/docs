---
title: 'Semantic Model'
sidebar_label: 'Semantic Model'
description: 'Learn how to define and use semantic data models with Spice.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

Semantic data models in Spice are defined using the `datasets[*].columns` configuration.

Structured and meaningful data representations can be added to datasets, beneficial for both AI large language models (LLMs) and traditional data analysis.

## Use-Cases

### Large Language Models (LLMs)

The semantic model will automatically be used by [Spice Models](/reference/spicepod/models.md) as context to produce more accurate and context-aware AI responses.

## Defining a Semantic Model

Semantic data models are defined within the `spicepod.yaml` file, specifically under the `datasets` section. Each dataset supports `description`, `metadata` and a `columns` field where individual columns are described with metadata and features for utility and clarity.

### Example Configuration

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

## Dataset Metadata

Datasets can be defined with the following metadata:

- `instructions`: Optional. Instructions to provide to a language model when using this dataset.
- `reference_url_template`: Optional. A URL template for citation links.

For detailed `metadata` configuration, see the [Dataset Reference](/reference/spicepod/datasets.md#metadata)

## Column Definitions

Each column in the dataset can be defined with the following attributes:

- `description`: Optional. A description of the column's contents and purpose.
- `embeddings`: Optional. Vector embeddings configuration for this column.

For detailed `columns` configuration, see the [Dataset Reference](/reference/spicepod/datasets.md#columns)
