---
title: "Local"
sidebar_label: "Local"
sidebar_position: 3
---

Local models can be used by specifying the file's path in `from` key.

### Example
```yaml
models:
  - from: file:/absolute/path/to/my/model.onnx
    name: local_model
    datasets:
      - taxi_trips
```