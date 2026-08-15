---
title: 'Workers Overview'
description: 'Detailed documentation for workers in the Spice runtime.'
sidebar_label: 'Workers Overview'
sidebar_position: 8
---

Workers in the Spice runtime represent configurable units of compute that help coordinate and manage interactions between models and tools. Each worker is defined as a component in the `spicepod.yaml` file, specifying its behavior and interaction logic.

## Configuration

Workers are configured in the `workers` section of the `spicepod.yaml` file. Each worker definition includes a name, description, and a list of models or tools it encapsulates.

**Example `spicepod.yaml` configuration:**

```yaml
workers:
  - name: round-robin
    description: |
      Distributes requests between 'llama3_2' and 'gpt4_1' models in a round-robin fashion.
    load_balance:
      routing:
        - from: llama3_2
        - from: gpt4_1
  - name: fallback
    description: |
      Attempts 'gpt4_1' first, then 'llama3_2', then 'anth_haiku' if previous models fail.
    load_balance:
      routing:
        - from: llama3_2
          order: 2
        - from: gpt4_1
          order: 1
        - from: anth_haiku
          order: 3
  - name: weighted
    description: |
      Routes 80% of traffic to 'llama3_2'.
    load_balance:
      routing:
        - from: llama3_2
          weight: 4
        - from: gpt4_1
          weight: 1
```

## Use-Cases

Workers currently help implement:

- Model fallback and error handling
- Load balancing across multiple models

## Usage

Workers can be invoked using the same API endpoints as individual models. For example, to call a worker named `fallback` using the OpenAI-compatible HTTP API:

```bash
curl http://localhost:8090/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "fallback",
    "messages": [{ "role": "user", "content": "Tell me a joke"}]
  }'
```

## Roadmap

The vision for workers includes support for dynamic serverless compute, enabling execution of user-defined functions within the Spice runtime. This direction aims to help developers define custom logic and orchestration patterns directly in the worker configuration, supporting more advanced workflows and automation. Further details and implementation timelines will be provided in future updates. For ongoing progress, refer to the project repository and documentation.

## Further Reading

For a complete specification of worker configuration, routing rules, and available options, refer to the [Spicepod Workers Reference](../reference/spicepod/workers).
