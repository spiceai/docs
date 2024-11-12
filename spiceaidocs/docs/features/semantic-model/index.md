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

A semantic model is defined within the `spicepod.yaml` file, specifically under the `datasets` section. Each dataset supports a `columns` field where individual columns are described with metadata and features for utility and clarity.

### Example Configuration

Example `spicepod.yaml`:

```yaml
datasets:
  - name: taxi_trips
    columns:
      - name: tpep_pickup_time
        description: 'The time the passenger was picked up by the taxi'
      - name: notes
        description: 'Optional notes about the trip'
        embeddings:
          - from: hf_minilm
            chunking:
              enabled: true
              target_chunk_size: 512
              overlap_size: 128
              trim_whitespace: true
```

## Column Definitions

Each column in the dataset can be defined with the following attributes:

- `name`: The name of the column in the table schema.
- `description`: A description of the column's contents and purpose.
- `embeddings`: Optional. Vector embeddings configuration for this column.

For detailed configuration, see the [Dataset Reference](/reference/spicepod/datasets.md#columns)
