---
title: 'Filesystem'
description: 'Instructions for using models hosted on a filesystem with Spice.'
sidebar_label: 'Filesystem'
sidebar_position: 5
---

To use a model hosted on a filesystem, specify the path to the model file in the `from` field.

Supported formats include ONNX for traditional machine learning models and GGUF, GGML, and SafeTensor for large language models (LLMs).

### Example: Loading an ONNX Model

```yaml
models:
  - from: file://absolute/path/to/my/model.onnx
    name: local_fs_model
```

### Example: Loading a GGUF Model

```yaml
models:
  - from: file://absolute/path/to/my/model.gguf
    name: local_ggml_model
```

### Example: Loading a GGML Model

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

### Example: Loading from a directory

```yaml
models:
  - name: hello
    from: file:models/llms/llama3.2-1b-instruct/
```

Note: The folder provided should contain all the expected files (see examples above) to load a model in the base level.

### Example: Overriding the Chat Template

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
