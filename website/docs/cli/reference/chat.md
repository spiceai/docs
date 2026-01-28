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

- `--cloud` Use a Spice Cloud instance for chat. Requires `--api-key`.
- `--endpoint <endpoint>` Specifies the remote Spice instance endpoint. Supports `http://`, `https://`, `grpc://`, or `grpc+tls://` schemes. For example, `--endpoint http://my-remote-host:8090` (HTTP) or `--endpoint grpc://my-remote-host:50051` (Arrow Flight/gRPC).
- `--http-endpoint <endpoint>` (Deprecated) Runtime HTTP endpoint. Default: `http://localhost:8090`.
- `--model <string>` Target model for the chat request. When omitted, the CLI uses the single ready model or prompts for a choice if several models are ready.
- `--temperature <float32>` Model temperature used for chat request. Default: `1.0`.
- `--user-agent <string>` Custom `User-Agent` header sent with every request.
- `--responses` Direct all chats to the `/v1/responses` endpoint, which exposes configured models that support [OpenAI's Responses API](https://platform.openai.com/docs/api-reference/responses) and enables access to [OpenAI-hosted tools](https://platform.openai.com/docs/guides/tools). To learn more about Spice's support for OpenAI's Responses API, view the [OpenAI model provider documentation](../../components/models/openai) or the [Azure OpenAI model provider documentation](../../components/models/azure).

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
spice chat --cloud --api-key <your-api-key> --model <model>

# Chat with a remote spiced instance over HTTP
spice chat --endpoint http://my-remote-host:8090 --model <model>

# Chat with a remote spiced instance over Arrow Flight SQL (gRPC)
spice chat --endpoint grpc://my-remote-host:50051 --model <model>
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
