---
type: docs
title: "Models"
linkTitle: "Models"
description: 'Models YAML reference'
weight: 90
---

> The model specifications are in early preview and are subject to change.

A Spicepod can contain one or more models referenced by relative path, or defined inline.

# `models`

Inline example:

`spicepod.yaml`
```yaml
models:
  - from: spiceai:spice.ai/lukekim/smart/models/drive_stats:latest
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

`spicepod.yaml`
```yaml
models:
  - from: huggingface:huggingface.co/spiceai/darts:latest
    name: drive_stats
    files:
      - model.onnx
    datasets:
      - drive_stats_inferencing
```

Relative path example:

`spicepod.yaml`
```yaml
models:
  - from: models/drive_stats
```

`models/drive_stats/model.yaml`
```yaml
models:
  - from: spiceai:spice.ai/lukekim/smart/models/drive_stats:latest
    name: drive_stats
    datasets:
      - drive_stats_inferencing
```

## `name`

The name of the model. This is used to reference the model in the pod manifest, as well as in external data sources.

## `from`

The `from` field is a string that represents the Uniform Resource Identifier (URI) for the model. This URI is composed of two parts: a prefix indicating the source of the model, and the actual link to the model.

The syntax for the `from` field is as follows:

```yaml
from: <source>:<link>:<version>
```

Where:

- `<source>`: The source of the model

  Currently supported sources:
  - [`spiceai`]({{<ref "machine-learning/model-deployment/spiceai">}})
  - [`huggingface`]({{<ref "machine-learning/model-deployment/huggingface">}})

- `<link>`: The actual link to the model.

- `<version>`: The version of the model. This is optional and if not specified, the latest version of the model will be used.

## `datasets`

An array of dataset names needed for the model.

## `files`

Only for Huggingface models. List of model files to download from Huggingface.

```yaml
files:
  - model.onnx
  - model.onnx.data
  ...
```

