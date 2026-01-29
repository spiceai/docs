---
title: 'Workers'
sidebar_label: 'Workers'
description: 'Workers YAML reference'
---

Workers in the Spice runtime represent configurable units of compute that help coordinate and manage interactions between models and tools. Currently, workers define how one or more [llms](../models) can be combined into a logically single model.

## `workers`

The `workers` section in your configuration specifies one or more workers.

Example:

```yaml
workers:
  - name: round-robin
    type: load_balance
    description: |
      Distributes requests between 'llama3_2' and 'gpt4_1' models in a round-robin fashion.
    load_balance:
      routing:
        - from: llama3_2
        - from: gpt4_1
  - name: fallback
    type: load_balance
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
    type: load_balance
    description: |
      Routes 80% of traffic to 'llama3_2'.
    load_balance:
      routing:
        - from: llama3_2
          weight: 4
        - from: gpt4_1
          weight: 1
```

### `name`

A unique identifier for this worker component.

### `description`

Additional details about the worker, useful for displaying to users and providing to LLM context.

### `cron`

Specifies a cron schedule to automatically run the worker at the specified times. The worker action controls the behavior of the schedule. See the [cron schedule reference](/docs/reference/cron) for more information on cron schedules.

#### `cron` with a `load_balance` action

When a `load_balance` action is specified with a cron schedule, the `params.prompt` parameter is used to automatically request a chat completion. When no `params.prompt` parameter is specified, the cron schedule is not activated.

##### Worker with a round-robin balancer, that is automatically prompted on a schedule

```yaml
workers:
  - name: round-robin
    description: |
      Call models 'llama3_2' & 'gpt4_1' in round robin.
    load_balance:
      routing:
        - from: llama3_2
        - from: gpt4_1
    cron: '* * * * *' # every minute
    params:
      prompt: "What's the date today?"
```

#### `cron` with a `sql` action

When a `sql` action is specified with a cron schedule, the worker runs the SQL at the specified scheduled times.

##### Worker with a SQL action, that automatically executes on a schedule

```yaml
workers:
  - name: sql-worker
    cron: '* * * * *' # every minute
    sql: 'SELECT COUNT(*) FROM orders'
```

### `load_balance`

Specifies the configuration for a `load_balance` worker. When a `load_balance` section is present, other worker actions cannot be specified (e.g. `sql`).

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
      Call models 'llama3_2' & 'gpt4_1' in round robin.
    load_balance:
      routing:
        - from: llama3_2
        - from: gpt4_1
```

The worker selects each model in turn for subsequent requests.

#### Worker with fallback model routing

Example

```yaml
workers:
  - name: fallback
    description: |
      Call 'gpt4_1'. On error, call 'llama3_2'. Failing that 'anth_haiku'.
    load_balance:
      routing:
        - from: llama3_2
          order: 2
        - from: gpt4_1
          order: 1
        - from: anth_haiku
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
      Routes 80% of traffic to 'llama3_2' (20% to 'gpt4_1').
    load_balance:
      routing:
        - from: llama3_2
          weight: 4
        - from: gpt4_1
          weight: 1
```

The worker routes traffic to the models in accordance to the weighting (i.e. 80% to `llama3_2`, 20% to `gpt4_1`).

### `sql`

Specifies an SQL query action to run for this worker. When specified without a `cron` parameter, the worker does nothing.

When this parameter is present, other worker actions cannot be specified (e.g. `load_balance`)

### `params`

Optional, additional parameters for the specified worker action.

#### `params.prompt`

Valid only when the `load_balance` worker action is specified with a `cron` schedule, otherwise ignored. The value specified by this parameter is used as the input to a new chat completion request on the specified `cron` schedule for the worker.
