---
title: 'AI Models'
sidebar_label: 'AI Models'
description: ''
sidebar_position: 8
pagination_prev: null
---

:::warning[Early Preview]

Machine Learning (ML) and Language Models (LM) are in preview and are subject to modifications.

:::

Models can be defined similarly to [Datasets](../reference/spicepod/datasets.md). The runtime will load the model for inference.

Example:

```yaml
name: my_spicepod
version: v1beta1
kind: Spicepod

models:
  - from: huggingface:huggingface.co/gpt4:latest
    name: open_source_gpt
    params:
      max_length: "128"

datasets:
  - from: localhost
    name: my_inference_view
    sql_ref: inference.sql

    # All your other datasets
  - from: spice.ai/eth.recent_blocks
    name: eth_recent_blocks
    acceleration:
      enabled: true
      refresh_mode: append
```
