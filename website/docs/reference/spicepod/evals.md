---
title: 'Evals'
sidebar_label: 'Evals'
description: 'Evaluations YAML reference'
---

A Spicepod can contain one or more evaluations (evals) referenced by relative path.

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

The [dataset](/docs/reference/spicepod/datasets) to use for this evaluation. Must reference a valid dataset defined in the Spicepod configuration.

## `scorers`

A list of scoring methods to apply during the evaluation. Each scorer defines how a [model's](/docs/reference/spicepod/models) outputs will be measured against an expected result.

Currently scorers include the following builtin methods:
 - `match`: Checks for an exact match between the expected and actual outputs.
 - `json_match`: Checks for an equivalent JSON between expected and actual outputs.
 - `includes`: Checks for the actual output to include the expected output.
 - `fuzzy_match`: Checks whether a normalised version (ignoring casing, punctuation, articles (e.g. a, the), excess whitespace) of either the expected and actual outputs are a subset of the other.
