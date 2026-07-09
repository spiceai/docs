---
title: 'Filesystem Model Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Operating guide for filesystem-loaded models in production: formats, device selection, memory footprint, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - models
  - observability
---

Production operating guide for loading local language models from the filesystem (GGUF, safetensors).

## Authentication & Secrets

The Filesystem model provider has no authentication layer. Access control is enforced by the operating system:

- The Spice runtime process must have read permission on the model files.
- For containers, mount model files as read-only volumes.
- For Kubernetes, mount via `PersistentVolumeClaim` or a model-serving sidecar.

For sensitive models (proprietary weights, fine-tunes with PII training data), restrict filesystem ACLs to the Spice process user and encrypt the volume at rest.

## Resilience Controls

The Filesystem model provider reads local files synchronously. There is no network layer, retry logic, or remote backoff. Failures surface as filesystem errors (`ENOENT`, `EACCES`, `EIO`).

Model loading happens once at startup. A missing or unreadable file fails the spicepod load; fix the underlying cause and restart.

## Capacity & Sizing

### Supported Formats

| Format         | Extension                      | Notes                                                                  |
| -------------- | ------------------------------ | ---------------------------------------------------------------------- |
| GGUF           | `.gguf`                        | Quantized / unquantized; loaded via the mistral local loader.          |
| GGML (legacy)  | `.ggml`                        | Legacy llama.cpp format.                                               |
| Safetensors    | `.safetensors`                 | Native tensor format; preferred over `.bin` for safety.                 |
| PyTorch        | `.bin` / `.pt` / `.pth`         | Legacy PyTorch checkpoints.                                             |

### Device Selection

Local inference uses the first available backend in order:

1. **CUDA** (if compiled with CUDA support and a device is present)
2. **Metal** (if compiled with Metal support — macOS / Apple Silicon)
3. **CPU** fallback

Install the CUDA-enabled Spice build on GPU hosts for materially better throughput on models over a few billion parameters.

### Memory Footprint

Model file size on disk is close to RAM / VRAM footprint at load. Quantized GGUF models (Q4, Q5, Q8) reduce footprint roughly proportional to their bit-width. For a 7B-parameter model:

- `f16`: ~14 GB
- `Q8`: ~7.5 GB
- `Q5`: ~5 GB
- `Q4`: ~4 GB

Add ~20–30% headroom for KV cache and working memory during inference.

### Concurrency

The runtime rate limiter defaults to **`max_concurrency=1`** for local models — local inference is compute-bound and benefits little from request-level parallelism on a single accelerator. Override via `max_concurrency` for multi-GPU / large-core CPU hosts.

## Metrics

Shared LLM metrics apply (see the [OpenAI Model Deployment Guide](../openai/deployment#metrics) for the full metric list): `llm_requests`, `llm_failures`, `llm_internal_request_duration_ms`, `llm_prompt_tokens_total`, `llm_completion_tokens_total`.

See [Component Metrics](../../../features/observability/component_metrics) for enabling and exporting metrics.

## Task History

Local inference operations emit `ai_completion` spans (and `health` spans for probes) in [task history](../../../reference/task_history), mirroring the shared model spans. `captured_output` and token usage fields are logged.

## Known Limitations

- **Single-process loading**: A model is loaded into the Spice process — it cannot be shared across process instances without a dedicated inference server.
- **Format support depends on compile features**: CUDA and Metal support are conditional on the Spice build flavor (default, CUDA).
- **No hot reload**: Swapping the underlying model file requires a spicepod reload.
- **No integrity check**: The provider trusts the file on disk. Validate checksums out-of-band for supply-chain assurance.
- **Model_type override**: When the loader cannot auto-detect the architecture, `model_type` can force a known architecture.

## Troubleshooting

| Symptom                                              | Likely cause                                        | Resolution                                                                                                               |
| ---------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `No such file or directory`                          | Path typo or missing mount.                         | Verify the file exists in the Spice process's filesystem (`ls` inside the container).                                    |
| `Permission denied`                                  | Spice user lacks read on the file.                  | Adjust ACLs or mount with appropriate UID/GID.                                                                            |
| Model fails to load with `unsupported architecture`  | Loader cannot infer architecture from filename.     | Set `model_type` explicitly.                                                                                              |
| OOM on load                                          | File size exceeds device memory.                    | Use a smaller / more quantized variant; move to CPU with more RAM; split across GPUs if supported.                        |
| Inference falls back to CPU unexpectedly             | CUDA / Metal not available.                         | Use a CUDA-enabled Spice build on GPU hosts; for macOS, use the Apple Silicon build.                                      |
| Slow first inference after startup                   | JIT / weight-quantization warmup.                   | Issue a warmup request at startup; subsequent calls are hot.                                                              |
