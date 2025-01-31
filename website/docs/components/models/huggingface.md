---
title: 'HuggingFace'
description: 'Instructions for using machine learning models hosted on HuggingFace with Spice.'
sidebar_label: 'HuggingFace'
sidebar_position: 4
---

To use a model hosted on HuggingFace, specify the `huggingface.co` path in the `from` field and, when needed, the files to include.

## Configuration

### `from`

The `from` key takes the form of `huggingface:model_path`. Below shows 2 common example of `from` key configuration.

- `huggingface:username/modelname`: Implies the latest version of `modelname` hosted by `username`.
- `huggingface:huggingface.co/username/modelname:revision`: Specifies a particular `revision` of `modelname` by `username`, including the optional domain.

The `from` key follows the following regex format.

```regex
\A(huggingface:)(huggingface\.co\/)?(?<org>[\w\-]+)\/(?<model>[\w\-]+)(:(?<revision>[\w\d\-\.]+))?\z
```

The `from` key consists of five components:

1. **Prefix:** The value must start with `huggingface:`.
2. **Domain (Optional):** Optionally includes `huggingface.co/` immediately after the prefix. Currently no other Huggingface compatible services are supported.
3. **Organization/User:** The HuggingFace organization (`org`).
4. **Model Name:** After a `/`, the model name (`model`).
5. **Revision (Optional):** A colon (`:`) followed by the git-like revision identifier (`revision`).

### `name`

The model name. This will be used as the model ID within Spice and Spice's endpoints (i.e. `http://localhost:8090/v1/models`). This can be set to the same value as the model ID in the `from` field.

### `params`

| Param           | Description                                                                                                                                                                               | Default |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `hf_token`      | The Huggingface access token.                                                                                                                                                             | -       |
| `model_type`    | The architecture to load the model as. Supported values: `mistral`, `gemma`, `mixtral`, `llama`, `phi2`, `phi3`, `qwen2`, `gemma2`, `starcoder2`, `phi3.5moe`, `deepseekv2`, `deepseekv3` | -       |
| `tools`         | Which [tools] should be made available to the model. Set to `auto` to use all available tools.                                                                                            | -       |
| `system_prompt` | An additional system prompt used for all chat completions to this model.                                                                                                                  | -       |

### `files`

The specific file path for Huggingface model. For example, GGUF model formats require a specific file path, other varieties (e.g. `.safetensors`) are inferred.

#### Example

```yaml
models:
  - from: huggingface:huggingface.co/lmstudio-community/Qwen2.5-Coder-3B-Instruct-GGUF
    name: sloth-gguf
    files:
      - path: Qwen2.5-Coder-3B-Instruct-Q3_K_L.gguf
```

## Access Tokens

Access tokens can be provided for Huggingface models in two ways:

1. In the Huggingface token cache (i.e. `~/.cache/huggingface/token`). Default.
1. Via [model params](#params).

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

## Examples

### Load a ML model to predict taxi trips outcomes

```yaml
models:
  - from: huggingface:huggingface.co/spiceai/darts:latest
    name: hf_model
    files:
      - path: model.onnx
    datasets:
      - taxi_trips
```

### Load a LLM model to generate text

```yaml
models:
  - from: huggingface:huggingface.co/microsoft/Phi-3.5-mini-instruct
    name: phi
```

### Load a private model

```yaml
models:
  - name: llama_3.2_1B
    from: huggingface:huggingface.co/meta-llama/Llama-3.2-1B
    params:
      hf_token: ${ secrets:HF_TOKEN }
```

For more details on authentication, see [access tokens](#access-tokens).

:::warning[Limitations]

- The throughput, concurrency & latency of a locally hosted model will vary based on the underlying hardware and model size. Spice supports [Apple metal](../../installation.md#metal-support) and [CUDA](../../installation.md#cuda-support) for accelerated inference.
- ML models currently only support ONNX file format.
  :::

## Cookbook

- Use the Llama family of models locally from HuggingFace using Spice. [Running Llama3 Locally](https://github.com/spiceai/cookbook/blob/trunk/llama/README.md)
