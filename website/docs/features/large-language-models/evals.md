---
title: 'Evaluating Language Models'
sidebar_label: 'Evals'
description: 'Learn how Spice evaluates, tracks, compares, and improves language model performance for specific tasks'
sidebar_position: 4
pagination_prev: null
pagination_next: null
tags:
  - models
  - evaluation
  - performance
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

To run an eval:

1. Define an `eval` component (and its associated `dataset`).
2. Add a language model to the spicepod (this is the model that will be evaluated).

Start an eval via the HTTP API:

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

## Eval Scorers

An eval scorer is a method to score the model's performance on a single eval case. A scorer is given the input given to the model, the models output and the expected output and produces an associated score. Spice has several out of the box scorers:
 - `match`: Checks for an exact match between the expected and actual outputs.
 - `json_match`: Checks for an equivalent JSON between expected and actual outputs.
 - `includes`: Checks for the actual output to include the expected output.
 - `fuzzy_match`: Checks whether a normalised version (ignoring casing, punctuation, articles (e.g. a, the), excess whitespace) of either the expected and actual outputs are a subset of the other.
 - `levenshtein`: Computes the Levenshtein distance between the two output strings, normalised to the string length. The Levenshtein distance between two words is the minimum number of single-character edits (insertions, deletions or substitutions) required to change one word into the other.

Spice has two other methods to define new scorers based on other spicepod components:
 - Embedding models can be used to compute the similarity between the expected and actual output from the model being evaluated. Any `embeddings` model defined in the `spicepod.yaml` is automatically available as a scorer.
 - Other language models can be used to judge the model being evaluated. This is often called an LLM-as-a-judge. Any `models` model defined in the `spicepod.yaml` is automatically available as a scorer. Note, however, that these models should generally be configured purposefully to be a judge. There are also constraints the model must satisfy, see [below](#llm-judge).

Below is an example of an eval that uses all three: a builtin scorer, an embedding model scorer and an LLM judge.
```yaml
evals:
  - name: australia
    description: Make sure the model understands Aussies, and importantly Cricket.
    dataset: cricket_questions
    scorers:
      - hf_minilm
      - judge
      - match

embeddings:
  - name: hf_minilm
    from: huggingface:huggingface.co/sentence-transformers/all-MiniLM-L6-v2

models:
  - name: judge
    from: openai:gpt-4o
    params:
      openai_api_key: ${ secrets:OPENAI_API_KEY }
      parameterized_prompt: enabled
      system_prompt: |
        Score these two stories between 0.0 and 1.0 based on how similar their moral lesson is.

        Story A: {{ actual }}
        Story B: {{ ideal }}
      openai_response_format:
        type: json_schema
        json_schema:
          name: judge
          schema:
            type: object
            properties:
              score:
                type: number
                format: float
            additionalProperties: true
            required:
              - score
        strict: false
```

### LLM-as-a-Judge {#llm-judge}
Spicepod models can be used to provide eval scores for other models. To do so in Spice, the LLM must:
1. Return a valid JSON as the response. The JSON must have at least a single number field `.score`. e.g.
  ```json
  {
    "score": 0.42,
    "rationale": "It was a good story, they both are about love."
  }
  ```
2. Use [Parameterized prompts](docs/features/large-language-models/parameterized_prompts) to provide details about the eval step. When used as an eval scorer, the model will be provided with the following variables: `input`, `actual` & `ideal`. The type of these variables will depend on the dataset, as per the [dataset format](#dataset-formats).
