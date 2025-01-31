---
title: 'Filesystem Hosted Models'
description: 'Instructions for using models hosted on a filesystem with Spice.'
sidebar_label: 'Filesystem'
sidebar_position: 5
---

To use a model hosted on a filesystem, specify the path to the model file or folder in the `from` field:

```yaml
models:
  - from: file://models/llms/llama3.2-1b-instruct/
    name: llama3
    params:
      model_type: llama
      
```

Supported formats include GGUF, GGML, and SafeTensor for large language models (LLMs) and ONNX for traditional machine learning (ML) models.

## Configuration

### `from`

An absolute or relative path to the model file or folder:

```yaml
from: file://absolute/path/models/llms/llama3.2-1b-instruct/
from: file:models/llms/llama3.2-1b-instruct/
```

### `params` (optional)

| Param           | Description                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model_type`    | The architecture to load the model as. Supported values: `mistral`, `gemma`, `mixtral`, `llama`, `phi2`, `phi3`, `qwen2`, `gemma2`, `starcoder2`, `phi3.5moe`, `deepseekv2`, `deepseek` |
| `tools`         | Which [tools](../../features/large-language-models/tools.md) should be made available to the model. Set to `auto` to use all available tools.                                        |
| `system_prompt` | An additional system prompt used for all chat completions to this model.                                                                                                            |
| `chat_template` | Customizes the transformation of OpenAI chat messages into a character stream for the model. See [Overriding the Chat Template](#overriding-the-chat-template).                      |

See [Large Language Models](../../features/large-language-models) for additional configuration options.

- [Tools](../../features/large-language-models/tools.md)
- [Memory](../../features/large-language-models/memory.md)
- [Evals](../../features/large-language-models/evals.md)
- [Parameter overrides](../../features/large-language-models/parameter_overrides.md)

### `files` (optional)

The `files` field specifies additional files required by the model, such as tokenizer, configuration, and other files.

```yaml
- name: local-model
  from: file://models/llms/llama3.2-1b-instruct/model.safetensors
  files:
    - path: //models/llms/llama3.2-1b-instruct/tokenizer.json
    - path: //models/llms/llama3.2-1b-instruct/tokenizer_config.json
    - path: //models/llms/llama3.2-1b-instruct/config.json
```

## Examples

### Loading a GGML Model

```yaml
models:
  - from: file://absolute/path/to/my/model.ggml
    name: local_ggml_model
    files:
      - path: models/llms/ggml/tokenizer.json
      - path: models/llms/ggml/tokenizer_config.json
      - path: models/llms/ggml/config.json
```

### Example: Loading a SafeTensor Model

```yaml
models:
  - name: safety
    from: file:models/llms/llama3.2-1b-instruct/model.safetensors
    files:
      - path: models/llms/llama3.2-1b-instruct/tokenizer.json
      - path: models/llms/llama3.2-1b-instruct/tokenizer_config.json
      - path: models/llms/llama3.2-1b-instruct/config.json
```

### Loading LLM from a directory

```yaml
models:
  - name: llama3
    from: file:models/llms/llama3.2-1b-instruct/
```

Note: The folder provided should contain all the expected files (see examples above).

### Loading an ONNX Model

```yaml
models:
  - from: file://absolute/path/to/my/model.onnx
    name: local_fs_model
```

### Loading a GGUF Model

```yaml
models:
  - from: file://absolute/path/to/my/model.gguf
    name: local_gguf_model
```

### Overriding the Chat Template

Chat templates convert the OpenAI compatible chat messages (see [format](https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages)) and other components of a request
into a stream of characters for the language model. It follows Jinja3 templating [syntax](https://jinja.palletsprojects.com/en/3.1.x/templates/).

Further details on chat templates can be found [here](https://huggingface.co/docs/transformers/main/chat_templating#advanced-how-do-chat-templates-work).

```yaml
models:
  - name: local_model
    from: file:path/to/my/model.gguf
    params:
      chat_template: |
        {% set loop_messages = messages %}
        {% for message in loop_messages %}
          {% set content = '<|start_header_id|>' + message['role'] + '<|end_header_id|>\n\n'+ message['content'] | trim + '<|eot_id|>' %}
          {{ content }}
        {% endfor %}
        {% if add_generation_prompt %}
          {{ '<|start_header_id|>assistant<|end_header_id|>\n\n' }}
        {% endif %}
```

#### Templating Variables

- `messages`: List of chat messages, in the OpenAI [format](https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages).
- `add_generation_prompt`: Boolean flag whether to add a [generation prompt](https://huggingface.co/docs/transformers/main/chat_templating#what-are-generation-prompts).
- `tools`: List of callable tools, in the OpenAI [format](https://platform.openai.com/docs/api-reference/chat/create#chat-create-tools).

:::warning[Limitations]

- The throughput, concurrency & latency of a locally hosted model will vary based on the underlying hardware and model size. Spice supports [Apple metal](/installation.md#metal-support) and [CUDA](/installation.md#cuda-support) for accelerated inference.

:::
