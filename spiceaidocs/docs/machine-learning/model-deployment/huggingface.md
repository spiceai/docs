---
title: "Huggingface"
sidebar_label: "Huggingface"
sidebar_position: 1
---

To define a model component from HuggingFace, specify it in the `from` key.

### Example
```yaml
models:
  - from: huggingface:huggingface.co/spiceai/darts:latest
    name: hf_model
    files:
      - model.onnx
    datasets:
      - taxi_trips
```

### `from` Format
The `from` key follows the following regex format:
```
\A(huggingface:)(huggingface\.co\/)?(?<org>[\w\-]+)\/(?<model>[\w\-]+)(:(?<revision>[\w\d\-\.]+))?\z
```
#### Examples
- `huggingface:username/modelname`: Implies the latest version of `modelname` hosted by `username`.
- `huggingface:huggingface.co/username/modelname:revision`: Specifies a particular `revision` of `modelname` by `username`, including the optional domain.

#### Specification
1. **Prefix:** The value must start with `huggingface:`.
2. **Domain (Optional):** Optionally includes `huggingface.co/` immediately after the prefix. Currently no other Huggingface compatible services are supported. 
3. **Organization/User:** The HuggingFace organisation (`org`).
4. **Model Name:** After a `/`, the model name (`model`).
5. **Revision (Optional):** A colon (`:`) followed by the git-like revision identifier (`revision`).


### Limitations
- Supports only ONNX format files.