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
    type: load_balance
    description: |
      Distributes requests between 'foo' and 'bar' models in a round-robin fashion.
    load_balance:
      routing:
        - from: foo
        - from: bar
  - name: fallback
    type: load_balance
    description: |
      Attempts 'bar' first, then 'foo', then 'baz' if previous models fail.
    load_balance:
      routing:
        - from: foo
          order: 2
        - from: bar
          order: 1
        - from: baz
          order: 3
  - name: weighted
    type: load_balance
    description: |
      Routes 80% of traffic to 'foo'.
    load_balance:
      routing:
        - from: foo
          weight: 4
        - from: bar
          weight: 1
```

### `name`

A unique identifier for this worker component.

### `description`

Additional details about the worker, useful for displaying to users and providing to LLM context.

### `type`

Determines how the worker can be configured, and what subset of compute traits are applicable.

### `load_balance` 

Applicable only for `.type: load_balance`. 

### `load_balance.routing` 

A list of model configurations that define how the load balancing behaves.

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
    load_balance:
      routing:
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
    load_balance:
      routing:
        - from: foo
          order: 2
        - from: bar
          order: 1
        - from: baz
          order: 3
```

The worker uses the models in increasing order, returning the first result that is not an error.


#### Worker with weighted model routing

Example

```yaml
workers:
  - name: weighted
    type: load_balance
    description: |
      Routes 80% of traffic to 'foo'.
    load_balance:
      routing:
        - from: foo
          weight: 4
        - from: bar
          weight: 1
```

The worker routes traffic to the models in accordance to the weighting (i.e. 80% to `foo`, 20% to `bar`).
