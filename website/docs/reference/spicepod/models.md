---
title: 'Models'
sidebar_label: 'Models'
description: 'Models YAML reference'
pagination_next: null
---

The `models` section of a Spicepod defines large language models (LLMs) for use with Spice. Models can be loaded from Hugging Face, OpenAI, local files, or other supported providers.

| Field         | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `name`        | Unique, readable name for the model within the Spicepod.                 |
| `from`        | Source-specific address to uniquely identify a model.                    |
| `description` | Additional details about the model, useful for displaying to users.      |
| `datasets`    | Datasets the model's tools may access, forming a table allowlist.        |
| `files`       | Specify additional files, or override default files needed by the model. |
| `params`      | Additional parameters to be passed to the model.                         |

## `models`

The `models` section in your configuration specifies one or more models to be used with your datasets.

Example:

```yaml
models:
  - from: huggingface:huggingface.co/gpt4:latest
    name: text_generator
    files:
      - path: model.safetensors
        type: weights
      - path: config.json
        type: config
      - path: tokenizer.json
        type: tokenizer
    params:
      max_length: '128'
    datasets:
      - my_text_dataset
```

### `from`

The `from` field specifies both the source of the model (e.g Huggingface, or a local file), and the unique identifier of the model (relative to the source). The `from` value expects the following format

```yaml
- from: <model_source>/<model id>
```

#### Model Source

The `<model_source>` prefix of the `from` field indicates where the model is sourced from:

- `huggingface:huggingface.co` - Models from Hugging Face
- `file:` - Local file paths
- `openai` - OpenAI (or compatible) models
- `spiceai` - Spice AI models

#### Model ID

The `<model_id>` suffix of the `from` field is a unique (per source) identifier for the model:

- For Spice AI: The identifier of a model served by the [Spice.ai Cloud Platform](../../components/models/spiceai.md) (or by another Spice runtime), in the form `<provider>/<model>`.
  - Example: `spice.ai:openai/gpt-4o`
- For Hugging Face: A repo_id and, optionally, revision hash or tag.
  - `Qwen/Qwen1.5-0.5B` (no revision)
  - `meta-llama/Meta-Llama-3-8B:cd892e8f4da1043d4b01d5ea182a2e8412bf658f` (with revision hash)
- For local files: Represents the absolute or relative path to the model weights file on the local file system. See [below](#files) for the accepted model weight types and formats.
- For OpenAI: Only supports LMs. For OpenAI models, valid IDs can be found in their model [documentation](https://platform.openai.com/docs/models/continuous-model-upgrades). For OpenAI compatible providers, specify the value required in their `v1/chat/completion` [payload](https://platform.openai.com/docs/api-reference/chat/create#chat-create-model).

### `name`

A unique identifier for this model component.

### `description`

Additional details about the model, useful for displaying to users

### `files`

Optional. A list of files associated with this model. Each file has:

- `path`: The path to the file
- `name`: Optional. A name for the file
- `type`: Optional. The type of the file (automatically determined if not specified)

File types include:

- `weights`: Model weights
  - For LLMs: `.gguf`, `.ggml`, `.safetensors`, or `pytorch_model.bin` files
  - These files contain the trained parameters of the model

- `config`: Model configuration
  - Usually a `config.json` file
  - Contains model architecture and hyperparameters

- `tokenizer`: Tokenizer file
  - Usually a `tokenizer.json` file
  - Defines how input text is converted into tokens for the model

- `tokenizer_config`: Tokenizer configuration
  - Usually a `tokenizer_config.json` file
  - Contains additional configuration for the tokenizer

The system attempts to automatically determine the file type based on the file name and extension. If the type cannot be determined automatically, you can explicitly specify it in the configuration.

### `params`

Optional. A map of key-value pairs for additional parameters specific to the model.

Example uses include:

- Setting default OpenAI request parameters for language models, see [parameter overrides](../../features/large-language-models/parameter_overrides).
- Enabling language models to perform actions against Spice (e.g. making SQL queries), via language model tool use, see [runtime tools](../../features/large-language-models/tools).
- Invoking language models directly from SQL queries using the [`ai()` function](../sql/scalar_functions#ai-and-embed).

#### `params.tools`

Which tools should be made available to the model. Supported values: `auto`, `all`, `search_registry`, or a comma-separated list of specific tool names. See [Tool Modes](../../features/large-language-models/tools#tool-modes).

#### `params.tool_embedding_model`

The name of an embedding model (defined in the `embeddings` section) to use for searchable tool discovery. Required when `tools: search_registry` is set. When `tools: auto` is used, this model enables registry-based discovery if the tool count exceeds the auto-search threshold (20 tools). If only one embedding model is configured, it is used automatically.

#### `params.prompt_cache_key`

Optional. A stable key forwarded to the LLM provider to enable prompt/prefix caching. When set, Spice maps this key into the provider-native caching mechanism:

| Provider | Behavior |
| --- | --- |
| OpenAI / Azure OpenAI | Passed through on Chat and Responses API requests |
| Anthropic | Adds `cache_control: { type: "ephemeral" }` to the request |
| Google Gemini | Maps to `cached_content.name` (must be a valid cached-content resource name) |
| xAI (Grok) | Sent as the `x-grok-conv-id` HTTP header |
| AWS Bedrock (Converse) | Appends a native `CachePoint` block |
| Databricks (hosted Claude) | Adds Claude-style `cache_control` to the last content part |
| Local (mistral-rs) | Paged-attention scheduling is enabled automatically on supported backends (CUDA + Unix) |

```yaml
models:
  - from: openai:gpt-4o
    name: my_model
    params:
      prompt_cache_key: "schema-context"
```

#### `params.prompt_cache_retention`

Optional. Retention hint for prompt caching, applicable to the OpenAI Responses API only. For example, `"24h"` requests that the cached content be retained for 24 hours.

```yaml
models:
  - from: openai:gpt-4o
    name: my_model
    params:
      prompt_cache_key: "schema-context"
      prompt_cache_retention: "24h"
```

### `datasets`

Optional. A list of [dataset names](./datasets#name) that scope the model's tool access, forming a table allowlist for SQL and NSQL tool use. When omitted, the model's tools are not restricted to a specific set of datasets.

### `dependsOn`

Optional. A list of dependencies that must be loaded and available before this model.
