---
title: 'Machine Learning'
sidebar_label: 'Machine Learning'
description: ''
sidebar_position: 8
pagination_prev: null
---

:::warning[Early Preview]

Machine Learning (ML) is in preview and is subject to modifications.

:::

ML models can be defined similarly to [Datasets](../reference/spicepod/datasets.md). The runtime will load the model for inference.

Example:

```yaml
name: my_spicepod
version: v1beta1
kind: Spicepod

models:
  - from: file:/model_path.onnx
    name: my_model_name
    datasets:
      - my_inference_view

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
