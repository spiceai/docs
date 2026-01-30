---
title: 'Evals'
sidebar_label: 'Evals'
description: 'Evaluations YAML reference'
---

A Spicepod can contain one or more evaluations (evals) referenced by relative path.

To learn about evals, including what they are and how to run them in Spice, refer to the [Evals documentation](../../features/large-language-models/evals.md).


# `evals`

Example:

`spicepod.yaml`

```yaml
evals:
  - name: australia
    description: Make sure the model understands Aussies, and importantly Cricket.
    dataset: cricket_logic
    scorers:
      - match
```

## `name`

A unique identifier for this evaluation component that can be referenced elsewhere in your configuration.

## `description`

Optional. A human-readable description explaining the purpose of this evaluation and what it aims to test.

## `dataset`

The [dataset](../../reference/spicepod/datasets.md) to use for this evaluation. Must reference a valid dataset defined in the Spicepod configuration.

## `scorers`

A list of scoring methods to apply during the evaluation. Each scorer defines how a [model's](../../reference/spicepod/models.md) outputs will be measured against an expected result.

A full list of scorers can be found [here](../../features/large-language-models/evals.md#eval-scorers).
