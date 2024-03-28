---
title: 'ML Model Deployment'
sidebar_label: 'ML Model Deployment'
description: ''
sidebar_position: 1
pagination_next: 'machine-learning/inference/index'
---

Models can be loaded from a variety of sources: 
- Local filesystem: Local ONNX files.
- HuggingFace: Models Hosted on HuggingFace.
- SpiceAI: Models trained on the Spice.AI Cloud Platform

A model component, within a Spicepod, has the following format. 


| field             | Description                                                         |
| ----------------- | ------------------------------------------------------------------- | 
| `name`            | Unique, readable name for the model within the Spicepod.            | 
| `from`            | Source-specific address to uniquely identify a model              | 
| `datasets`        | Datasets that the model depends on for inference                    | 
| `files` (HF only) | Specify an individual file within the HuggingFace repository to use | 
 
## Model Source Docs

import DocCardList from '@theme/DocCardList';

<DocCardList />