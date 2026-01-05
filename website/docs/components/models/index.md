---
title: 'Model Providers'
sidebar_label: 'Model Providers'
description: 'Overview of supported model providers for ML and LLMs in Spice.'
image: /img/og/models.png
---

Spice supports various model providers for traditional machine learning (ML) models and large language models (LLMs).

| Name                       | Description                                  | Status            | ML Format(s) | LLM Format(s)\*                 |
| -------------------------- | -------------------------------------------- | ----------------- | ------------ | ------------------------------- |
| [`openai`][openai]         | OpenAI (or compatible) LLM endpoint          | Stable            | -            | OpenAI-compatible HTTP endpoint |
| [`bedrock`][bedrock]       | Amazon Bedrock                               | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`xai`][xai]               | Models hosted on xAI                         | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`file`][file]             | Local filesystem                             | Release Candidate | ONNX         | GGUF, GGML, SafeTensor          |
| [`huggingface`][hf]        | Models hosted on HuggingFace                 | Release Candidate | ONNX         | GGUF, GGML, SafeTensor          |
| [`spice.ai`][spice]        | Models hosted on the Spice.ai Cloud Platform | Release Candidate | ONNX         | OpenAI-compatible HTTP endpoint |
| [`azure`][azure]           | Azure OpenAI                                 | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`anthropic`][ant]         | Models hosted on Anthropic                   | Alpha             | -            | OpenAI-compatible HTTP endpoint |
| [`databricks`][databricks] | Models deployed to Databricks Mosaic AI      | Alpha             | -            | OpenAI-compatible HTTP endpoint |

[openai]: ./openai.md
[bedrock]: ./bedrock.md
[file]: /components/embeddings/local.md
[hf]: ./huggingface.md
[spice]: ./spiceai.md
[azure]: ./azure.md
[ant]: ./anthropic.md
[xai]: ./xai.md
[databricks]: ./databricks.md

Spice also tests and evaluates common models and grades their ability to integrate with Spice. See the [Models Grade Report](/docs/reference/models.md).

\*LLM Format(s) may require additional files (e.g., `tokenizer_config.json`).

The model type is inferred based on the model source and files. For more detail, refer to the `model` [reference specification](/docs/reference/spicepod/models.md).

## Features

Spice supports a variety of features for large language models (LLMs):

- **Custom Tools**: Provide models with tools to interact with the Spice runtime. See [Tools](/docs/features/large-language-models/tools).
- **System Prompts**: Declaratively define system prompts and default values for [`v1/chat/completion`](/docs/api/HTTP/post-chat-completions) parameters. See [Parameter Overrides](/docs/features/large-language-models/parameter_overrides.md). Use Jinja-templating to parameterise system prompts per request see [Parameterized prompts](docs/features/large-language-models/parameterized_prompts.md).
- **Memory**: Provide LLMs with memory persistence tools to store and retrieve information across conversations. See [Memory](/docs/features/large-language-models/memory).
- **Vector Search**: Perform advanced vector-based searches using embeddings. See [Vector Search](/docs/features/search/vector-search).
- **Evals**: Evaluate, track, compare, and improve language model performance for specific tasks. See [Evals](/docs/features/large-language-models/evals).
- **Local Models**: Load and serve models locally from various sources, including local filesystems and Hugging Face. See [Local Models](/docs/features/large-language-models/serving).

For more details, refer to the [Large Language Models documentation](/docs/features/large-language-models).

## Model Provider Prefix

The model provider prefix identifies the source or provider of a model in Spice configuration files. This prefix is specified before the model identifier in the `from` field of a model definition, and is used in specifying model [default parameter overrides](#example-setting-default-parameter-overrides). It helps the runtime determine how to load and interact with the model.

The following provider prefixes are supported:

| Prefix       | Description                           |
| ------------ | ------------------------------------- |
| `openai`     | OpenAI or OpenAI-compatible endpoints |
| `azure`      | Azure OpenAI                          |
| `xai`        | xAI                                   |
| `anthropic`  | Anthropic                             |
| `perplexity` | Perplexity                            |
| `hf`         | Hugging Face                          |
| `file`       | Local filesystem                      |
| `spiceai`    | Spice.ai Cloud Platform               |
| `databricks` | Databricks Mosaic AI                  |
| `bedrock`    | Amazon Bedrock                        |

**Example usage in `spicepod.yaml`:**

```yaml
models:
  - from: openai:gpt-4o
    name: openai-model

  - from: hf:meta-llama/Llama-3-8B-Instruct
    name: llama3-hf

  - from: file://absolute/path/to/model.gguf
    name: local-model
```

## Model Examples

The following examples demonstrate how to configure and use various models or model features with Spice. Each example provides a specific use case to help understand the configuration options available.

### Example: Configuring an OpenAI Model

To use a language model hosted on OpenAI (or compatible), specify the `openai` path and model ID in `from`. For more details, see [OpenAI Model Provider](./openai.md).

Example `spicepod.yml`:

```yaml
models:
  - from: openai:gpt-4o-mini
    name: openai
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - from: openai:llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```

### Example: Using an OpenAI Model with Tools

To specify tools for an OpenAI model, include them in the `params.tools` field. For more details, see the [Tools documentation](/docs/features/large-language-models/tools.md).

```yaml
models:
  - name: sql-model
    from: openai:gpt-4o
    params:
      tools: list_datasets, sql, table_schema
```

### Example: Adding Memory to a Model

To enable memory tools for a model, define a `store` memory dataset and specify `memory` in the model's `tools` parameter. For more details, see the [Memory documentation](/docs/features/large-language-models/memory.md).

```yaml
datasets:
  - from: memory:store
    name: llm_memory
    access: read_write

models:
  - name: memory-enabled-model
    from: openai:gpt-4o
    params:
      tools: memory, sql
```

### Example: Setting Default Parameter Overrides

To set default overrides for parameters, use the [model provider prefix](#model-provider-prefix) followed by the parameter name. For more details, see the [Parameter Overrides documentation](/docs/features/large-language-models/parameter_overrides.md).

```yaml
models:
  - name: pirate-haikus
    from: openai:gpt-4o
    params:
      openai_temperature: 0.1
      openai_response_format: { 'type': 'json_object' }
```

### Example: Configuring a System Prompt

To configure an additional system prompt, use the `system_prompt` parameter. For more details, see the [Parameter Overrides documentation](/docs/features/large-language-models/parameter_overrides.md).

```yaml
models:
  - name: pirate-haikus
    from: openai:gpt-4o
    params:
      system_prompt: |
        Write everything in Haiku like a pirate
```

### Example: Serving a Local Model

To serve a model from the local filesystem, specify the `from` path as `file` and provide the local path. For more details, see [Filesystem Model Provider](./filesystem.md).

```yaml
models:
  - from: file://absolute/path/to/my/model.onnx
    name: local_fs_model
```

### Example: Analyzing GitHub Issues with a Chat Model

This example demonstrates how to pull GitHub issue data from the last 14 days, accelerate the data, create a chat model with memory and tools to access the accelerated data, and use Spice to ask the chat model about the general themes of new issues.

#### Step 1: Pull GitHub Issue Data

First, configure a dataset to pull GitHub issue data from the last 14 days.

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/issues
    name: github_issues
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_check_interval: 24h
      refresh_data_window: 14d
```

#### Step 2: Create a Chat Model with Memory and Tools

Next, create a chat model that includes memory and tools to access the accelerated GitHub issue data.

```yaml
datasets:
  - from: memory:store
    name: llm_memory
    access: read_write

models:
  - name: github-issues-analyzer
    from: openai:gpt-4o
    params:
      tools: memory, sql
```

#### Step 3: Query the Chat Model

At this step, the `spicepod.yaml` should look like:

```yaml
datasets:
  - from: github:github.com/<owner>/<repo>/issues
    name: github_issues
    params:
      github_token: ${secrets:GITHUB_TOKEN}
    acceleration:
      enabled: true
      refresh_mode: append
      refresh_check_interval: 24h
      refresh_data_window: 14d

  - from: memory:store
    name: llm_memory
    access: read_write

models:
  - name: github-issues-analyzer
    from: openai:gpt-4o
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }
      tools: memory, sql
```

Finally, use Spice to ask the chat model about the general themes of new issues in the last 14 days. The following `curl` command demonstrates how to make this request using the OpenAI-compatible API.

```bash
curl -X POST http://localhost:8090/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "github-issues-analyzer",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What are the general themes of new issues in the last 14 days?"}
    ]
  }'
```

Refer to the [Create Chat Completion API documentation](/docs/api/HTTP/post-chat-completions.api.mdx) for more details on making chat completion requests.

import DocCardList from '@theme/DocCardList';

<DocCardList />
