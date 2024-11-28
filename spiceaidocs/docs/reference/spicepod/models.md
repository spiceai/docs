---
title: 'Models'
sidebar_label: 'Models'
description: 'Models YAML reference'
pagination_next: null
---

:::warning[Early Preview]

The model specifications are in early preview and are subject to change.

:::

# Models

Spice supports both traditional machine learning (ML) models and language models (LLMs). The configuration allows you to specify either type from a variety of sources. The model type is automatically determined based on the model source and files.

| field         | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `name`        | Unique, readable name for the model within the Spicepod.                |
| `from`        | Source-specific address to uniquely identify a model                    |
| `description` | Additional details about the model, useful for displaying to users      |
| `datasets`    | Datasets that the model depends on for inference                        |
| `files`       | Specify additional files, or override default files needed by the model |
| `params`      | Additional parameters to be passed to the model                         |

## `models`

The `models` section in your configuration allows you to specify one or more models to be used with your datasets.

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

- For Spice AI: Supports only ML models. Represents the full path to the model in the Spice AI repository. Supports a version suffix (default to `latest`).
  - Example: `lukekim/smart/models/drive_stats:60cb80a2-d59b-45c4-9b68-0946303bdcaf`
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

  - For ML models: typically `.onnx` files
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

- Setting default OpenAI request parameters for language models, see [parameter overrides](/features/large-language-models/parameter_overrides.md).
- Allowing Language models to perform actions against spice (e.g. making SQL queries), via language model tool use, see [runtime tools](/features/large-language-models/runtime_tools.md).

### `datasets`

Optional. A list of [dataset names](./datasets.md#name) that this model should be applied to. For ML models, this preselects the dataset to use for inference.

### `dependsOn`

Optional. A list of dependencies that must be loaded and available before this model.
