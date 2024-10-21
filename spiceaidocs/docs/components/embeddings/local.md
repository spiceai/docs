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
 - Model file, one of: `model.safetensors`, `pytorch_model.bin`.
 - A tokenizer file with the filename `tokenizer.json`.
 - A config file with the filename `config.json`.
