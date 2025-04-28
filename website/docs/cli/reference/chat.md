---
title: 'chat'
sidebar_label: 'chat'
pagination_prev: null
pagination_next: null
---

Start an interactive or one-shot chat with any [model](/docs/components/models/index.md) currently ready in the Spice runtime.

### Requirements

- Spice runtime must be running
- At least one model defined in `spicepod.yaml` and the model is ready

### Usage

#### Invoke the command without arguments to open a REPL

```shell
spice chat [flags]
```

#### Pass a message as the final argument to send a single prompt and print the response

```shell
spice chat [flags] <message>
```

#### Flags

- `--cloud` Send requests to a Spice Cloud instance instead of the local instance. Default: `false`.
- `--http-endpoint <string>` Runtime HTTP endpoint. Default: `http://localhost:8090`.
- `--model <string>` Target model for the chat request. When omitted, the CLI uses the single ready model or prompts for a choice if several models are ready.
- `--temperature <float32>` Model temperature used for chat request. Default: `1`.
- `--user-agent <string>` Custom `User-Agent` header sent with every request.

### Example

When exactly one model is **ready**, `spice chat` opens a REPL that uses that model automatically:

```shell
> spice chat
Using model: openai
chat> hello
Hello! How can I assist you today?

Time: 0.57s (first token 0.53s). Tokens: 18. Prompt: 8. Completion: 10 (325.04/s).
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
