---
title: 'AI/ML Models'
sidebar_label: 'AI/ML Models'
description: ''
sidebar_position: 5
---

Spice supports traditional machine learning (ML) models and language models (LLMs).

- **Filesystem**: [ONNX](https://onnx.ai) models.
- **HuggingFace**: ONNX models hosted on [HuggingFace](https://huggingface.co).
- **Spice Cloud Platform**: Models hosted on the [Spice Cloud Platform](https://docs.spice.ai/building-blocks/spice-models).
- **OpenAI**: OpenAI (or compatible) LLM endpoints.

### Model Sources

| Name                         | Description      | ML Format(s) | LLM Format(s)*          |
| ---------------------------- | ---------------- | ------------ | ----------------------- |
| `file`                       | Local filesystem |    ONNX      | GGUF, GGML, SafeTensor  |
| `huggingface:huggingface.co` | Models hosted on [HuggingFace](https://huggingface.co)                                          | ONNX  | GGUF, GGML, SafeTensor |
| `spice.ai`                   | Models hosted on the [Spice Cloud Platform](https://docs.spice.ai/building-blocks/spice-models) | ONNX  | - |
| `openai`                     | OpenAI (or compatible) LLM endpoint | -  | Remote HTTP endpoint |

* LLM Format(s) may require additional files (e.g. `tokenizer_config.json`).

The model type is inferred based on the model source and files. For more detail, refer to the `model` [reference specification](/reference/spicepod/models.md).
