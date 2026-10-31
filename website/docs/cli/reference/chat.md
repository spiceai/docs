---
title: 'chat'
sidebar_label: 'chat'
pagination_prev: null
pagination_next: null
description: 'spice chat CLI documentation'
---

Start an interactive or one-shot chat with a [model](../../components/models/) registered in the Spice runtime.

## Requirements

- Spice runtime must be running
- At least one model defined in `spicepod.yaml` and the model is ready

## Usage

### Interative Chat: Invoke the command without arguments to open a REPL

```shell
spice chat [flags]
```

### One-shot Chat: Pass a single message as the argument to send a one-shot chat request and print the response

```shell
spice chat [flags] [<message>]
```

## Flags

- `--model`, `-m` Target model for the chat request. When omitted, the CLI uses the single ready model or prompts for a choice if several models are ready.
- `--temperature <float>` Model temperature used for chat request.
- `--endpoint <endpoint>` Specifies the remote Spice instance HTTP endpoint (e.g., `http://localhost:8090`).
- `--headers <KEY:VALUE>` Custom HTTP headers in format `Key:Value` (can be specified multiple times).
- `--output <format>`, `-o` Output format: `table` (default) or `json`.

## Chat Completions and Responses API

Before it sends a message, `spice chat` asks the runtime's `/v1/models` endpoint whether the model supports the Responses API (the `supports_responses_api` metadata field). It chats with a model that does through [`/v1/responses`](../../api/HTTP/post-responses), and with any other model through [`/v1/chat/completions`](../../api/HTTP/post-chat-completions). Every chat model the runtime serves reports `supports_responses_api: true`: an OpenAI, Azure OpenAI, or xAI model serves the Responses API through its provider, and any other chat model serves it by translation through its chat completions. In v2.4.1 and earlier, only OpenAI, Azure OpenAI, and xAI models report it, and `spice chat` uses `/v1/chat/completions` for every other model. Hosted tools configured with `openai_responses_tools` on an [OpenAI](../../components/models/openai/#params) or [Azure OpenAI](../../components/models/azure) model, such as `web_search`, are attached only to Responses API requests, and only when the model also sets `tools` (for example, `tools: auto`). They work in `spice chat` for a model chatted with through `/v1/responses`. The model is chatted with through `/v1/responses` whether or not it sets `responses_api: enabled`.

A Responses API stream that ends before the response completes is reported as an error, and a response that stops early, for example at its output token limit, prints the same notice that the answer is incomplete as on `/v1/chat/completions`.

In v2.4.0 and earlier, `spice chat` sends every message to `/v1/chat/completions`, so hosted tools configured on the model are not available in `spice chat`.

## Examples

When exactly one model is **ready**, `spice chat` opens a REPL that uses that model automatically:

```shell
> spice chat
Using model: openai
chat> hello
Hello! How can I assist you today?

Time: 0.57s (first token 0.53s). Tokens: 18. Prompt: 8. Completion: 10 (325.04/s).
```

#### Remote and Cloud Examples

```shell
# Chat with Spice Cloud
spice chat --cloud --api-key "<your-api-key>" --model "<model>"

# Chat with a remote spiced instance over HTTP
spice chat --endpoint http://my-remote-host:8090 --model "<model>"

# Chat with a remote spiced instance over Arrow Flight SQL (gRPC)
spice chat --endpoint grpc://my-remote-host:50051 --model "<model>"
```

When multiple models are **ready**, the command prompts for a selection before starting the REPL:

```shell
> spice chat
Use the arrow keys to navigate: ↓ ↑ → ←
? Select model:
  ▸ openai
    llama
Using model: openai
chat> hello
Hello! How can I assist you today?

Time: 0.55s (first token 0.43s). Tokens: 18. Prompt: 8. Completion: 10 (80.09/s).
```

Passing `--model` skips the prompt and directs the request to the specified model. The flag works both in REPL mode and in one‑shot mode:

```shell
# REPL
spice chat --model openai
chat> hello
Hello! How can I assist you today?

Time: 0.61s (first token 0.58s). Tokens: 18. Prompt: 8. Completion: 10 (285.90/s).
```

Single prompt:

```shell
# One‑shot
spice chat --model openai "hello"
Hello! How can I assist you today?

Time: 1.10s (first token 0.80s). Tokens: 18. Prompt: 8. Completion: 10 (33.74/s).
```
