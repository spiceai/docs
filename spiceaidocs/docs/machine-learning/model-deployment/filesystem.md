---
title: 'Filesystem'
sidebar_label: 'Filesystem'
sidebar_position: 3
---

To use a model hosted on a filesystem, specify the file path in `from`.

Example:

```yaml
models:
  - from: file://absolute/path/to/my/model.onnx
    name: local_fs_model
    datasets:
      - taxi_trips
```
