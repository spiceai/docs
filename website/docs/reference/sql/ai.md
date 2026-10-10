---
title: 'AI Functions'
sidebar_label: 'AI Functions'
pagination_prev: 'reference/sql/information_schema'
sidebar_position: 5
---

AI functions in Spice provide direct integration with large language models (LLMs) and embedding models within SQL queries. These functions process text through configured model providers and return generated responses, typed decisions, or vector embeddings.

## `ai`

Invokes large language models (LLMs) directly within SQL queries for text generation tasks. This asynchronous function processes prompts through configured model providers and returns generated text responses.

```sql
ai(message)
ai(message, model_name)
```

### Arguments

- **message**: String prompt to send to the language model.
- **model_name** (optional): Name of the model to use as configured in your Spicepod. If omitted, the default model is used (only valid when exactly one model is configured).

### Return Type

Returns a string containing the generated text response. Returns NULL for NULL input messages or when the model returns an empty response. If the underlying model call fails, the query errors out (errors are logged).

### Behavior

Queries execute asynchronously, processing LLM calls in parallel across rows for improved performance. Each invocation issues an asynchronous call to the specified model provider.

**Concurrency**: When a per-model rate controller is configured in the Spicepod, it manages concurrency and backpressure. Otherwise, concurrency falls back to DataFusion's `execution.target_partitions` setting. When multiple models with different providers are configured (e.g., OpenAI and Anthropic), each provider's requests are controlled independently.

**Limits**:

- Maximum batch size: 1000 rows per invocation. Larger inputs are split into batches of up to 1000 rows, so a query can process any number of rows.
- Maximum input message size: 1,000,000 bytes (1 MB) per message
- Maximum model name length: 256 characters

### Configuration

Models must be configured in `spicepod.yaml` under the `models` section. See [Large Language Models](../../features/large-language-models) for detailed configuration.

```yaml
models:
  - name: gpt-4o
    from: openai:gpt-4o
    params:
      openai_api_key: ${secrets:openai_key}
```

### Task History

Each `ai()` function invocation creates an `ai` span in the [task_history](../task_history) table, which tracks execution time, input prompts, model name, and row count. Child `ai_completion` spans capture per-row model call details.

### Examples

#### Using default model

When only one model is configured, the model name can be omitted:

```sql
SELECT
  zone,
  ai(concat_ws(' ', 'Categorize the zone', zone, 'in a single word. Only return the word.')) AS category
FROM taxi_zones
LIMIT 10;
```

Example output:

```console
+-----------------------+-------------+
| zone                  | category    |
+-----------------------+-------------+
| Newark Airport        | Transport   |
| Jamaica Bay           | Nature      |
| Allerton/Pelham...    | Residential |
| Alphabet City         | Urban       |
| Arden Heights         | Suburban    |
+-----------------------+-------------+
```

#### Specifying a model explicitly

When multiple models are configured, specify which model to use:

```sql
SELECT
  product_name,
  ai('Summarize this product in 5 words: ' || product_description, 'gpt-4o') AS summary
FROM products
LIMIT 5;
```

#### Generating search terms

Use the `ai()` function to generate search terms for enhanced search functionality:

```sql
SELECT
  user_query,
  ai('Generate 3 alternative search terms for: ' || user_query, 'gpt-4o-mini') AS alt_terms
FROM user_searches
WHERE created_at > NOW() - INTERVAL '1 hour';
```

#### Batch text processing

Process multiple rows with parallel LLM calls. Each `ai()` invocation receives at most 1000 rows, and larger inputs are split across invocations. Use `LIMIT` to bound the number of model calls:

```sql
SELECT
  customer_id,
  feedback,
  ai('Classify sentiment as positive, negative, or neutral: ' || feedback) AS sentiment
FROM customer_feedback
WHERE processed = false
LIMIT 1000;
```

## Decision functions

Decision functions ask a model a typed question about each row and return a typed answer: a boolean, a probability, a label, a score, or a struct of answers. Any model in the Spicepod can answer, including a decision model such as [TypeSafe](../../components/models/typesafe.md) Jev or any chat model. See [Decisions](../../features/large-language-models/decisions.md) for the full guide, the `/v1/decisions` HTTP API, and how a chat model answers.

```sql
ai_if(input, condition[, model => 'name'][, on_error => 'fail' | 'null'])
ai_probability(input, condition[, model => 'name'][, on_error => 'fail' | 'null'])
ai_classify(input, labels[, instructions => '...'][, model => 'name'][, on_error => 'fail' | 'null'])
ai_score(input, instructions, levels[, model => 'name'][, on_error => 'fail' | 'null'])
ai_decide(input, questions[, model => 'name'][, on_error => 'fail' | 'null'])
```

### Common arguments

- **input**: The value to decide about. Text is sent as text; a struct, map, or list is sent as JSON; binary data is refused and must be cast to text first. A NULL `input` returns NULL without a model call.
- **model** (optional): The name of a model in the Spicepod. When omitted, Spice uses the only model that can answer or, when there are several, the only decision model among them. Otherwise the query fails and lists the models to choose from.
- **on_error** (optional): `'fail'` (the default) stops the query when the model cannot answer a row, after retrying rate limits and transient failures. `'null'` returns NULL for that row.

Every argument except `input` must be a constant. Constants are checked when the query is planned, before any model call.

### `ai_if`

Returns `BOOLEAN`: true when the probability that `condition` holds for `input` is above 0.5.

```sql
SELECT id, subject FROM tickets
WHERE status = 'open' AND ai_if(body, 'The customer is asking for a refund');
```

### `ai_probability`

Returns `DOUBLE` from 0 to 1: the probability that `condition` holds for `input`.

```sql
SELECT id, ai_probability(body, 'The customer threatens to cancel') AS churn_risk
FROM tickets
ORDER BY churn_risk DESC;
```

### `ai_classify`

Returns `VARCHAR`: the label that best fits `input`, always one of `labels`. `labels` is a list of 2 to 255 labels, such as `['billing', 'technical']`, or a JSON object of label to description, such as `'{"billing": "Payments and refunds", "technical": null}'`. Labels cannot be empty or repeated. Optional `instructions => '...'` adds guidance. Include a fallback label such as `'other'` when no label may fit.

```sql
SELECT id, ai_classify(body, ['billing', 'technical', 'other']) AS team
FROM tickets;
```

### `ai_score`

Returns `DOUBLE` from 0 to n−1: the probability-weighted, 0-based index of `levels`. `levels` is a list of 2 to 10 level descriptions, lowest first.

```sql
SELECT id, ai_score(body, 'How frustrated is the customer?', ['calm', 'annoyed', 'furious']) AS frustration
FROM tickets
ORDER BY frustration DESC;
```

### `ai_decide`

Returns `STRUCT` with one field per question. `questions` is a JSON object of question ID to question in TypeSafe's grammar, the same grammar as Databricks' `ai_decide`: each question has a `type` of `noul`, `choice`, or `score`, and `instructions`. A `choice` maps 1 to 255 labels to descriptions in `criteria`, and a `score` lists 2 to 10 levels in `criteria`, lowest first. See [Ask several questions with `ai_decide`](../../features/large-language-models/decisions.md#ask-several-questions-with-ai_decide) for the answer fields.

```sql
SELECT id, d['team']['choice'] AS team, d['urgent']['probability'] AS urgency
FROM (
  SELECT id, ai_decide(body, '{
    "team":   {"type": "choice", "instructions": "Which team should handle this?",
               "criteria": {"billing": "Payments and payouts", "technical": "Bugs and outages"}},
    "urgent": {"type": "noul", "instructions": "Does this convey urgency?"}
  }') AS d
  FROM tickets
);
```

### Decision function behavior

Calls to `ai_if`, `ai_probability`, `ai_classify`, and `ai_score` in one `SELECT` list or `WHERE` clause that share the same `input`, `model`, and `on_error` are answered by one request per row. In `WHERE`, the clause's other predicates run first, so the model only sees rows that pass them. Decision functions are never pushed down to a federated source.

Each batch of calls is recorded in the [task_history](../task_history.md) table as an `ai_decide` task. The model's `max_concurrency` and `requests_per_minute_limit` apply.

## `embed`

Generates vector embeddings for text using specified embedding models. Supports both single text strings and arrays of text for batch processing.

```sql
embed(text, model_name)
```

### Arguments

- **text**: String or array of strings to generate embeddings for. `Utf8` / `LargeUtf8` scalars and lists/arrays of strings are supported.
- **model_name**: Name of the embedding model to use (e.g., 'potion_2m', 'xl_embed') as configured in your Spicepod. Required — unlike `ai()`, `embed()` does not auto-select a default when only one model is configured.

### Return Type

- For a scalar string input: `List<Float32>` — a single embedding vector.
- For an array of strings: `List<List<Float32>>` — one embedding vector per element, preserving the input length. NULL input elements produce NULL output elements.

### Configuration

Embedding models must be configured in `spicepod.yaml`. See [Embeddings](../../features/embeddings) for configuration details.

```yaml
embeddings:
  - from: openai:text-embedding-3-small
    name: openai_embed
    params:
      openai_api_key: ${secrets:openai_key}
```

### Examples

#### Single text embedding

Generate an embedding for a single piece of text:

```sql
SELECT embed('hello world', 'potion_2m') AS embedding;
```

#### Multiple text embeddings

Generate embeddings for multiple strings in one call:

```sql
SELECT embed(['hey', 'there', 'sunshine'], 'potion_2m') AS embeddings;
```

#### Embedding for vector search

Generate embeddings to use with vector search:

```sql
SELECT
  title,
  embed(content, 'xl_embed') AS content_embedding
FROM documents
WHERE embedding IS NULL
LIMIT 1000;
```

---

For more information on configuring and using AI models, see:

- [Large Language Models](../../features/large-language-models)
- [Embeddings](../../features/embeddings)
- [Vector Search](../../features/search/vector-search)
- [Task History](../task_history)

## Cookbook

- A cookbook recipe to invoke LLMs in SQL queries with the `ai` function. [AI SQL Function](https://github.com/spiceai/cookbook/tree/trunk/ai#readme)
