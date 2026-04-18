---
title: 'OpenAI Embedding Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the OpenAI embedding provider in production: API keys, usage tiers, batching, retries, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - embeddings
  - openai
  - observability
---

Production operating guide for the OpenAI embedding provider (and OpenAI-compatible endpoints) covering authentication, usage-tier rate limiting, batching, retries, and observability.

## Authentication & Secrets

| Parameter                                 | Description                                                                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `openai_api_key` / `api_key`              | OpenAI API key. Use `${secrets:...}` to resolve from a configured secret store.                                             |
| `openai_org_id` / `org_id`                | OpenAI organization ID (optional).                                                                                          |
| `openai_project_id` / `project_id`        | OpenAI project ID (optional).                                                                                               |
| `openai_usage_tier` / `usage_tier`        | OpenAI account [usage tier](https://platform.openai.com/settings/organization/limits).                                      |
| `endpoint`                                | Endpoint override. Defaults to `https://api.openai.com/v1`. Set for OpenAI-compatible providers (Azure OpenAI, etc.).       |

API keys must be sourced from a [secret store](../../secret-stores/) in production. Aliases exist for credential parameters: `api_key` ↔ `openai_api_key`, `org_id` ↔ `openai_org_id`, etc.

### OpenAI-Compatible Providers

Set `endpoint` to route embeddings through any OpenAI-compatible provider (Azure OpenAI, Together, vLLM, Groq, local Ollama with the OpenAI-compat endpoint). Verify the provider implements `/v1/embeddings`.

## Resilience Controls

### Usage Tier Rate Limiting

Tier selection governs the internal rate controller:

| Tier        | Max concurrency | Requests / minute |
| ----------- | --------------- | ----------------- |
| `free`      | 1               | 100               |
| `tier1`     | 35              | 3,000             |
| `tier2`     | 60              | 5,000             |
| `tier3`     | 60              | 5,000             |
| `tier4`     | 125             | 10,000            |
| `tier5`     | 125             | 10,000            |

### Batching

The embeddings client automatically chunks input into batches bounded by:

- **256 inputs per batch** (OpenAI's per-request input cap).
- **~512 KiB of string bytes per request batch** (safeguard against oversized requests).

Large embedding jobs are transparently split across multiple API calls.

### Retry Behavior

Embeddings retry with fibonacci backoff, up to **10 retries**. Retriable conditions:

- HTTP 429 (rate limit, throttling)
- HTTP 500, 503 (transient server errors)
- Transient `reqwest` errors (connect failures, timeouts)

Throttling (429 with rate-limit body) is detected explicitly and surfaces as a structured rate-limit error after retries are exhausted.

## Capacity & Sizing

- **Vector dimensions**: Bounded by the selected embedding model (e.g., `text-embedding-3-small`: 1536, `text-embedding-3-large`: 3072). Choose based on downstream storage and retrieval cost.
- **Concurrency budget**: Plan for tier-based concurrency × typical per-request latency (~100-300 ms) to estimate achievable throughput. Embedding requests are IO-bound and scale well with concurrency up to the budget.
- **Token limits**: Each input is bounded by the model's context window (8192 tokens for `text-embedding-3-*`). Inputs longer than the window fail with a `400` — truncate or chunk at the caller.

## Metrics

Embedding requests use a dedicated metric namespace separate from chat/LLM metrics:

| Metric                                         | Type      | Labels                                        | Description                        |
| ---------------------------------------------- | --------- | --------------------------------------------- | ---------------------------------- |
| `embeddings_requests`                          | Counter   | `model`, `encoding_format`, optional `user`, optional `dimensions` | Total embedding requests issued.   |
| `embeddings_failures`                          | Counter   | same as above                                 | Total embedding request failures.  |
| `embeddings_internal_request_duration_ms`      | Histogram | same as above                                 | Request latency (client-side).     |
| `embeddings_load_errors`                       | Counter   | -                                             | Runtime load-time errors.          |
| `embeddings_active_count`                      | Gauge     | -                                             | Currently-loaded embedding models. |
| `embeddings_load_state`                        | Gauge     | -                                             | Load state (0/1).                  |

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Embedding request operations emit `text_embed` spans in [task history](../../../reference/task_history), with fields:

- `input` (truncated)
- Labels (`model`, `encoding_format`, optional `user`, optional `dimensions`)
- `outputs_produced` (number of vectors returned)
- Errors (when applicable)

## Known Limitations

- **No automatic truncation**: Inputs longer than the model's context window fail with a 400 error; truncate or chunk at the caller.
- **No token-level rate limiting**: The rate controller counts requests; token-level TPM limits imposed by OpenAI may still be hit and surface as 429.
- **Provider compatibility varies**: OpenAI-compatible providers may not implement every parameter (dimensions, user, encoding_format).

## Troubleshooting

| Symptom                                  | Likely cause                                            | Resolution                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized`                       | Wrong / revoked API key.                                | Rotate the key; update the secret store.                                                                         |
| Sustained `429 rate_limit_exceeded`      | Tier budget too low or burst exceeds concurrency.       | Raise `openai_usage_tier`, reduce `max_concurrency`, or upgrade the OpenAI tier.                                 |
| `400` with "maximum context length"      | Input exceeds model context window.                     | Truncate or chunk inputs at the caller.                                                                          |
| Embeddings much slower than expected     | Single-threaded caller, no batching.                    | Batch inputs; the client chunks into 256-input / 512 KiB batches but the caller must parallelize embedding jobs. |
| Latency spikes every few hundred requests | Transient 429 with fibonacci backoff recovering.        | Expected at tier ceiling; raise tier or reduce load.                                                             |
