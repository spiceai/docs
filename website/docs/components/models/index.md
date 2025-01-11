---
title: 'Model Providers'
sidebar_label: 'Model Providers'
description: 'Overview of supported model providers for ML and LLMs in Spice.'
---

Spice supports various model providers for traditional machine learning (ML) models and large language models (LLMs).

| Name          | Description                                  | ML Format(s) | LLM Format(s)\*                 |
| ------------- | -------------------------------------------- | ------------ | ------------------------------- |
| `file`        | Local filesystem                             | ONNX         | GGUF, GGML, SafeTensor          |
| `huggingface` | Models hosted on HuggingFace                 | ONNX         | GGUF, GGML, SafeTensor          |
| `spice.ai`    | Models hosted on the Spice.ai Cloud Platform | ONNX         | OpenAI-compatible HTTP endpoint |
| `openai`      | OpenAI (or compatible) LLM endpoint          | -            | OpenAI-compatible HTTP endpoint |
| `azure`       | Azure OpenAI                                 | -            | OpenAI-compatible HTTP endpoint |
| `anthropic`   | Models hosted on Anthropic                   | -            | OpenAI-compatible HTTP endpoint |
| `xai`         | Models hosted on xAI                         | -            | OpenAI-compatible HTTP endpoint |

- LLM Format(s) may require additional files (e.g. `tokenizer_config.json`).

The model type is inferred based on the model source and files. For more detail, refer to the `model` [reference specification](/docs/reference/spicepod/models.md).

For details about augmenting language models (e.g. using [tools](/docs/features/large-language-models/tools.md)), see the [LLM documentation](/docs/features/large-language-models).
