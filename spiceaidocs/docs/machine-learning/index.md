---
title: 'Machine Learning'
sidebar_label: 'Machine Learning'
description: ''
sidebar_position: 8
---

:::warning[Early Preview]

The Spice ML runtime is in its early preview phase and is subject to modifications.

:::

Machine learning models can be added to the Spice runtime similarly to datasets. The Spice runtime will load it, just like a dataset. 
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