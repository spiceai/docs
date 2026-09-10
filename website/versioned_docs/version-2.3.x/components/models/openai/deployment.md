---
title: 'OpenAI Model Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the OpenAI model in production: API keys, usage tiers, rate limiting, Responses API, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - models
  - openai
  - observability
---

Production operating guide for the OpenAI model provider (and OpenAI-compatible endpoints) covering authentication, usage-tier-based rate limiting, the Responses API, and observability.

## Authentication & Secrets

| Parameter                | Description                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `openai_api_key`         | OpenAI API key. Use `${secrets:...}` to resolve from a configured secret store.                                             |
| `openai_org_id`          | OpenAI organization ID (optional).                                                                                          |
| `openai_project_id`      | OpenAI project ID (optional).                                                                                               |
| `endpoint`               | Endpoint override. Defaults to `https://api.openai.com/v1`. Set for OpenAI-compatible providers (Azure OpenAI, Groq, etc.). |

API keys must be sourced from a [secret store](../../secret-stores/) in production. Rotate keys periodically; OpenAI dashboard tracks per-key usage which helps with rotation planning.

### OpenAI-Compatible Providers

Set `endpoint` to target any OpenAI-compatible provider (Azure OpenAI, xAI, Groq, Together, on-prem vLLM, etc.). See the [OpenAI model reference](./) for provider-specific configuration examples. The `/v1/responses` endpoint works with all OpenAI-compatible providers through automatic format adaptation. When setting `responses_api: enabled` (which proxies Chat Completions through the Responses API backend), confirm the target provider implements OpenAI's Responses API natively.

## Resilience Controls

### Usage Tier Rate Limiting

| Parameter            | Default | Description                                                                                           |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `openai_usage_tier`  | `tier1` | OpenAI account [usage tier](https://platform.openai.com/settings/organization/limits). Accepted values: `free`, `tier1`, `tier2`, `tier3`, `tier4`, `tier5`. |

Tier selection governs the internal rate controller's concurrency + per-minute budget:

| Tier        | Max concurrency | Requests / minute |
| ----------- | --------------- | ----------------- |
| `free`      | 1               | 100               |
| `tier1`     | 35              | 3,000             |
| `tier2`     | 60              | 5,000             |
| `tier3`     | 60              | 5,000             |
| `tier4`     | 125             | 10,000            |
| `tier5`     | 125             | 10,000            |

Override tier defaults per model via global model parameters:

| Parameter                      | Description                                         |
| ------------------------------ | --------------------------------------------------- |
| `max_concurrency`              | Override the per-model concurrency budget.          |
| `requests_per_minute_limit`    | Override the per-model RPM budget.                  |

The built-in rate controller queues and paces outbound requests to stay within these budgets, avoiding the tight loop of hitting the OpenAI rate limiter and retrying.

### Retry Behavior

**Chat Completions / Responses** requests rely on the rate controller for pacing; there is no application-level retry loop around the chat/responses path. Transient 429 / 5xx responses surface to the caller.

**Embeddings** (see the [OpenAI Embedding Deployment Guide](../../embeddings/openai/deployment)) implement an application-level retry with fibonacci backoff and a 10-retry cap.

### Responses API

All configured models are registered for the `/v1/responses` endpoint. For OpenAI-compatible providers, Spice automatically adapts between Chat Completions and Responses API formats, so `/v1/responses` works even when the backend only supports `/v1/chat/completions`.

| Parameter              | Default    | Description                                                                                    |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| `responses_api`        | `disabled` | Controls the Chat Completions backend. `disabled` proxies `/v1/chat/completions` to the backend's `/v1/chat/completions`. `enabled` proxies `/v1/chat/completions` to the backend's `/v1/responses`, which can improve tool-use and reasoning for providers that natively support the Responses API. |
| `openai_responses_tools`| -         | Comma-separated list of OpenAI-hosted tools (`code_interpreter`, `web_search`, `web_search_preview`) exposed via Responses. |

Note: Responses API hosted tools are **not** available from the `/v1/chat/completions` endpoint.

`web_search` selects OpenAI's current web search tool. `web_search_preview` selects the legacy tool, retained for older models that do not support the current one.

## Capacity & Sizing

- **Context window**: Driven by the selected model (e.g., `gpt-4o-mini`: 128k). Spice does not enforce context trimming — prompt and history management is the caller's responsibility.
- **Concurrency**: Set by `openai_usage_tier` or explicit `max_concurrency`. For high-throughput workloads, upgrade the OpenAI tier rather than over-subscribing the rate limiter.
- **Latency**: Bounded by OpenAI's server-side latency plus network RTT. Streaming (`stream=true`) begins emitting tokens quickly and is preferred for chat interfaces.

## Metrics

All LLM requests (OpenAI, Hugging Face, filesystem) share a common metric namespace:

| Metric                              | Type      | Description                                     |
| ----------------------------------- | --------- | ----------------------------------------------- |
| `llm_requests`                      | Counter   | Total LLM requests issued.                      |
| `llm_failures`                      | Counter   | Total LLM request failures.                     |
| `llm_internal_request_duration_ms`  | Histogram | Request latency (client-side).                  |
| `llm_prompt_tokens_total`           | Counter   | Total prompt tokens sent.                       |
| `llm_completion_tokens_total`       | Counter   | Total completion tokens received.               |

Requests routed through the Responses API carry a `responses_api` label for differentiation.

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Chat and Responses operations emit these [task history](../../../reference/task_history) spans:

| Span             | Fields                               | Description                                             |
| ---------------- | ------------------------------------ | ------------------------------------------------------- |
| `ai_completion`  | `stream=true|false`, usage tokens    | Chat Completions request.                               |
| `responses`      | `stream=true|false`, usage tokens    | Responses API request.                                  |
| `health`         | -                                    | Health probe against the endpoint (chat or responses).  |

`captured_output` and token usage fields are logged in task-history entries.

## Known Limitations

- **No automatic token counting for rate limiting**: The rate controller counts requests, not tokens. Token-level rate limits imposed by OpenAI (TPM) are not pre-checked; excess requests surface as 429 errors.
- **No chat/responses application retry**: Retries for chat/responses are not implemented at the Spice layer. Pace via `max_concurrency`/`requests_per_minute_limit` to stay under rate limits.
- **OpenAI-compatible providers vary**: Not every OpenAI-compatible provider implements every parameter (e.g., `responses_api`, `openai_reasoning_effort`). Test against your specific provider.

## Troubleshooting

| Symptom                                      | Likely cause                                           | Resolution                                                                                           |
| -------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `401 Unauthorized`                           | Wrong / revoked API key.                               | Rotate the key, update the secret store.                                                             |
| `429 rate_limit_exceeded`                    | Tier budget too low or burst exceeds concurrency.      | Raise `openai_usage_tier`, reduce `max_concurrency`, or upgrade the OpenAI tier.                     |
| `429 tokens_per_min` errors despite pacing   | Spice rate-limits requests, not tokens.                | Reduce per-request token budget; throttle via `max_concurrency`.                                     |
| Responses API returns `404`                  | Provider does not implement Responses natively and `responses_api: enabled` is set. | Set `responses_api: disabled` (default) to use the automatic Chat Completions adapter for `/v1/responses`. |
| Slow first-token latency                     | `stream=false` waits for full completion.              | Use `stream=true` for interactive chat.                                                              |
