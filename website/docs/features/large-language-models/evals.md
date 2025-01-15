---
title: 'Evaluating Language Models'
sidebar_label: 'Evals'
description: 'Learn how Spice evaluates, tracks, compares, and improves language model performance for specific tasks'
sidebar_position: 3
pagination_prev: null
pagination_next: null
tags:
  - models
---

Language models can perform complex tasks. Evals help measure a model's ability to perform a specific task. Evals are defined as Spicepod components and can evaluate any Spicepod model's performance.

Refer to the [Cookbook](https://github.com/spiceai/cookbook/tree/trunk/evals) for related examples.

## Overview

In Spice, an eval consists of the following core components:

- **Evals**: A defined task for a model to perform and a method to measure its performance.
- **Eval Run**: An single evaluation of a specific model.
- **Eval Result**: The model output and score for a single input task within an eval run.
- **Eval Scorer**: A method to score the model's performance on an eval result.

### Eval Components

An eval component is defined as follows:

```yaml
evals:
  - name: australia
    description: Make sure the model understands Aussies, and importantly Cricket.
    dataset: cricket_questions
    scorers:
      - match

datasets:
  - name: cricket_questions
    from: https://github.com/openai/evals/raw/refs/heads/main/evals/registry/data/cricket_situations/samples.jsonl
```

Where:

- `name` is a unique identifier for this eval (like `models`, `datasets`, etc.).
- `dataset` is a dataset component.
- `scorers` is a list of scoring methods.

For complete details on the `evals` component, see the [Spicepod reference](/docs/reference/spicepod/evals).

## Running an Eval

To run an eval, ensure

1.  Define an `eval` component (and it's associated `dataset`).
2.  Add a language model to the spicepod (this is the model that will be evaluated).

An eval can be started via the HTTP API:

```shell
curl -XPOST http://localhost:8090/v1/evals/australia \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "my_model",
  }'
```

Depending on the dataset and model, the eval run can take some time to complete. On completion, results will be available in two tables:

- `eval.runs`: Summarises the status and scores from the eval run.
- `eval.results`: Contains the input, expected output, and actual output for each eval run, and the score from each scorer.

## Dataset Formats

Datasets are used to define the input and expected output for an eval. Evals expect a particular format,

- `input`: The input to the model. It should be either:
  - A plain string (e.g., `"Hello, how are you?"`), interpreted as a single user message.
  - A JSON array is interpreted as multiple OpenAI-compatible [messages](https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages) (e.g., `[{"role":"system","content":"You are a helpful assistant."}, ...]`).
- For the `ideal` column:
  - A plain string (e.g., `"I'm doing well, thanks!"`), interpreted as a single assistant response.
  - A JSON array is interpreted as multiple OpenAI-compatible [choices](https://platform.openai.com/docs/api-reference/chat/object#chat/object-choices) (e.g., `[{"index":0,"message":{"role":"assistant","content":"Sure!"}, ...}]`).

To use a dataset with a different format, use a `view`. For example:

```yaml
views:
  # This view defines an eval dataset containing previous ai completion tasks from the `runtim.task_history` table.
  - name: user_queries
    sql: |
      SELECT
        json_get_json(input, 'messages') AS input,
        json_get_str((captured_output -> 0), 'content') as ideal
      FROM runtime.task_history
      WHERE task='ai_completion'
```
