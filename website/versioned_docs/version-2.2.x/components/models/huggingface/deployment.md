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
| `huggingface_token` | Hugging Face access token. Required for private or gated repos. Spelled `huggingface_token` on this release line, not `hf_token`. |

:::warning[`huggingface_token` on v2.2.0 and v2.2.1]

`hf_token` is rejected on this release line: the runtime drops it with

```text
WARN runtime_parameters_typed: Ignoring parameter `hf_token`: not supported for model huggingface.
```

and downloads the repository anonymously, so a gated or private repo fails with an HTTP 401 that names no cause. A bare `token` is rejected too, with a warning that it must be prefixed with `huggingface_`. This affects `from: huggingface:` **models** only — the `hf_token` documented for [embeddings](../../embeddings/huggingface/deployment.md) and rerankers is read correctly on this release.

Spelling reverted in v2.3.0: `hf_token` is the parameter again, and `huggingface_token` is kept as an alias so a Spicepod written against v2.2.x keeps loading. See [spiceai/spiceai#13932](https://github.com/spiceai/spiceai/issues/13932).

:::

Tokens must be sourced from a [secret store](../../secret-stores/) in production. For public, non-gated models the token is optional; for private / gated repos (Llama, most Mistral checkpoints), the token is required.

### Token Discovery Fallback

When `huggingface_token` is unset, the loader falls back to the `HF_TOKEN` environment variable, then `HF_HUB_TOKEN`, then the Hugging Face token file (`$HF_HOME/token`, default `~/.cache/huggingface/token`, written by `huggingface-cli login`). This makes local development portable but should be explicitly set in production via the secret store to avoid surprise auth behavior across environments.

## Resilience Controls

### Download & Cache

Models are downloaded on first use into the standard Hugging Face Hub cache, resolved in this order: `HF_HUB_CACHE`, then `$HF_HOME/hub`, then `~/.cache/huggingface/hub`. Blobs already present in that cache are reused on subsequent starts. Download requests use bearer auth when a token is configured. Set `HF_HUB_CACHE` (or `HF_HOME`) to place the cache on a volume with enough space and to share it between restarts or replicas.

### Revision Pinning

Model IDs support explicit revision pinning by appending a **colon** and the revision to the `from` value — `from: huggingface:huggingface.co/<org>/<model>:<revision>` (see [`from` format](./index.md#from)). The revision is passed to the Hub verbatim, so it must name a real branch, tag or commit SHA on the repo; `latest` is *not* translated to `main` and fails unless the repo actually has a `latest` ref. An `@` is not a valid separator: `org/model@revision` fails the `from` pattern and the model does not load. Pin revisions to a commit SHA in production to guarantee reproducibility — the default branch is a moving target.

### Retry Behavior

Download retries follow the shared HTTP-client policy with exponential/fibonacci backoff on transient failures. Models are downloaded and instantiated during startup, so a slow or large download delays the model reaching `Ready` rather than slowing the first request. For very large models over slow networks, pre-download into the cache directory with the Hugging Face CLI (passing `--revision` when the `from` pins one).

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
- **Disk-space requirements**: First-run downloads can be multi-GB; ensure the Hub cache directory (`HF_HUB_CACHE`, `$HF_HOME/hub`, or `~/.cache/huggingface/hub`) has adequate space.

## Troubleshooting

| Symptom                                                         | Likely cause                                               | Resolution                                                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `401 Unauthorized` on download                                  | Missing or invalid `huggingface_token`; gated model.       | Set `huggingface_token` (not `hf_token`, which this release ignores); accept the model's license on Hugging Face; verify token has `read` scope. |
| OOM on model load                                               | Model size exceeds device memory.                          | Choose a smaller quantized variant; switch to CPU + larger system RAM; use multi-GPU if supported.                             |
| Inference falls back to CPU unexpectedly                        | CUDA / Metal unavailable or not detected.                  | Use a CUDA-enabled Spice build on GPU hosts; verify `nvidia-smi` shows devices; for macOS, use Apple Silicon build.            |
| Model output changes between restarts                           | Revision unpinned (default branch).                        | Pin the revision with a colon: `from: huggingface:huggingface.co/org/model:<commit_sha>`.                                       |
| Model stays `Initializing` for a long time after startup       | First-run download. Models are fetched and instantiated during startup (`load_models`), not lazily on the first inference request, so the model is unavailable until the download completes. | Pre-warm the Hub cache with `huggingface-cli download <org>/<model> --revision <revision>` — passing the same revision the `from` pins — and point `HF_HOME` / `HF_HUB_CACHE` at the directory Spice uses. |
| Model fails to load with an invalid-`from` error                | `from` does not match the HuggingFace pattern — most often an `@` used as the revision separator, or a character outside `[A-Za-z0-9_.-]` in the revision. | Use `from: huggingface:huggingface.co/<org>/<model>:<revision>`; the revision accepts word characters, digits, dashes and dots, so commit SHAs are safe. |
