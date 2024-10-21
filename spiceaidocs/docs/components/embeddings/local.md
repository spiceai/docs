---
title: 'Local Filesystem Embedding Models'
sidebar_label: 'Local'
sidebar_position: 3
---

Embedding models can be run with files stored locally.

```yaml
embeddings:
  - name: all_minilm_l6_v2
    from: file:model.safetensors
    files:
      - path: /Users/jeadie/Github/spiceai/models/embed/config.json
      - path: models/embed/tokenizer.json
```

## Required Files
 - Model file, one of: `model.safetensors`, `pytorch_model.bin` or `model.safetensors.index.json` (and associated referenced files).
 - A tokenizer file, with filename, `tokenizer.json`.
 - Config file, with filename, `config.json`.
