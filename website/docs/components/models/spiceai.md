---
title: 'Spice Cloud Platform (Deprecated)'
description: 'Models hosted on the Spice Cloud Platform are no longer loadable in Spice.'
sidebar_label: 'Spice Cloud Platform (Deprecated)'
sidebar_position: 6
---

:::warning Deprecated

The `spice.ai` model source is no longer usable. It loaded traditional machine learning (ONNX) models, which was removed in vNext by [spiceai/spiceai#11684](https://github.com/spiceai/spiceai/pull/11684) along with the `/v1/predict` and `/v1/models/{name}/predict` endpoints. The source has never served large language models — loading a `spiceai` model for chat completions fails with `UnsupportedTaskForModel`.

For documentation on Spice Cloud Platform models in previous versions, see the [v2.1.x Spice Cloud Platform documentation](https://docs.spiceai.org/docs/2.1.x/components/models/spiceai).

:::

For large language models, use one of the [supported model providers](./index.md) — for example an [OpenAI-compatible endpoint](./openai/index.md). See also [Machine Learning Models](../../features/machine-learning-models).
