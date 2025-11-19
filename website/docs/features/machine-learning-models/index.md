---
title: 'Machine Learning Models'
sidebar_label: 'Machine Learning Models'
sidebar_position: 8
pagination_prev: null
pagination_next: null
tags:
  - models
---

Spice supports loading and serving ONNX models for inference, from sources including local filesystems, Hugging Face, and the Spice.ai Cloud platform.

Example `spicepod.yml` loading an ONNX model from HuggingFace:

```yaml
models:
  - from: huggingface:huggingface.co/spiceai/darts:latest
    name: hf_model
    files:
      - path: model.onnx
    datasets:
      - taxi_trips
```

## Filesystem

Models can be hosted on a local filesystem and referenced directly in the configuration. For more details, see the [Filesystem Model Component](/docs/components/models/filesystem.md).

## Hugging Face

Spice integrates with Hugging Face, enabling you to use a wide range of pre-trained models. For more information, see the [Hugging Face Model Component](/docs/components/models/huggingface.md).

## Spice Cloud Platform

The Spice Cloud platform provides a scalable environment for training, hosting, and managing your models. For further details, see the [Spice Cloud Platform Model Component](/docs/components/models/spiceai.md).
