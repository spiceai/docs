---
title: 'Hugging Face Embedding Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for Hugging Face embeddings in production: tokens, download cache, pooling, device selection, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - embeddings
  - huggingface
  - observability
---

Production operating guide for Hugging Face embeddings — loading an embedding model from the Hub and running local inference via the Text Embeddings Inference (TEI) pipeline.

## Authentication & Secrets

| Parameter   | Description                                                                              |
| ----------- | ---------------------------------------------------------------------------------------- |
| `hf_token`  | Hugging Face access token. Required for private or gated repos.                           |

Tokens must be sourced from a [secret store](../../secret-stores/) in production. For public models (e.g., `sentence-transformers/all-MiniLM-L6-v2`), the token is optional; for gated models, the token is required.

### Cache Directory

The cache location honors the `HF_HUB_CACHE` environment variable. In containers, set `HF_HUB_CACHE` to a persistent volume to avoid re-downloading on every restart.

## Resilience Controls

### Download & Cache

Model weights are downloaded on first use into the HF Hub cache and reused on subsequent starts. Download retries follow the shared HTTP client's retry policy on transient failures.

### Revision Pinning

Append `:<revision>` to the repository id in `from:` to pin a branch, tag, or commit SHA — the same convention the `huggingface:` model source uses. The revision is split off the repository id and passed to the loader, so the pinned revision is what gets downloaded:

```yaml
embeddings:
  - from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2:refs/pr/21
    name: pinned_minilm
```

With no `:<revision>` suffix, the repository's default revision (`main`) is used. A trailing `:` with nothing after it is treated as no revision rather than as part of the repository name.

### TEI Queue Configuration

The TEI pipeline has fixed queue parameters in the current release:

- `max_concurrent_requests`: **512**
- `max_batch_tokens`: **16384**

These are not currently exposed as user-tunable parameters.

### No Automatic Truncation for `embed_pooled`

Pooled-embed calls do **not** currently auto-truncate inputs longer than the model's max sequence length. Truncate at the caller, or configure `max_seq_length` on the dataset to enforce truncation.

## Pooling

| Value         | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `cls`         | Use the `[CLS]` token's embedding.                                   |
| `mean`        | Mean-pool across tokens.                                              |
| `splade`      | SPLADE sparse pooling (for sparse retrieval).                         |
| `last_token`  | Use the final token's embedding (useful for decoder-only models).     |

When `pooling` is unset, the loader defaults to `mean` and logs a warning. Set the pooling strategy explicitly for deterministic behavior across Spice versions.

## Capacity & Sizing

### Required Files

Local file mode (HF-downloaded) requires:

- Model weights (accepted formats: `.gguf`, `.ggml`, `.safetensors`, `pytorch_model.bin`).
- `config.json`
- `tokenizer.json`

If any are missing, load fails with a descriptive error.

### Device Selection

Device selection follows the local-model pattern: CUDA → Metal → CPU (see the [Hugging Face Model Deployment Guide](../../models/huggingface/deployment#device-selection) for details).

### Memory Footprint

Embedding models are typically smaller than LLMs (tens to hundreds of MB). A 384-dim MiniLM consumes ~100 MB on disk and ~200 MB in RAM. Plan for the base model + ~30% for batch buffers.

### Throughput

Batched embedding is the dominant throughput driver. With default TEI settings (`max_batch_tokens=16384`), a MiniLM-class model on CPU can process hundreds of inputs per second; on a modern GPU, thousands per second.

## Metrics

Shared embedding metrics (see the [OpenAI Embedding Deployment Guide](../openai/deployment#metrics)):

- `embeddings_requests`
- `embeddings_failures`
- `embeddings_internal_request_duration_ms`
- `embeddings_load_errors`, `embeddings_active_count`, `embeddings_load_state`

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Embedding requests emit `text_embed` spans in [task history](../../../reference/task_history) with input (truncated), labels, `outputs_produced`, and errors.

## Known Limitations

- **TEI queue limits hardcoded**: `max_concurrent_requests` (512) and `max_batch_tokens` (16384) are not user-tunable in the current release.
- **No auto-truncation for pooled embeds**: Inputs longer than `max_seq_length` fail unless truncated by the caller.
- **Single process loading**: Models load into the Spice process; no shared inference server across instances.

## Troubleshooting

| Symptom                                              | Likely cause                                            | Resolution                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `401 Unauthorized` on download                       | Missing / invalid `hf_token`; gated model.              | Set `hf_token`; accept the model's license on Hugging Face.                                                        |
| `Missing tokenizer.json` at load                     | Model repo does not ship a fast tokenizer.              | Use a model that ships `tokenizer.json`, or convert via `AutoTokenizer.save_pretrained`.                            |
| Input too long errors on `embed_pooled`              | No auto-truncation.                                     | Truncate at the caller; or set `max_seq_length` on the dataset.                                                     |
| `Pooling defaulted to 'mean'` warning                | `pooling` not set.                                      | Set pooling explicitly to silence the warning and lock in behavior.                                                 |
| First request extremely slow                         | Model downloading / warmup.                             | Pre-warm: `huggingface-cli download <repo>` into `HF_HUB_CACHE`.                                                     |
| OOM during batched embedding                         | Batch size × sequence length exceeds device memory.     | Reduce caller batch size; use a smaller model; upgrade device memory.                                               |
