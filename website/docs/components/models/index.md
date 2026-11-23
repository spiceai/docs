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

A model's `from` can be a URL that carries a credential, such as `https://user:password@host/model` or `?token=...`. The `Loading model [<name>] from <from>...` log line, an unknown-source load error, and the [`/v1/models`](../../api/HTTP/get-models) `owned_by` and `error_message` fields report `from` with the user info removed and credential query values replaced with `***`, as [`GET /v1/datasets` does](../../reference/spicepod/datasets.md#from). In v2.4.3 and earlier, they report `from` as configured.

In v2.4.0-rc.2 and earlier, a model that fails to load is not retried in the background. It loads again only when the runtime restarts, or when a change to the model's Spicepod definition reaches a runtime that watches the Spicepod; until then, the runtime stays not ready.

## Hosted Model Endpoint Timeouts and Response Limits

Spice holds hosted model endpoints to fixed timeouts and a response size limit, so an endpoint that stops answering cannot hang a request, and an oversized answer cannot exhaust the runtime's memory. The limits apply to [OpenAI](./openai/index.md) and OpenAI-compatible endpoints, [Azure OpenAI](./azure.md), [Anthropic](./anthropic.md) (including the [Messages API](../../features/large-language-models/messages.md)), [Databricks](./databricks.md), [xAI](./xai.md), and [Spice.ai](./spiceai.md) models, and to the model listings Spice requests from OpenAI, xAI, and Spice.ai. They are not configurable.

| Limit | Value | What it covers |
| --- | --- | --- |
| Connect timeout | 10 seconds | Time for the endpoint to accept a connection. |
| Read timeout | 10 minutes | Time for the endpoint to start its response, and then each gap between two parts of it. There is no limit on the total time, so a streamed response continues for as long as data keeps arriving. |
| Response size | 256 MiB | A response that is not streamed is read whole, up to 256 MiB after decompression. For a streamed response (a request with `"stream": true` that the endpoint answers successfully), each server-sent event is held to 256 MiB instead. |

A request that passes a limit fails with an error rather than waiting or buffering further. A streamed response that sends an event larger than the limit ends with the error `one server-sent event is larger than 268435456 bytes`. A compressed response that expands to more than 256 MiB fails too.

In v2.4.3 and earlier, the chat clients for these providers set no connect timeout, no read timeout, and no response size limit.

### Requests the endpoint never received

A network or load balancer can close a new connection while TLS is still being negotiated. A request is written only after the handshake completes, so the endpoint never received it, and Spice sends it again at once on a new connection, whatever its method. Spice also sends again an HTTP/2 request that the endpoint refused without processing it. Each request is sent again at most 2 times, and each client sends retries for at most 20% of its requests, with a floor of 10 retries a second, so an outage does not multiply the load on the endpoint.

Apart from an HTTP/2 request the endpoint refused without processing it, Spice does not send a request again after any part of it was sent, because the endpoint may have acted on it, or when the connection timed out, was refused, the host did not resolve, or the endpoint's certificate was not trusted. Those failures reach the caller as before. This applies to the providers above, Google Vertex AI, and the token exchanges for cloud credentials. In v2.4.3 and earlier, a request whose connection closed during the TLS handshake failed without a retry.

## Local GGUF Models

Spice serves a GGUF model on a single node, from the [`file`][file] or [`huggingface`][hf] provider, with [llama.cpp](https://github.com/ggml-org/llama.cpp). The model's file format selects the engine, so no Spicepod change is needed.

| Model                                                                                                       | Served by                     |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| GGUF on one node, `from: file:` or `from: huggingface:`                                                     | llama.cpp                     |
| GGUF with `distributed_backend: ring` (Enterprise), of an architecture llama.cpp splits by tensor           | llama.cpp, split across nodes |
| GGUF with `distributed_backend: ring` (Enterprise), of an architecture llama.cpp does not split by tensor   | mistral.rs, unchanged         |
| Safetensors                                                                                                 | mistral.rs, unchanged         |

The OpenAI-compatible API works the same way on both engines: streaming, `usage`, `finish_reason`, `reasoning_effort` and `reasoning_content` are unchanged, and so are the GGUF's own chat template and the `chat_template` and `context_length` parameters. Prompts are rendered and tool calls are parsed with the same code as on mistral.rs, so a GLM-5.3 tool call, which that parser does not read, stays unparsed on both engines. Each streamed tool call carries its own `index`.

On one node, llama.cpp decodes up to 8 requests to a model at once. When llama.cpp cannot create a context for 8 requests, or creating it would leave less than 2 GiB of memory free, the model serves fewer: 4, 2, or 1. The model logs how many it serves when it loads:

```text
Model '<name>' serves up to 8 requests at once from 8192 tokens of shared context memory; one request can use all of it. See: https://spiceai.org/docs/components/models
```

For most architectures, the requests running together share one context of `context_length` tokens, so their prompts and replies must fit it together. A request that does not fit waits until running requests finish. When a model is idle, any request whose prompt fits the context starts.

A conversation's prompt is kept between requests, so its next turn does not read the prompt again. When a request with a different prompt starts, the idle prompt moves from the model's cache to host memory, and the conversation's next turn restores it. Idle prompts take up to 8 GiB of host memory, and no more than half the memory the process can still use.

The `paged_attention` parameter has no effect on a GGUF model served by llama.cpp, which manages its own KV cache. It still applies to a GGUF model with `distributed_backend: ring` that mistral.rs serves. The parameter is read only for `from: file:` models, and a `from: file:` GGUF model on one node that sets `paged_attention: disabled` logs this once at load, at info level:

```text
Model '<name>' sets `paged_attention: disabled`, which has no effect: GGUF models are served by llama.cpp, which manages its own KV cache. Remove the parameter to silence this message.
```

When the GPU or another backend fails work that llama.cpp queued for a model, the request fails with an error, and no reply text is streamed from results the backend did not compute. The model's context decodes nothing more until the model is reloaded. The error names the backend's own reason after `llama.cpp reported:`, for example on Apple silicon:

```text
llama.cpp could not decode the batch: the GPU or another backend failed computing work this context queued, so its results are discarded and the context decodes nothing more; reload the model. llama.cpp reported: ggml_metal_synchronize: error: graph command buffer 1 failed with status 5; error: Invalid Resource (…)
```

### GGUF Models Split Across Nodes

Multi-node inference with `distributed_backend: ring` is a [Spice.ai Enterprise](https://spice.ai/docs/enterprise/getting-started/distributions) feature. Every node runs `spiced` with the same model definition, the same rank-ordered `nodes` list, and its own `node_rank`. Each node reads `general.architecture` from the header of the model's first GGUF file and asks the pinned llama.cpp whether it splits that architecture by tensor. When it does, llama.cpp serves the model split tensor-parallel across one or more GPUs on every node. Otherwise, mistral.rs's ring serves it, as in v2.4.0 and earlier.

For a model llama.cpp splits, the nodes take two roles:

- **The head** (`node_rank: 0`) serves its own GPU, waits up to 10 minutes for every other node to serve its GPU, then loads the model across all of them and serves the OpenAI-compatible API. Only the head reads the model's weights, so a `huggingface:` model is downloaded only on the head.
- **Every other node** serves its GPU and holds its share of the model for the head. Its load completes once it serves its GPU, and it refuses chat requests with:

  ```text
  Model '<name>' is served by the first machine in 'nodes' (<head>); this machine holds part of it. Set `head_url` to the address clients reach the head at to name it here.
  ```

The addresses in `nodes` are the ones the nodes reach each other at, which can be a private network that clients cannot reach. Set the `head_url` parameter to the `http` or `https` URL that clients reach the head at, and every other node names it when it refuses a request. For example, the model `params` on the node with `node_rank: 1`:

```yaml
params:
  distributed_backend: ring
  nodes: 10.42.9.100,10.42.2.102,10.42.0.101
  node_rank: 1
  head_url: http://192.168.1.100:8090
```

```text
Model '<name>' is served by the head at http://192.168.1.100:8090; this machine holds part of it, so send requests there.
```

`head_url` must be an `http` or `https` URL with a host; another value fails the model's load with an error that names `head_url`. Like `nodes` and `node_rank`, it is refused without `distributed_backend: ring`.

On every node, each [`/v1/models`](../../api/HTTP/get-models) entry for a model split across nodes includes `node_rank`: `0` on the head, which serves the model's requests, and the node's position in `nodes` on every other node. Clients can use it to find the node that serves the model before sending requests. A model that runs on one node, or that failed to load, has no `node_rank`, and the CSV format (`?format=csv`) omits the field.

The node at `node_rank` _r_ serves its GPU on port `12345` plus _r_, at its own address in `nodes`, and llama.cpp's connections between nodes use the ports 1000 above those. Each node needs a GPU that llama.cpp can use. These connections are neither authenticated nor encrypted, so every node must run `spiced` with [`--allow-insecure-connections`](../../cli/reference/spiced.md). Run the nodes only on a trusted private network: any host that reaches a node's GPU server can use that GPU. Without the flag, the model fails to load with:

```text
Model '<name>' is split across nodes over connections that are neither authenticated nor encrypted, so it loads only when spiced runs with `--allow-insecure-connections`. Start spiced with `--allow-insecure-connections` on every node in `nodes`, and only on a trusted private network: any host that reaches a node's GPU server can use that GPU.
```

### Multi-Token Prediction Draft Heads

A multi-token prediction (MTP) draft head proposes the next tokens, and one forward pass of the model verifies them, so the model decodes more tokens per pass. Spice finds the draft head without configuration:

- A GGUF listed in `files` whose name starts with `mtp-` is a draft head for the model. So is a GGUF whose header says it is a DFlash or DSpark drafter, whatever its file name. The other GGUFs listed are the model's shards, except vision projectors, importance matrices and files whose names mark them as drafters (`mmproj`, `imatrix`, `dflash-`, `eagle3-` or `dspark-` in the file name), unless only such files are listed beside the draft head.
- With no draft head listed, a GGUF that carries its own NextN layer drafts for itself. GLM-5.3-Flash is an example.
- A Hugging Face model that names a quantization instead of a file, or names no `files`, also loads the repository's draft head. See [Hugging Face `files`](huggingface/index.md#files).

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

A `response_format` of type `json_schema` or `json_object` is enforced with a grammar, so the reply is JSON that follows the schema, or a JSON object for `json_object`. llama.cpp builds the grammar from [a subset of JSON Schema](https://github.com/spiceai/llama.cpp/blob/b12600-spiceai.1/grammars/README.md#json-schemas--gbnf) and skips the rest without an error: for example, `minimum` and `maximum` apply only to an `integer`, not a `number`, and `uniqueItems` is not enforced. Validate such constraints in the application. For a reasoning model, the grammar applies after the reasoning block.

For a model whose chat template writes tool calls as `<tool_call>`, as Qwen and Hermes templates do, a request that sets both `response_format` and `tools` is answered with either a tool call or the schema's JSON. For other tool-call formats, a request that leaves the model to choose between a tool call and a reply (`tool_choice` unset or `auto`) is refused with HTTP 400:

```text
Model '<name>' can't combine a `json_schema` or `json_object` `response_format` with `tools`: its chat template's tool-call format can't be enforced alongside a schema. Send one or the other.
```

`tool_choice: none` offers no tool, so the reply is the schema's JSON in any template. `tool_choice: required`, or a named function, takes precedence over `response_format`: the turn is a tool call, and `response_format` applies to a later turn. Where the chat template uses `<tool_call>`, or writes [Harmony](#gpt-oss) or [Inkling](#inkling-2) messages, the call is forced through a grammar. For other tool-call formats, generation cannot end until the model makes a call. A reply with no call fails with `Tool choice was required but no tools were called.`, as on mistral.rs.

### GGUF architectures

A GGUF model loads when llama.cpp supports its architecture, the `general.architecture` value in the file. For Spice releases that pin llama.cpp b12600, these are the supported architectures:

`afmoe`, `apertus`, `arcee`, `arctic`, `arwkv7`, `baichuan`, `bailingmoe`, `bailingmoe2`, `bailingmoe3`, `beam`, `bitnet`, `bloom`, `chameleon`, `chatglm`, `clover_moe`, `codeshell`, `cogvlm`, `cohere2`, `cohere2moe`, `command-r`, `dbrx`, `deci`, `deepseek`, `deepseek2`, `deepseek2-ocr`, `deepseek32`, `deepseek4`, `deepseek41`, `domynedge`, `dots1`, `dots3note`, `ernie4_5`, `ernie4_5-moe`, `exaone`, `exaone-moe`, `exaone4`, `falcon`, `falcon-h1`, `flint`, `gemma`, `gemma2`, `gemma3`, `gemma3n`, `gemma4`, `glm-dsa`, `glm4`, `glm4moe`, `glm5-next`, `gpt-oss`, `gpt2`, `gptj`, `gptneox`, `granite`, `granite_swa`, `granitehybrid`, `granitemoe`, `graniteswitch`, `grok`, `grovemoe`, `hrm_text`, `hunyuan-dense`, `hunyuan-moe`, `hunyuan_vl`, `hy_v3`, `hy_v4`, `inkling2`, `inkling2_loop`, `internlm2`, `jais`, `jais2`, `jamba`, `k2-horizon`, `kimi-k3`, `kimi-k31`, `kimi-linear`, `kolibri1`, `laguna`, `lfm2`, `lfm2moe`, `lfm3`, `limite`, `llama`, `llama4`, `maincoder`, `maion-coder`, `mamba`, `mamba2`, `maple`, `mellum`, `metis16`, `mimo2`, `minicpm`, `minicpm3`, `minimax-01`, `minimax-m2`, `minimax-m3`, `mistral-large4`, `mistral3`, `mistral4`, `mpt`, `muse-glimmer`, `muse-spark`, `nanbeige`, `nemotron`, `nemotron_h`, `nemotron_h_moe`, `olmo`, `olmo2`, `olmoe`, `openelm`, `orion`, `paddleocr`, `pangu-embedded`, `phi2`, `phi3`, `phimoe`, `plamo`, `plamo2`, `plamo3`, `plm`, `qwen`, `qwen2`, `qwen2moe`, `qwen2vl`, `qwen3`, `qwen35`, `qwen35moe`, `qwen3moe`, `qwen3next`, `qwen3vl`, `qwen3vlmoe`, `qwen4exp`, `refact`, `ricursive`, `rwkv6`, `rwkv6qwen2`, `rwkv7`, `seed_oss`, `sensenova_u1`, `smallthinker`, `smollm3`, `spark2_5`, `stablelm`, `starcoder`, `starcoder2`, `step35`, `talkie`, `xing4_0`, `xverse`, `zaya1`.

The list omits the architectures llama.cpp provides for embedding, audio, speech, scoring and speculative-draft models, which are not chat models, such as `kokoro`, `zonos3`, and `tiny-voca`. It omits `t5`, an encoder-decoder architecture, and the diffusion architectures `dream`, `llada`, `llada-moe` and `rnd1`: the engine generates one token at a time with a decoder alone, and runs no encoder pass and no diffusion sampling. A GGUF of an encoder-decoder or diffusion architecture is refused at load with the message below. A GGUF whose architecture llama.cpp does not know fails to load with:

```text
Architecture '<architecture>' in <file> is not supported by this Spice release. Upgrade Spice, or use a GGUF of a supported architecture: https://spiceai.org/docs/components/models#gguf-architectures
```

Any other load failure carries llama.cpp's own reason, such as `invalid magic`.

#### gpt-oss

gpt-oss models write their replies in OpenAI's [Harmony format](https://cookbook.openai.com/articles/openai-harmony), a run of messages on named channels. The llama.cpp engine reads those messages token by token and returns them through the same OpenAI-compatible fields as other models:

- The `analysis` channel is returned as `reasoning_content`.
- The `final` channel, and a `commentary` message addressed to no tool, are returned as `content`.
- A message addressed to `functions.<name>`, a tool the request offers, is returned as a `tool_calls` entry with the message body as its JSON arguments, and `finish_reason` is `tool_calls`. A message addressed to a tool the request does not offer, such as gpt-oss's built-in `browser.search`, is dropped.

A GGUF whose chat template writes Harmony loads only when its vocabulary holds each Harmony marker (`<|start|>`, `<|channel|>`, `<|message|>`, `<|end|>`, `<|return|>`, `<|call|>`, and `<|constrain|>`) as a single token. Otherwise it is refused at load with the `is not supported by this Spice release` message above. In v2.4.1 and earlier, every gpt-oss GGUF was refused with that message.

#### Inkling 2

Inkling 2 and Inkling 2 Mini GGUFs (architectures `inkling2` and `inkling2_loop`) write each reply as a run of blocks marked by special tokens. The llama.cpp engine reads those blocks token by token, as llama.cpp's own server does, and returns them through the same OpenAI-compatible fields as other models:

- A thinking block (`<|content_thinking|>`) is returned as `reasoning_content`.
- A text block (`<|content_text|>`) is returned as `content`.
- A tool-call block (`<|content_invoke_tool_json|>`) whose header names a tool the request offers, and whose body is exactly `{"name": <that tool>, "args": <an object>}`, is returned as a `tool_calls` entry with `args` as its arguments, and `finish_reason` is `tool_calls`. Any other call block is dropped. With `parallel_tool_calls: false`, the reply ends at the first call.

A GGUF whose chat template writes Inkling messages loads only when its vocabulary holds each Inkling marker as a single token. Otherwise it is refused at load with the `is not supported by this Spice release` message above. Inkling does not write tool calls as `<tool_call>`, so a request that sets both `response_format` and `tools` and leaves the model to choose is refused with HTTP 400, as [Structured Output and Tool Choice](#structured-output-and-tool-choice) describes for other tool-call formats. Unlike those formats, a required or named call on an Inkling model is forced through a grammar over the Inkling markers, as with `<tool_call>` templates, and so is a `response_format` without tools.

## Message Content Parts for Local Models

A chat message's `content` can be a string or an array of parts, such as `[{"type": "text", "text": "..."}]`. A model served locally from the [`file`][file] or [`huggingface`][hf] provider, on llama.cpp or mistral.rs, renders text parts the way [llama-server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server) does, for every role. When a model loads, Spice checks whether its chat template reads `content` as a string, as an array of text parts, or both, and fits each message to it:

- A template that reads both receives each message as sent.
- A template that reads only strings receives the text of the parts joined with newlines.
- A template that reads only parts receives a string as one text part.

Some chat templates render a system or developer message only at the start of a conversation: they leave a later one out of the prompt, or fail with an error such as `System message must be at the beginning`. Clients such as coding agents send system messages after the first user message. When a model loads, Spice also renders a system and a developer message after a user message, and for a template that does not render it with its text, such a message reaches the template as a user's. Its text is joined to the user message before it after a blank line, or becomes a user message of its own when the message before it is not a user's, such as a tool result. The message keeps its place, so the prompt before it is unchanged and a cached prompt prefix still matches. A template that renders a later system message gets it as sent.

A local model receives only text: neither engine passes images, audio, or files to the model, including a model loaded with a multimodal `model_type`. A user message that contains an `image_url`, `input_audio`, or `file` part is refused with HTTP 400, and the error names the model and the part:

```text
Model '<name>' reads only text, so it cannot take the `image_url` part of a user message. Send the message's content as text, or use a model that accepts image input.
```

In v2.4.1 and earlier, a user message's text parts reached the chat template as a single value that held only the last part, and a chat template that reads typed parts, such as Qwen3.5's, failed the request with `Unexpected item type in content`. A system, developer, tool, or assistant message's parts were rendered into the prompt as JSON text.

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

A streamed chat completion from a local model carries the reasoning as the model generates it, in `choices[].delta.reasoning_content`, the streamed counterpart of the `message.reasoning_content` that a non-streamed response returns. A chunk without reasoning has no `reasoning_content` field. In v2.4.2 and earlier, a streamed reply carried no reasoning.

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
