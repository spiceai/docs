---
title: 'AI/ML Models'
sidebar_label: 'AI/ML Models'
description: ''
---

Machine Learning (ML) models can be deployed and loaded from the following sources.

- **Filesystem**: [ONNX](https://onnx.ai) models.
- **HuggingFace**: ONNX models hosted on [HuggingFace](https://huggingface.co).
- **Spice Cloud Platform**: Models hosted on the [Spice Cloud Platform](https://docs.spice.ai/building-blocks/spice-models).

Defined in the `spicepod.yml`, a `model` component has the following format.

| field      | Description                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `name`     | Unique, readable name for the model within the Spicepod.                |
| `from`     | Source-specific address to uniquely identify a model                    |
| `datasets` | Datasets that the model depends on for inference                        |
| `files`    | Specify additional files, or override default files needed by the model |

For more detail, refer to the `model` [reference specification](/reference/spicepod/models.md).

## Model Sources

import DocCardList from '@theme/DocCardList';

<DocCardList />
