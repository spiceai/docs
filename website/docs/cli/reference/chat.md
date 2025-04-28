---
title: 'chat'
sidebar_label: 'chat'
pagination_prev: null
pagination_next: null
---

Chat with a runtime [model](/docs/components/models/index.md) currently loaded by the Spice runtime.

### Requirements

- Spice runtime must be running
- At least one model configured in spicepod.yaml the model is ready

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

- `--cloud` Use cloud instance for chat (default: false)
- `--http-endpoint` HTTP endpoint for chat (default: `http://localhost:8090`)
- `--model` Model to chat with
- `--temperature` Model temperature for chat request (default 1)
- `--user-agent` User agent to use in all requests

### Example

Interactive session:

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

Single prompt:

```shell
> spice chat --model openai "hello"
Hello! How can I assist you today?

Time: 0.59s (first token 0.41s). Tokens: 18. Prompt: 8. Completion: 10 (53.39/s).
```
