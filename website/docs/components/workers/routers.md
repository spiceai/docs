---
title: 'Model Routing Workers'
description: 'Instructions for defining routing rules for LLMs within Spice.'
sidebar_label: 'LLM Routing'
sidebar_position: 1
---

Model routing workers define how one or more [llms](/docs/components/models/index.md) can be combined into a logically single model. Workers are defined as components in the `spicepod.yaml`.

**Example:**

```yaml
workers:
  - name: round-robin
    description: |
      Call models 'foo' & 'bar' in round robin.
    models:
      - from: foo
      - from: bar
  - name: fallback
    description: |
      Call 'bar'. On error, call 'foo'. Failing that 'baz'.
    models:
      - from: foo
        order: 2
      - from: bar
        order: 1
      - from: baz
        order: 3
  - name: weighted
    description: |
      Routes 80% of traffic to 'foo'.
    models:
      - from: foo
        order: 4
      - from: bar
        order: 1
```

For a complete specification of the routing rule options and syntax see the [specifications](/docs/reference/spicepod/workers.md#models).

## Calling a Model Routing Worker

Model routing workers act like any other LLM defined in `.models`. For example, they can be called via the OpenAI compatible HTTP endpoints.
```bash
curl http://localhost:8090/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fallback",
    "messages": [{ "role": "user", "content": "Tell me a joke"}]
  }'
```
