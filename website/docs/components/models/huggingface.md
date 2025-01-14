---
title: 'HuggingFace'
description: 'Instructions for using machine learning models hosted on HuggingFace with Spice.'
sidebar_label: 'HuggingFace'
sidebar_position: 4
---

To use a model hosted on HuggingFace, specify the `huggingface.co` path in the `from` field along with the files to include.

### Example: Load a ML model to predict taxi trips outcomes
```yaml
models:
  - from: huggingface:huggingface.co/spiceai/darts:latest
    name: hf_model
    files:
      - path: model.onnx
    datasets:
      - taxi_trips
```

### Example: Load a LLM model to generate text
```yaml
models:
  - from: huggingface:huggingface.co/microsoft/Phi-3.5-mini-instruct
    name: phi
```

### Example: Load a private model
```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```
For more details on authentication, see [below](#access-tokens).


### Example: Load a GGUF model
```yaml
models:
  - from: huggingface:huggingface.co/lmstudio-community/Qwen2.5-Coder-3B-Instruct-GGUF
    name: sloth-gguf
    files:
      - path: Qwen2.5-Coder-3B-Instruct-Q3_K_L.gguf
```

:::note
Only GGUF model formats require a specific file path, other varieties (e.g. `.safetensors`) are inferred.
:::

## `from` Format

The `from` key follows the following regex format:

```regex
\A(huggingface:)(huggingface\.co\/)?(?<org>[\w\-]+)\/(?<model>[\w\-]+)(:(?<revision>[\w\d\-\.]+))?\z
```

### Examples

- `huggingface:username/modelname`: Implies the latest version of `modelname` hosted by `username`.
- `huggingface:huggingface.co/username/modelname:revision`: Specifies a particular `revision` of `modelname` by `username`, including the optional domain.

### Specification

1. **Prefix:** The value must start with `huggingface:`.
2. **Domain (Optional):** Optionally includes `huggingface.co/` immediately after the prefix. Currently no other Huggingface compatible services are supported.
3. **Organization/User:** The HuggingFace organization (`org`).
4. **Model Name:** After a `/`, the model name (`model`).
5. **Revision (Optional):** A colon (`:`) followed by the git-like revision identifier (`revision`).

### Access Tokens

Access tokens can be provided for Huggingface models in two ways:

1. In the Huggingface token cache (i.e. `~/.cache/huggingface/token`). Default.
1. Via model params (see below).

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

:::warning[Limitations]

- ML models currently only support ONNX file format.

:::
