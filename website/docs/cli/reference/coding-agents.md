---
title: 'Coding agents'
sidebar_label: 'Coding agents'
pagination_prev: null
pagination_next: null
description: 'Run Claude Code, Codex CLI, GitHub Copilot CLI, Cursor CLI, Grok Build, OpenCode, pi, the Antigravity CLI, or Orca with the Spice runtime as the model backend.'
---

`spice claude`, `spice codex`, and the other coding agent commands run a coding agent with the Spice runtime as its model backend. The agent sends its model requests to a model defined in the Spicepod, from any [model provider](../../components/models/). `spice orca` runs [Orca](https://github.com/stablyai/orca) with every agent it starts on the Spice runtime.

The coding agent commands are not available in v2.4.1 and earlier.

## Usage

```shell
spice [spice options] <agent> [AGENT_ARGS]...
spice [spice options] orca [ORCA_ARGS]...
```

Every argument after the command name is passed to the agent unchanged, so `spice codex --yolo` runs `codex --yolo` with Codex pointed at the Spice runtime. Options for `spice` itself, such as `--http-endpoint` and `--api-key`, go before the command name. `spice claude --help` shows Claude Code's own help; `spice help claude` shows the help of the `spice claude` command.

| Command          | Agent                                                                 | Spice endpoint the agent calls                                                  |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `spice claude`   | [Claude Code](https://code.claude.com/docs/en/setup)                  | [`/v1/messages`](../../features/large-language-models/messages.md)              |
| `spice codex`    | [Codex CLI](https://developers.openai.com/codex/cli)                  | [`/v1/responses`](../../api/HTTP/post-responses)                                |
| `spice copilot`  | [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli) | [`/v1/chat/completions`](../../api/HTTP/post-chat-completions)           |
| `spice cursor`   | [Cursor CLI](https://cursor.com/docs/cli/overview), local-agent build | `/v1/chat/completions`                                                          |
| `spice grok`     | [Grok Build](https://docs.x.ai/build/overview)                        | `/v1/chat/completions`                                                          |
| `spice opencode` | [OpenCode](https://opencode.ai/docs/)                                 | `/v1/chat/completions`                                                          |
| `spice pi`       | [pi](https://pi.dev)                                                  | `/v1/chat/completions`                                                          |
| `spice agy`      | [Antigravity CLI](https://antigravity.google/docs/install/)           | The Gemini API, `/v1beta/models`                                                |

The agent must be installed and on `PATH`. When it is not, the command fails with the agent's install instructions. Cursor's public CLI, `cursor-agent`, sends every request to Cursor's servers and cannot use another model endpoint; `spice cursor` needs Cursor's local-agent build, `cursor-agent-local`.

The coding agent commands run against a runtime on the same machine. They do not accept `--cloud`.

## Choosing the Model

The agent's own model option selects the Spice model, using a name from [`spice models`](models.md):

```shell
spice claude --model my-model
spice codex -m my-model
spice opencode -m spice/my-model
spice pi --model spice/my-model
```

OpenCode and pi name models with their provider, so a Spice model is `spice/<name>` there. A Spice model named without the `spice/` provider is refused with the argument to use instead.

Without a model option, the agent starts on the runtime's only model. When the runtime serves several models, `spice` asks which one to use in an interactive terminal, and otherwise fails with the list of models. Every model the runtime serves is available to the agent during the session. `spice` waits for the chosen model to load before it starts the agent.

When [`/v1/models`](../../api/HTTP/get-models) reports a model's `context_window` and `max_output_tokens`, `spice` passes them to Claude Code, Codex CLI (the context window only), GitHub Copilot CLI, OpenCode, and pi, so the agent sizes its context to the model. The runtime reports these limits when it knows them, for example a local GGUF model's context size or the limits a hosted provider lists for the model, and omits them otherwise.

## The Runtime

`spice` uses the runtime already serving at the HTTP endpoint, `http://127.0.0.1:8090` by default or the value of `--http-endpoint`. When no runtime is serving, `spice` starts one for the Spicepod in the current directory. A runtime at the default endpoint must serve the Spicepod in the current directory, when there is one; pass `--http-endpoint` to use another runtime.

A runtime that a coding agent command started is shared by the other coding agent sessions that use the same endpoint, and is stopped when the last of them exits. Its output is written under `~/.spice/run/`. A runtime started any other way, such as with [`spice run`](run.md), is left running.

When the runtime has [API key authentication](../../api/auth/index.md) enabled, pass the key with `spice --api-key <key> <agent>`. The agent sends that key to Spice. Spice does not forward it to model providers, which receive the credentials in each model's `params`.

## Agent Configuration

`spice` does not edit the agent's configuration files. It points the agent at Spice for the session with environment variables, command-line overrides, or files in a temporary directory that is removed when the agent exits.

- **Claude Code** receives its routing in both the environment and a `--settings` file, which takes precedence over the user's and the project's settings files. A `--settings` value passed to `spice claude` is merged into it.
- **Grok Build** reads endpoint settings from its own configuration files that nothing on the command line overrides. `spice grok` refuses to start when `endpoints.models_base_url` or `endpoints.models_list_url` in those files points anywhere other than the Spice runtime, and names the file and key to remove.

## Orca

`spice orca` runs Orca on a profile of its own under `~/.spice/orca`, in which each agent above runs as `spice <agent>`. Every agent session Orca starts there uses the Spice runtime, on any model in the Spicepod. The user's own Orca profile is not read or changed.

Every argument after `orca` is passed to Orca's `orca` command, run against that profile. With no arguments, `spice orca` runs `orca open`, which opens the Orca app. `spice` adds the current git repository to Orca's projects, and keeps a runtime it started while the Orca it opened runs.

## Examples

```shell
spice claude                                   # the runtime's only model, or choose one
spice codex -m my-model                        # a model listed by `spice models`
spice copilot --help                           # GitHub Copilot CLI's own help
spice --http-endpoint http://127.0.0.1:9000 claude
spice orca                                     # open Orca
spice orca serve                               # a headless Orca server
```

## Limitations

- An `openai` model whose `endpoint` is an OpenAI-compatible server keeps using that server's own Responses API for `/v1/responses`. A server that answers the Responses API in a form Spice cannot read, such as the llama.cpp server, fails `spice codex` on that model while `/v1/chat/completions` works. See [spiceai/spiceai#15649](https://github.com/spiceai/spiceai/issues/15649).
- On a model that serves `/v1/responses` by translation, requests that use `previous_response_id`, `conversation`, `background: true`, or `input_file` content are refused with a `400` that names the field.
