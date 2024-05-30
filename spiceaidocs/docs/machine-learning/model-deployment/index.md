---
title: 'Model Deployment'
sidebar_label: 'Model Deployment'
description: ''
sidebar_position: 1
pagination_next: 'machine-learning/inference/index'
---

Models can be loaded from:

- **Filesystem**: [ONNX](https://onnx.ai) models.
- **HuggingFace**: ONNX and GGUF models hosted on [HuggingFace](https://huggingface.co).
- **Spice Cloud Platform**: Models hosted on the [Spice Cloud Platform](https://docs.spice.ai)

Defined in the `spicepod.yml`, a `model` component has the following format.

| field             | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `name`            | Unique, readable name for the model within the Spicepod.            |
| `from`            | Source-specific address to uniquely identify a model                |
| `datasets`        | Datasets that the model depends on for inference                    |
| `files` (HF only) | Specify an individual file within the HuggingFace repository to use |

For more detail, refer to the `model` [reference specification](../../reference/spicepod/models.md).

## Model Source Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />
