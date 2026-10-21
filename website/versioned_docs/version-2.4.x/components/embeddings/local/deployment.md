---
title: 'Local Embedding Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for filesystem-loaded embedding models in production: formats, pooling, device selection, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - embeddings
  - local
  - observability
---

Production operating guide for loading an embedding model from the local filesystem and running inference via the Text Embeddings Inference (TEI) pipeline.

## Authentication & Secrets

The Local embedding provider has no authentication layer. Access control is enforced by the operating system:

- The Spice runtime process must have read permission on the model files.
- For containers, mount model files as read-only volumes.
- For Kubernetes, mount via `PersistentVolumeClaim` or an init-container that downloads into a shared volume.

## Resilience Controls

The Local embedding provider reads local files synchronously. There is no network layer or retry logic. Failures surface as filesystem errors (`ENOENT`, `EACCES`, `EIO`) and fail the spicepod load at startup.

### TEI Queue Configuration

Fixed queue parameters in the current release:

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

Local embedding requires all of the following in the model directory:

- Model weights (accepted formats: `.gguf`, `.ggml`, `.safetensors`, `pytorch_model.bin`).
- `config.json`
- `tokenizer.json`

If any are missing, load fails with a descriptive error.

### Device Selection

1. **CUDA** (CUDA-enabled Spice build + available device)
2. **Metal** (Metal-enabled Spice build — macOS / Apple Silicon)
3. **CPU** fallback

### Memory Footprint

Embedding models are typically smaller than LLMs (tens to hundreds of MB). Plan for the base model size + ~30% for batch buffers.

### Throughput

Batched embedding dominates throughput. With default TEI settings (`max_batch_tokens=16384`), a MiniLM-class model on CPU can process hundreds of inputs per second; on a modern GPU, thousands per second.

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
- **Single-process loading**: Models load into the Spice process; no shared inference server across instances.
- **No hot reload**: Swapping the underlying model file requires a spicepod reload.

## Troubleshooting

| Symptom                                              | Likely cause                                           | Resolution                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `No such file or directory`                          | Path typo or missing mount.                            | Verify the files exist in the Spice process filesystem.                                                            |
| `Permission denied`                                  | Spice user lacks read on the files.                    | Adjust ACLs or mount with appropriate UID/GID.                                                                     |
| `Missing tokenizer.json` at load                     | Model directory missing the fast tokenizer.            | Add `tokenizer.json`; convert via `AutoTokenizer.save_pretrained`.                                                 |
| Input too long errors on `embed_pooled`              | No auto-truncation.                                    | Truncate at the caller, or set `max_seq_length` on the dataset.                                                    |
| `Pooling defaulted to 'mean'` warning                | `pooling` not set.                                     | Set pooling explicitly.                                                                                             |
| Inference falls back to CPU unexpectedly             | CUDA / Metal unavailable.                              | Use a CUDA-enabled Spice build on GPU hosts; on macOS, use the Apple Silicon build.                                |
| OOM during batched embedding                         | Batch × sequence length exceeds device memory.         | Reduce caller batch size; use a smaller model; upgrade device memory.                                              |
