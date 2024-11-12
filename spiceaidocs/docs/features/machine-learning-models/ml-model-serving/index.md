---
title: 'ML Model Serving'
sidebar_label: 'ML Model Serving'
description: 'Learn how to load and serve machine learning models for inference using Spice.'
sidebar_position: 6
pagination_prev: null
pagination_next: null
---

Spice supports loading and serving ONNX models and GGUF LLMs from various sources for embeddings and inference, including local filesystems, Hugging Face, and the Spice Cloud platform.

Example `spicepod.yml` loading a LLM from HuggingFace:

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

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

Models can be hosted on a local filesystem and referenced directly in the configuration. For more details, see the [Filesystem Model Component](/components/models/filesystem.md).

## Hugging Face

Spice integrates with Hugging Face, enabling you to use a wide range of pre-trained models. For more information, see the [Hugging Face Model Component](/components/models/huggingface.md).

## Spice Cloud Platform

The Spice Cloud platform provides a scalable environment for training, hosting, and managing your models. For further details, see the [Spice Cloud Platform Model Component](/components/models/spiceai.md).
