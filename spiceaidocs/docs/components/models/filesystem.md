---
title: 'Filesystem'
description: 'Instructions for using models hosted on a filesystem with Spice.'
sidebar_label: 'Filesystem'
sidebar_position: 3
---

To use a model hosted on a filesystem, specify the path to the model file in `from`.

Supported formats include ONNX for traditional machine learning models and GGUF, GGML, and SafeTensor for large language models (LLMs).

### Example: Loading an ONNX Model

```yaml
models:
  - from: file://absolute/path/to/my/model.onnx
    name: local_fs_model
```

### Example: Loading a GGUF Model

```yaml
models:
  - from: file://absolute/path/to/my/model.gguf
    name: local_ggml_model
```

### Example: Loading a GGML Model

```yaml
models:
  - from: file://absolute/path/to/my/model.ggml
    name: local_ggml_model
```

### Example: Loading a SafeTensor Model

```yaml
models:
  - from: file://absolute/path/to/my/model.safetensor
    name: local_safetensor_model
```
