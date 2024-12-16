---
title: 'Model Providers'
sidebar_label: 'Model Providers'
description: 'Overview of supported model providers for ML and LLMs in Spice.'
sidebar_position: 5
---

Spice supports various model providers for traditional machine learning (ML) models and large language models (LLMs).

| Source        | Description                                                                                     | ML Format(s) | LLM Format(s)\*        |
| ------------- | ----------------------------------------------------------------------------------------------- | ------------ | ---------------------- |
| `file`        | Local filesystem                                                                                | ONNX         | GGUF, GGML, SafeTensor |
| `huggingface` | Models hosted on [HuggingFace](https://huggingface.co)                                          | ONNX         | GGUF, GGML, SafeTensor |
| `spice.ai`    | Models hosted on the [Spice Cloud Platform](https://docs.spice.ai/building-blocks/spice-models) | ONNX         | -                      |
| `openai`      | OpenAI (or compatible) LLM endpoint                                                             | -            | Remote HTTP endpoint   |
| `azure`       | Azure OpenAI                                                                                    | -            | Remote HTTP endpoint   |
| `anthropic`   | Models hosted on [Anthropic](https://www.anthropic.com)                                         | -            | Remote HTTP endpoint   |
| `grok`        | Coming soon                                                                                     | -            | Remote HTTP endpoint   |

- LLM Format(s) may require additional files (e.g. `tokenizer_config.json`).

The model type is inferred based on the model source and files. For more detail, refer to the `model` [reference specification](/reference/spicepod/models.md).

For details about augmenting language models (e.g. using [tools](/features/large-language-models/runtime_tools.md)), see the [LLM documentation](/features/large-language-models).
