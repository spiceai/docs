---
title: 'Gemini API'
sidebar_label: 'Gemini API'
description: 'Serve the Gemini API on /v1beta/models with any chat model in the Spicepod, so Gemini clients such as the Antigravity CLI work by pointing their base URL at Spice.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - models
  - llm
  - api
---

Spice serves the [Gemini API](https://ai.google.dev/api/generate-content) on `/v1beta/models`. Gemini clients, such as the Antigravity CLI that [`spice agy`](../../cli/reference/coding-agents.md) starts, work against Spice by setting their base URL to the Spice HTTP endpoint. The model in the URL names any chat model in the Spicepod, from any provider.

The endpoints need no configuration: they are available whenever the runtime serves models, alongside [`/v1/chat/completions`](../../api/HTTP/post-chat-completions) and the [Messages API](messages.md).

| Method and path                                    | Gemini API method                                                                 |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `GET /v1beta/models`                               | [`models.list`](https://ai.google.dev/api/models#method:-models.list)             |
| `GET /v1beta/models/{model}`                       | [`models.get`](https://ai.google.dev/api/models#method:-models.get)               |
| `POST /v1beta/models/{model}:generateContent`       | [`models.generateContent`](https://ai.google.dev/api/generate-content#method:-models.generatecontent) |
| `POST /v1beta/models/{model}:streamGenerateContent` | [`models.streamGenerateContent`](https://ai.google.dev/api/generate-content#method:-models.streamgeneratecontent) |
| `POST /v1beta/models/{model}:countTokens`           | [`models.countTokens`](https://ai.google.dev/api/tokens#method:-models.counttokens), always refused (see [Limits](#limits)) |

## Quickstart

Define one or more chat models in `spicepod.yaml`:

```yaml
models:
  - from: openai:gpt-4o-mini
    name: gpt
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }
```

Start the runtime with `spice run`, then send a `generateContent` request that names the Spicepod model:

```bash
curl -X POST http://localhost:8090/v1beta/models/gpt:generateContent \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"role": "user", "parts": [{"text": "Hello!"}]}]
  }'
```

The response is a Gemini API `GenerateContentResponse`, with `modelVersion` set to the Spicepod model name:

```json
{
  "candidates": [
    {
      "content": { "role": "model", "parts": [{ "text": "Hello! How can I help?" }] },
      "finishReason": "STOP",
      "index": 0
    }
  ],
  "usageMetadata": { "promptTokenCount": 3, "candidatesTokenCount": 6, "totalTokenCount": 9 },
  "modelVersion": "gpt"
}
```

`POST /v1beta/models/gpt:streamGenerateContent?alt=sse` streams the response as server-sent events, one `GenerateContentResponse` per event. Without `alt=sse`, `:streamGenerateContent` returns the responses as one JSON array once the model finishes.

`GET /v1beta/models` lists the Spicepod's chat models, sorted by name, each as `models/<name>` with `generateContent` as its supported method. A model's `inputTokenLimit` is set when the runtime knows its context window, less its output limit when it has one, and `outputTokenLimit` when the runtime knows its output limit.

## Authentication

Without [`runtime.auth`](../../api/auth/index.md), Spice does not check an API key, so a client that requires one can send any value. With `runtime.auth` configured, send a Spice API key in `x-goog-api-key`, the header Google's SDKs send, or in `X-API-Key` or `Authorization: Bearer`. Spice authenticates the client with this key and never forwards it to the model provider, which receives the credentials in the model's `params`.

## How Models Serve the Gemini API

Every chat model serves the Gemini API by translation: Spice converts the request into a chat completion for the model and converts the answer back into a Gemini API response. The system instruction, the turns with their text, images, function calls and function responses, the declared functions and `toolConfig`, and the sampling and output settings of `generationConfig` are carried over.

Some fields are accepted and have no effect, because a chat completion has no equivalent and the model's own behavior stands in:

- `safetySettings`: the chat model applies its own safety.
- `generationConfig.topK`: a chat completion has no top-k sampling.
- `generationConfig.thinkingConfig`: a chat completion has no per-request reasoning budget. A reasoning model's effort is its Spicepod `reasoning_effort` param. The response carries no `thought` parts.
- Tools that Google runs, such as `googleSearch`, `codeExecution`, and `urlContext`: only the declared functions are offered to the model.
- Earlier turns' reasoning (parts marked `thought`) and `thoughtSignature` values.

A field that would change the answer is refused with a `400` `INVALID_ARGUMENT` error that names it, rather than dropped: more than one candidate, cached content, media other than images, data referenced by URI, code execution history, and output other than text or JSON. A request with no `contents` is refused the same way.

A [decision model](../../components/models/typesafe.md) does not serve chat completions or the Gemini API, and a request that names one is refused with a `400` that points to `POST /v1/decisions`.

## Limits

- `:countTokens` is always refused with a `400` `INVALID_ARGUMENT` error, because a token count is specific to the model's tokenizer, which a chat completion does not expose. The `usageMetadata` of a `generateContent` response counts the prompt.
- A model in the URL that is not in the Spicepod returns `404` with a `NOT_FOUND` error, and a model that failed to load returns `503` with `UNAVAILABLE`.

## Errors

Every error from the `/v1beta/models` routes uses the Gemini API's error body, including authentication failures and errors from the layers in front of the handlers, such as a request body that is too large, so Gemini clients read every error the same way:

```json
{
  "error": {
    "code": 400,
    "message": "The request body is not a valid request: missing field `contents`",
    "status": "INVALID_ARGUMENT"
  }
}
```

The response keeps the HTTP status of the failure, such as `401` for a missing API key or `413` for an oversized body. A streamed response that fails after it started sends the same error body as its last event.
