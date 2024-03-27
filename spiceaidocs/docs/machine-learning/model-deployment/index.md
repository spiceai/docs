---
title: 'ML Model Deployment'
sidebar_label: 'ML Model Deployment'
description: ''
sidebar_position: 1
---

Models can be loaded from a variety of sources: 
- Local filesystem: Local ONNX files.
- HuggingFace: Models Hosted on HuggingFace.
- SpiceAI: Models trained on the Spice.AI Cloud Platform

A model component, within a spicepod, has the following format. 


| field             | Description                                                         |
| ----------------- | ------------------------------------------------------------------- | 
| `name`            | Unique, readable name for the model within the Spicepod.            | 
| `from`            | Provider specific address to uniquely identify a model              | 
| `datasets`        | Datasets that the model depends on for inference                    | 
| `files` (HF only) | Specify an individual file within the HuggingFace repository to use | 
 