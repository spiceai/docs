---
title: 'Anthropic Messages API'
sidebar_label: 'Messages API'
description: 'Serve the Anthropic Messages API on POST /v1/messages with any chat model in the Spicepod, so Anthropic SDKs and tools such as Claude Code work by pointing their base URL at Spice.'
sidebar_position: 9
pagination_prev: null
pagination_next: null
tags:
  - models
  - llm
  - api
---

Spice serves the [Anthropic Messages API](https://docs.claude.com/en/api/messages) on `POST /v1/messages` and `POST /v1/messages/count_tokens`. Anthropic SDKs and tools, such as Claude Code and the Claude Agent SDK, work against Spice by setting their base URL to the Spice HTTP endpoint. The request's `model` names any chat model in the Spicepod, from any provider.

The endpoint needs no configuration: it is available whenever the runtime serves models, alongside [`/v1/chat/completions`](../../api/HTTP/post-chat-completions) and [`/v1/responses`](../../api/HTTP/post-responses).

## Quickstart

Define one or more chat models in `spicepod.yaml`:

```yaml
models:
  - from: anthropic:claude-sonnet-4-6
    name: claude
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }

  - from: openai:gpt-4o-mini
    name: gpt
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }
```

Start the runtime with `spice run`, then send a Messages API request that names a Spicepod model:

```bash
curl -X POST http://localhost:8090/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

The response is a Messages API `message`:

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "model": "claude",
  "content": [{ "type": "text", "text": "Hello! How can I help you today?" }],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": { "input_tokens": 10, "output_tokens": 12 }
}
```

Set `"stream": true` to receive the response as server-sent events, each named by its `type`, as the Messages API streams them. The same request with `"model": "gpt"` is answered by the OpenAI model.

### Using an Anthropic SDK

Point the SDK's base URL at Spice. The SDK appends `/v1/messages` itself:

```python
import anthropic

client = anthropic.Anthropic(base_url="http://localhost:8090", api_key="unused")

message = client.messages.create(
    model="claude",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
print(message.content[0].text)
```

The SDK requires an API key. Without [`runtime.auth`](../../api/auth/index.md), Spice does not check it, so any value works. With `runtime.auth` configured, pass a Spice API key: Spice reads it from the `x-api-key` header or from `Authorization: Bearer`, the two headers Anthropic SDKs send. Spice authenticates the client with this key and never forwards it to the model provider, which receives the credentials in the model's `params`.

### Using Claude Code

Set `ANTHROPIC_BASE_URL` to the Spice HTTP endpoint and select a Spicepod model by its name:

```bash
ANTHROPIC_BASE_URL=http://localhost:8090 claude --model claude
```

Claude Code names a model in every request, and Spice answers only names defined in the Spicepod. Claude Code can also send some requests to a second, smaller model; set it to a Spicepod model name as well, using the environment variables described in [Claude Code model configuration](https://docs.claude.com/en/docs/claude-code/model-config). A request for a name that is not in the Spicepod returns `404` with a `not_found_error`.

## How Models Serve the Messages API

A model with `from: anthropic` serves the Messages API natively. Spice sends the request to Anthropic as the client sent it, including every content block, tool, `anthropic-beta` header, and stream event, and replaces the model name with the model's Anthropic model ID. The response's `model` is the Spicepod model name. The model's `system_prompt`, [parameter overrides](parameter_overrides.md), and [Spice tools](tools.md) apply.

Every other chat model serves the Messages API by translation: Spice converts the request into a chat completion for the model and converts the answer back into a Messages API response. A field that a chat completion can carry is carried over. A field that only changes how Anthropic serves a request is accepted and has no effect: `cache_control`, a tool's `eager_input_streaming`, `service_tier`, `speed`, `context_management`, `fallbacks`, `diagnostics`, `thinking`, and `output_config.effort`. Any other field that a chat completion cannot carry, such as `top_k`, `container`, `mcp_servers`, a tool field such as `defer_loading`, or an unknown field, is refused with a `400` `invalid_request_error` that names it, rather than dropped:

```text
Model 'gpt' serves the Messages API by translating requests into chat completions, which cannot carry `container`. Remove `container`, or use a model with `from: anthropic`. See: https://spiceai.org/docs/components/models
```

Translation has these limits:

- Reasoning is not streamed: the chat completions stream carries no reasoning.
- A response that stopped on a matched stop sequence reports `stop_reason: end_turn`.
- `POST /v1/messages/count_tokens` is refused with a `400`, because a token count is specific to the model's tokenizer. Only a `from: anthropic` model counts tokens.

A [decision model](../../components/models/typesafe.md) serves neither chat completions nor the Messages API, and a request that names one is refused with a `400` that points to `POST /v1/decisions`.

## Spice Tools

When a model's `tools` param enables [Spice tools](tools.md), Spice offers them to the model beside the client's own tools and runs the calls the model makes to them, on every model, native or translated. The response carries each Spice tool call as an `mcp_tool_use` block with `server_name: "spice"`, followed by its result as an `mcp_tool_result` block, the Messages API's shape for a tool call the server ran. A client that keeps the conversation history sends these blocks back unchanged, and Spice replays them to the model as the tool calls and results it made.

When the model also calls one of the client's tools, Spice runs its own calls and the response ends with `stop_reason: tool_use`, for the client to run the rest. When the model is still calling Spice tools after [`tool_recursion_limit`](tools.md#tool-recursion-limit) rounds, Spice runs the last round's calls and the response ends with `stop_reason: pause_turn`. The client continues by sending the conversation back, as it does for Anthropic's own server tools. A `tool_recursion_limit` of `0` sends each request to the model without Spice tools.

## Errors

Every error from `/v1/messages` and `/v1/messages/count_tokens` uses the Messages API error envelope and status codes, including authentication failures, so Anthropic SDKs raise their typed exceptions:

```json
{
  "type": "error",
  "error": { "type": "not_found_error", "message": "model 'claud' not found" }
}
```

A request without `model` is refused with `400` and the message `model: Field required`. A model that failed to load returns `503` with an `api_error`. An error that Anthropic returns to a native request is passed through with its status, message, and `request_id`.
