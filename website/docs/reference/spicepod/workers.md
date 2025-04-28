---
title: 'Workers'
sidebar_label: 'Workers'
description: 'Workers YAML reference'
---

Workers in the Spice runtime represent configurable units of compute that help coordinate and manage interactions between models and tools. Currently, workers define how one or more [llms](../models.md) can be combined into a logically single model.

## `workers`

The `workers` section in your configuration specifies one or more workers.

Example:

```yaml
workers:
  - name: round-robin
    description: |
      Distributes requests between 'foo' and 'bar' models in a round-robin fashion.
    models:
      - from: foo
      - from: bar
  - name: fallback
    description: |
      Attempts 'bar' first, then 'foo', then 'baz' if previous models fail.
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

### `name`

A unique identifier for this worker component.

### `description`

Additional details about the worker, useful for displaying to users and providing to LLM context.

### `models` {#models}

A list of model configurations that define how the model worker behaves.

The elements' structure uniquely determine the model worker algorithm. List elements should be of consistent type.

| Key name | Key type          | Description                                                                                                                                               |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| from     | String            | The `model.name` of a defined `model` spicepod component.                                                                                                 |
| order    | Integer, positive | The priority of the model in order. The lowest value is used first, followed by increasing order. The ordering of models with equal `order` is undefined. |

#### Worker with round-robin routing across models

Example

```yaml
workers:
  - name: round-robin
    description: |
      Call models 'foo' & 'bar' in round robin.
    models:
      - from: foo
      - from: bar
```

The worker selects each model in turn for subsequent requests.

#### Worker with fallback model routing

Example

```yaml
workers:
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
```

The worker uses the models in increasing order, returning the first result that is not an error.
