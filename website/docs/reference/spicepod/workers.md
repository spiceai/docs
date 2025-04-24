---
title: 'Workers'
sidebar_label: 'Workers'
description: 'Workers YAML reference'
---

Workers define a pattern of usage for one or more other spicepod components. Currently, workers define how one or more [llms](../models.md) can be combined into a logically single model.

## `workers`

The `workers` section in your configuration specifies one or more workers.

Example:

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

### `name`

A unique identifier for this worker component.

### `description`

Additional details about the worker, useful for displaying to users

### `models` {#models}

A list of model configurations that define how the model worker behaves.

The elements' structure uniquely determine the model worker algorithm. List elements should be of consistent type.

#### Round-Robin model worker
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

The worker will select each model in turn for subsequent requests.

| Key name | Key type | Description                                              |
|----------|----------|----------------------------------------------------------|
| from     | String   | The `model.name` of a defined `model` spicepod component.|


#### Fallback model worker
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

The worker will use the models in increasing order, returning the first result that is not an error.

| Key name |     Key type      | Description                                              |
|----------|-------------------|----------------------------------------------------------|
| from     | String            | The `model.name` of a defined `model` spicepod component.|
| order    | Integer, positive | The priority of the model in the fallback order. The lowest value is used first, followed by increasing order. The ordering of models with equal `order` is undefined. |


#### Weighted-likelihood model worker
Example
```yaml
workers:
  - name: weighted
    description: |
      Routes 80% of traffic to 'foo'.
    models:
      - from: foo
        weight: 4
      - from: bar
        weight: 1
```

The worker will, on each request, select a single model to use based on their proportion of weighted capacity.

| Key name | Key type | Description                                              |
|----------|----------|----------------------------------------------------------|
| from     | String   | The `model.name` of a defined `model` spicepod component.|
