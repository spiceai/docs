---
title: 'Hugging Face Model Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for the Hugging Face model in production: tokens, download cache, device selection, local inference footprint, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - models
  - huggingface
  - observability
---

Production operating guide for loading models from the Hugging Face Hub and running local inference.

## Authentication & Secrets

| Parameter    | Description                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `hf_token`   | Hugging Face access token. Required for private or gated repos.                                       |
| `token`      | Alias accepted by some integrations.                                                                   |

Tokens must be sourced from a [secret store](../../secret-stores/) in production. For public, non-gated models the token is optional; for private / gated repos (Llama, most Mistral checkpoints), the token is required.

### Token Discovery Fallback

When `hf_token` is unset, the local loader falls back to the Hugging Face token cache (typically `~/.cache/huggingface/token` or `HF_TOKEN_PATH`). This makes local development portable but should be explicitly set in production via the secret store to avoid surprise auth behavior across environments.

## Resilience Controls

### Download & Cache

Models are downloaded on first use into `~/.spice/models/<name>/<revision>/`. Existing files are skipped on subsequent starts (cache-by-file-existence). Download requests use bearer auth when a token is configured. Path-traversal protections ensure all downloaded files stay within the model directory.

### Revision Pinning

Model IDs support explicit revision pinning (e.g. `org/model@revision`). `latest` maps to `main`. Revisions are sanitized for path safety before use. Pin revisions in production to guarantee reproducibility — `main` is a moving target.

### Retry Behavior

Download retries follow the shared HTTP-client policy with exponential/fibonacci backoff on transient failures. For very large models over slow networks, pre-download into the cache directory with the Hugging Face CLI to avoid first-request latency.

## Capacity & Sizing

### Device Selection

Local inference uses the first available backend in order:

1. **CUDA** (if compiled with CUDA support and a device is present)
2. **Metal** (if compiled with Metal support — macOS / Apple Silicon)
3. **CPU** fallback

Install the CUDA-enabled Spice build on GPU hosts; the standard build uses CPU-only inference which is significantly slower for models over a few billion parameters.

### Memory Footprint

Model size on disk is close to RAM/VRAM footprint at load. Quantized GGUF models (Q4, Q5, Q8) reduce footprint roughly proportional to their bit-width. For a 7B parameter model:

- `f16`: ~14 GB
- `Q8`: ~7.5 GB
- `Q5`: ~5 GB
- `Q4`: ~4 GB

Add ~20–30% headroom for KV cache and working memory during inference.

### Concurrency

The runtime rate limiter defaults to **`max_concurrency=1`** for local models (HuggingFace, filesystem) — local inference is compute-bound and benefits little from request-level parallelism on a single accelerator. Override via `max_concurrency` for multi-GPU / large-core CPU hosts.

## Metrics

Shared LLM metrics apply (see the [OpenAI Model Deployment Guide](../openai/deployment#metrics) for the full metric list): `llm_requests`, `llm_failures`, `llm_internal_request_duration_ms`, `llm_prompt_tokens_total`, `llm_completion_tokens_total`.

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Local inference operations emit `ai_completion` spans (and `health` spans for probes) in [task history](../../../reference/task_history), mirroring the OpenAI-path spans. `captured_output` and token usage fields are logged.

## Known Limitations

- **Single-process loading**: A model is loaded into the Spice process — it cannot be shared across process instances without a dedicated inference server.
- **No hot reload**: Switching model revisions requires a spicepod reload.
- **Limited Responses API support**: Responses API routing is currently tied to specific providers (OpenAI, xAI); a local HF-loaded model does not serve the Responses API.
- **Quantized formats**: Support depends on the local loader (mistral / candle). Verify the format is supported before production deployment.
- **Disk-space requirements**: First-run downloads can be multi-GB; ensure `~/.spice/models/` has adequate space.

## Troubleshooting

| Symptom                                                         | Likely cause                                               | Resolution                                                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized` on download                                  | Missing or invalid `hf_token`; gated model.                | Set `hf_token`; accept the model's license on Hugging Face; verify token has `read` scope.                                    |
| OOM on model load                                               | Model size exceeds device memory.                          | Choose a smaller quantized variant; switch to CPU + larger system RAM; use multi-GPU if supported.                             |
| Inference falls back to CPU unexpectedly                        | CUDA / Metal unavailable or not detected.                  | Use a CUDA-enabled Spice build on GPU hosts; verify `nvidia-smi` shows devices; for macOS, use Apple Silicon build.            |
| Model output changes between restarts                           | Revision unpinned (`main`).                                | Pin the revision: `org/model@revision_hash`.                                                                                    |
| First request extremely slow                                    | Model downloading on first run.                            | Pre-warm with `huggingface-cli download` into the Spice model cache, or start with `initial_load: true` if supported.           |
| Path traversal error on startup                                 | Malformed revision string.                                 | Use a clean revision: alphanumeric + underscores + dashes only; commit SHAs are safe.                                          |
