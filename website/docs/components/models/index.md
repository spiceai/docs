---
title: 'Model Providers'
sidebar_label: 'Model Providers'
description: 'Overview of supported model providers for LLMs in Spice.'
image: /img/og/models.png
sidebar_position: 5
---

Spice supports various model providers for large language models (LLMs).

> **Note**: Support for traditional machine learning (ONNX) models was removed in v2.2. See [Machine Learning Models](../../features/machine-learning-models/index.md) for details.

| Name                       | Description                                  | Status            | LLM Format(s)\*                 |
| -------------------------- | -------------------------------------------- | ----------------- | ------------------------------- |
| [`openai`][openai]         | OpenAI (or compatible) LLM endpoint          | Stable            | OpenAI-compatible HTTP endpoint |
| [`bedrock`][bedrock]       | Amazon Bedrock                               | Alpha             | OpenAI-compatible HTTP endpoint |
| [`xai`][xai]               | Models hosted on xAI                         | Alpha             | OpenAI-compatible HTTP endpoint |
| [`file`][file]             | Local filesystem                             | Release Candidate | GGUF, GGML, SafeTensor          |
| [`huggingface`][hf]        | Models hosted on HuggingFace                 | Release Candidate | GGUF, GGML, SafeTensor          |
| [`spice.ai`][spice]        | Models hosted on the Spice.ai Cloud Platform | Release Candidate | OpenAI-compatible HTTP endpoint |
| [`azure`][azure]           | Azure OpenAI                                 | Alpha             | OpenAI-compatible HTTP endpoint |
| [`anthropic`][ant]         | Models hosted on Anthropic                   | Alpha             | OpenAI-compatible HTTP endpoint |
| [`google`][google]         | Google Vertex AI language models             | Alpha             | Vertex AI HTTP endpoint         |
| [`databricks`][databricks] | Models deployed to Databricks Mosaic AI      | Alpha             | OpenAI-compatible HTTP endpoint |
| ~~`perplexity`~~           | ~~Perplexity~~ ([Deprecated][perplexity])    | Deprecated        | -                               |

[openai]: ./openai/index.md
[bedrock]: ./bedrock.md
[file]: ./filesystem/index.md
[hf]: ./huggingface/index.md
[spice]: ./spiceai.md
[azure]: ./azure.md
[ant]: ./anthropic.md
[google]: ./google.md
[xai]: ./xai.md
[databricks]: ./databricks.md
[typesafe]: ./typesafe.md
[perplexity]: ./perplexity.md

Spice also serves decision models, which answer typed questions through the SQL decision functions and `POST /v1/decisions`. [TypeSafe][typesafe] Jev answers decisions only, rather than chat completions. OpenAI `gpt-6-luna` answers decisions through OpenAI's Decisions API and also serves chat completions like any other OpenAI model. Chat models answer decisions as well. See [Decisions](../../features/large-language-models/decisions.md).

Spice also tests and evaluates common models and grades their ability to integrate with Spice. See the [Models Grade Report](../reference/models).

\*LLM Format(s) may require additional files (e.g., `tokenizer_config.json`).

The model type is inferred based on the model source and files. For more detail, refer to the `model` [reference specification](../reference/spicepod/models).

## Features

Spice supports a variety of features for large language models (LLMs):

- **Custom Tools**: Provide models with tools to interact with the Spice runtime. See [Tools](../features/large-language-models/tools).
- **System Prompts**: Declaratively define system prompts and default values for [`v1/chat/completion`](../api/HTTP/post-chat-completions) parameters. See [Parameter Overrides](../features/large-language-models/parameter_overrides). Use Jinja templating to parameterize system prompts per request. See [Parameterized prompts](../features/large-language-models/parameterized_prompts).
- **Memory**: Provide LLMs with memory persistence tools to store and retrieve information across conversations. See [Memory](../features/large-language-models/memory).
- **Vector Search**: Perform advanced vector-based searches using embeddings. See [Vector Search](../features/search/vector-search).
- **Local Models**: Load and serve models locally from various sources, including local filesystems and Hugging Face. See [Local Models](../features/large-language-models/serving).

For more details, refer to the [Large Language Models documentation](../features/large-language-models).

## Model Loading and Readiness

Spice loads each model at startup. A model that has not loaded keeps the runtime not ready, so [`/v1/ready`](../../api/HTTP/ready) returns `503`. When the provider refuses a model at load time, for example because the API key is wrong, the account lacks permission or has run out of credits, or the request is rate limited, the load error names the provider's refusal.

A model whose first load fails is retried in the background with Fibonacci backoff, with no limit on the number of attempts. The base delay starts at 1 second and grows to 5 minutes, and each wait varies by up to 30% either way, so waits at the cap last between about 3.5 and 6.5 minutes. Each attempt logs its result. When the provider accepts the model, the model registers and `/v1/ready` returns `200` without a restart. Retries stop at shutdown, or when a Spicepod change updates or removes the model.

A load that fails with a recognized configuration error is not retried, because only a Spicepod change can clear it. These errors include an unknown model source, a missing or invalid parameter, a task the model does not support, unsafe model weights, and missing local model files. Other loader errors are retried like a provider refusal, even when they come from the configuration; for example, an Azure model without an `endpoint` parameter fails and is retried at each backoff interval until the Spicepod is fixed.

After correcting the Spicepod, a runtime that watches it for changes loads the model again. `spice run` enables the watcher, while `spiced` enables it only with [`--pods-watcher-enabled`](../../cli/reference/spiced); without the watcher, restart the runtime to load the corrected model.

In v2.4.0-rc.2 and earlier, a model that fails to load is not retried in the background. It loads again only when the runtime restarts, or when a change to the model's Spicepod definition reaches a runtime that watches the Spicepod; until then, the runtime stays not ready.

## Local GGUF Models

Spice serves a GGUF model on a single node, from the [`file`][file] or [`huggingface`][hf] provider, with [llama.cpp](https://github.com/ggml-org/llama.cpp). The model's file format selects the engine, so no Spicepod change is needed.

| Model                                                   | Served by             |
| ------------------------------------------------------- | --------------------- |
| GGUF on one node, `from: file:` or `from: huggingface:` | llama.cpp             |
| GGUF with `distributed_backend: ring` (Enterprise)      | mistral.rs, unchanged |
| Safetensors                                             | mistral.rs, unchanged |

The OpenAI-compatible API works the same way on both engines: streaming, `usage`, `finish_reason`, `reasoning_effort` and `reasoning_content` are unchanged, and so are the GGUF's own chat template and the `chat_template` and `context_length` parameters. Prompts are rendered and tool calls are parsed with the same code as on mistral.rs, so a GLM-5.3 tool call, which that parser does not read, stays unparsed on both engines. Each streamed tool call carries its own `index`.

The `paged_attention` parameter has no effect on a GGUF model, because llama.cpp manages its own KV cache. A model that sets `paged_attention: disabled` logs this once at load, at info level:

```text
Model '<name>' sets `paged_attention: disabled`, which has no effect: GGUF models are served by llama.cpp, which manages its own KV cache. Remove the parameter to silence this message.
```

### Multi-Token Prediction Draft Heads

A multi-token prediction (MTP) draft head proposes the next tokens, and one forward pass of the model verifies them, so the model decodes more tokens per pass. Spice finds the draft head without configuration:

- A GGUF listed in `files` whose name starts with `mtp-` is a draft head for the model. Every other GGUF listed is a shard of the model.
- With no `mtp-` file listed, a GGUF that carries its own NextN layer drafts for itself. GLM-5.3-Flash is an example.

This Qwen3.8-Flash-Next model drafts with its separate head:

```yaml
models:
  - name: qwen3.8-flash-next
    from: huggingface:huggingface.co/mradermacher/Qwen3.8-Flash-Next-GGUF
    files:
      - path: Qwen3.8-Flash-Next.Q2_K.gguf
      - path: mtp-Qwen3.8-Flash-Next-Q8_0.gguf # optional: an MTP draft head
```

At temperature 0, a model that drafts returns the same text on every run. That text can differ from the text without a draft head where two tokens are nearly tied, because verification computes in batches.

A file whose name starts with `mtp-` but that carries no MTP layer fails the model's load:

```text
'<file>' is named as an MTP draft head (it starts with `mtp-`), but it carries no MTP layer. Remove it from `files`, or rename it if it is a shard of the model.
```

When a model cannot load with its own NextN layer, for example because it fits in memory only without that layer, the model loads without it and decodes without drafting. Spice logs this at info level:

```text
Model '<name>' loaded without its MTP layer, so it decodes without drafting: the model did not load with it. Cause: <reason>
```

### Structured Output and Tool Choice

A `response_format` of type `json_schema` or `json_object` is enforced with a grammar, so the reply is JSON that matches the schema, or a JSON object for `json_object`. For a reasoning model, the grammar applies after the reasoning block.

For a model whose chat template writes tool calls as `<tool_call>`, as Qwen and Hermes templates do, a request that sets both `response_format` and `tools` is answered with either a tool call or the schema's JSON. For other tool-call formats, the request is refused with HTTP 400:

```text
Model '<name>' can't combine a `json_schema` or `json_object` `response_format` with `tools`: its chat template's tool-call format can't be enforced alongside a schema. Send one or the other.
```

`tool_choice: required`, or a named function, forces one tool call through a grammar where the chat template uses `<tool_call>`. For other tool-call formats, generation cannot end until the model makes a call. A reply with no call fails with `Tool choice was required but no tools were called.`, as on mistral.rs.

### GGUF architectures

A GGUF model loads when llama.cpp supports its architecture, the `general.architecture` value in the file. For Spice releases that pin llama.cpp b11803, these are the supported architectures:

`afmoe`, `apertus`, `arcee`, `arctic`, `arwkv7`, `baichuan`, `bailingmoe`, `bailingmoe2`, `bailingmoe3`, `beam`, `bitnet`, `bloom`, `chameleon`, `chatglm`, `codeshell`, `cogvlm`, `cohere2`, `cohere2moe`, `command-r`, `dbrx`, `deci`, `deepseek`, `deepseek2`, `deepseek2-ocr`, `deepseek32`, `deepseek4`, `dots1`, `dots3note`, `ernie4_5`, `ernie4_5-moe`, `exaone`, `exaone-moe`, `exaone4`, `falcon`, `falcon-h1`, `flint`, `gemma`, `gemma2`, `gemma3`, `gemma3n`, `gemma4`, `glm-dsa`, `glm4`, `glm4moe`, `glm5-next`, `gpt2`, `gptj`, `gptneox`, `granite`, `granite_swa`, `granitehybrid`, `granitemoe`, `graniteswitch`, `grok`, `grovemoe`, `hrm_text`, `hunyuan-dense`, `hunyuan-moe`, `hunyuan_vl`, `hy_v3`, `hy_v4`, `internlm2`, `jais`, `jais2`, `jamba`, `k2-horizon`, `kimi-k3`, `kimi-linear`, `kolibri1`, `laguna`, `lfm2`, `lfm2moe`, `llama`, `llama4`, `maincoder`, `maion-coder`, `mamba`, `mamba2`, `maple`, `mellum`, `mimo2`, `minicpm`, `minicpm3`, `minimax-01`, `minimax-m2`, `minimax-m3`, `mistral3`, `mistral4`, `mpt`, `muse-glimmer`, `muse-spark`, `nanbeige`, `nemotron`, `nemotron_h`, `nemotron_h_moe`, `olmo`, `olmo2`, `olmoe`, `openelm`, `orion`, `paddleocr`, `pangu-embedded`, `phi2`, `phi3`, `phimoe`, `plamo`, `plamo2`, `plamo3`, `plm`, `qwen`, `qwen2`, `qwen2moe`, `qwen2vl`, `qwen3`, `qwen35`, `qwen35moe`, `qwen3moe`, `qwen3next`, `qwen3vl`, `qwen3vlmoe`, `qwen4exp`, `refact`, `rwkv6`, `rwkv6qwen2`, `rwkv7`, `seed_oss`, `sensenova_u1`, `smallthinker`, `smollm3`, `spark2_5`, `stablelm`, `starcoder`, `starcoder2`, `step35`, `talkie`, `xverse`.

The list omits the architectures llama.cpp provides for embedding, audio, scoring and speculative-draft models, which are not chat models. It omits `t5`, an encoder-decoder architecture, and the diffusion architectures `dream`, `llada`, `llada-moe` and `rnd1`: the engine generates one token at a time with a decoder alone, and runs no encoder pass and no diffusion sampling. It also omits `gpt-oss`: a gpt-oss GGUF is refused at load with the message below, because the engine does not yet read its Harmony replies. A GGUF whose architecture llama.cpp does not know fails to load with:

```text
Architecture '<architecture>' in <file> is not supported by this Spice release. Upgrade Spice, or use a GGUF of a supported architecture: https://spiceai.org/docs/components/models#gguf-architectures
```

Any other load failure carries llama.cpp's own reason, such as `invalid magic`.

## Model Provider Prefix

The model provider prefix identifies the source or provider of a model in Spice configuration files. This prefix is specified before the model identifier in the `from` field of a model definition, and is used in specifying model [default parameter overrides](#example-setting-default-parameter-overrides). It helps the runtime determine how to load and interact with the model.

The following provider prefixes are supported:

| Prefix       | Description                           |
| ------------ | ------------------------------------- |
| `openai`     | OpenAI or OpenAI-compatible endpoints |
| `azure`      | Azure OpenAI                          |
| `xai`        | xAI                                   |
| `anthropic`  | Anthropic                             |
| `google`     | Google Vertex AI                      |
| `hf`         | Hugging Face                          |
| `file`       | Local filesystem                      |
| `spiceai`    | Spice.ai Cloud Platform               |
| `databricks` | Databricks Mosaic AI                  |
| `bedrock`    | Amazon Bedrock                        |
| `typesafe`   | TypeSafe                              |

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

## Reasoning Effort for Local Models

A local model (`file` or `hf`) renders its chat template for every request, and the template decides whether the model reasons before it answers.

When neither the request nor the model's `params` sets `reasoning_effort`, the chat template applies its own default, as Hugging Face transformers does. Qwen3-family templates reason by default, DeepSeek-V4.1 answers directly unless asked to reason, and GLM-5.3 always reasons.

`reasoning_effort` in a [chat completion request](../api/HTTP/post-chat-completions) overrides that default:

| `reasoning_effort`               | What the chat template renders |
| -------------------------------- | ------------------------------ |
| `none`                           | Reasoning off                  |
| `minimal`                        | `low`                          |
| `low`, `medium`, `high`, `xhigh` | That level                     |

Not every template can honor every value. When a model loads, Spice renders its chat template with reasoning off, with nothing set, and at each level. A request for a value the template would not honor returns HTTP `400` instead of a reply the model would not have been asked for:

- `none`, for a template that always reasons:

  ```text
  invalid args: Model 'glm-5.3-flash' always reasons, so `reasoning_effort: none` can't turn reasoning off. Omit `reasoning_effort`, or set 'low' for the least reasoning. See: https://spiceai.org/docs/components/models
  ```

- a level the template ignores or rejects, for a template that takes only some levels:

  ```text
  invalid args: Model 'glm-5.3-flash' takes `reasoning_effort` 'low' or 'high', and ignores 'medium'. Set 'low' or 'high', or omit `reasoning_effort` for the model's default. See: https://spiceai.org/docs/components/models
  ```

A template with no reasoning control, such as Llama 3's, takes any value.

To set a default for every request, use the [model provider prefix](#model-provider-prefix): `file_reasoning_effort` or `hf_reasoning_effort`. A request's own `reasoning_effort` still takes precedence. A default the chat template cannot honor fails the model's load with the same message.

```yaml
models:
  - from: file://absolute/path/to/qwen3.gguf
    name: qwen3
    params:
      file_reasoning_effort: none
```

## Model Examples

The following examples demonstrate how to configure and use various models or model features with Spice. Each example provides a specific use case to help understand the configuration options available.

### Example: Configuring an OpenAI Model

To use a language model hosted on OpenAI (or compatible), specify the `openai` path and model ID in `from`. For more details, see [OpenAI Model Provider](models/openai).

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

To specify tools for an OpenAI model, include them in the `params.tools` field. For more details, see the [Tools documentation](../features/large-language-models/tools).

```yaml
models:
  - name: sql-model
    from: openai:gpt-4o
    params:
      tools: list_datasets, sql, table_schema
```

### Example: Adding Memory to a Model

To enable memory tools for a model, define a `store` memory dataset and specify `memory` in the model's `tools` parameter. For more details, see the [Memory documentation](../features/large-language-models/memory).

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

To set default overrides for parameters, use the [model provider prefix](#model-provider-prefix) followed by the parameter name. For more details, see the [Parameter Overrides documentation](../features/large-language-models/parameter_overrides).

```yaml
models:
  - name: pirate-haikus
    from: openai:gpt-4o
    params:
      openai_temperature: 0.1
      openai_response_format: { 'type': 'json_object' }
```

### Example: Configuring a System Prompt

To configure an additional system prompt, use the `system_prompt` parameter. For more details, see the [Parameter Overrides documentation](../features/large-language-models/parameter_overrides).

```yaml
models:
  - name: pirate-haikus
    from: openai:gpt-4o
    params:
      system_prompt: |
        Write everything in Haiku like a pirate
```

### Example: Serving a Local Model

To serve a model from the local filesystem, specify the `from` path as `file` and provide the local path. For more details, see [Filesystem Model Provider](models/filesystem).

```yaml
models:
  - from: file://absolute/path/to/my/model.gguf
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

Refer to the [Create Chat Completion API documentation](../api/HTTP/post-chat-completions) for more details on making chat completion requests.

import DocCardList from '@theme/DocCardList';

<DocCardList />
