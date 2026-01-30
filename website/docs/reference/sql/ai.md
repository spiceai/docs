---
title: 'AI Functions'
sidebar_label: 'AI Functions'
pagination_prev: 'reference/sql/information_schema'
sidebar_position: 5
---

AI functions in Spice provide direct integration with large language models (LLMs) and embedding models within SQL queries. These functions process text through configured model providers and return generated responses or vector embeddings.

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

Returns a string containing the generated text response. Returns NULL if an error occurs during processing (errors are logged).

### Behavior

Queries execute asynchronously, processing LLM calls in parallel across rows for improved performance. Each invocation queues an asynchronous call to the specified model provider.

**Concurrency**: The function honors DataFusion concurrency configuration for parallel requests. When multiple models with different providers are configured (e.g., OpenAI and Anthropic), each provider processes requests in parallel according to concurrency settings.

**Limits**:

- Maximum batch size: 100 rows per query
- Maximum input message size: 1 MB per message

### Configuration

Models must be configured in `spicepod.yaml` under the `models` section. See [Large Language Models](../../features/large-language-models/) for detailed configuration.

```yaml
models:
  - name: gpt-4o
    from: openai:gpt-4o
    params:
      openai_api_key: ${secrets:openai_key}
```

### Task History

Each `ai()` function invocation creates an `ai` task in the [task_history](../task_history) table, which tracks execution time, input prompts, outputs, and errors.

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

Process multiple rows efficiently with parallel LLM calls:

```sql
SELECT
  customer_id,
  feedback,
  ai('Classify sentiment as positive, negative, or neutral: ' || feedback) AS sentiment
FROM customer_feedback
WHERE processed = false
LIMIT 100;
```

## `embed`

Generates vector embeddings for text using specified embedding models. Supports both single text strings and arrays of text for batch processing.

```sql
embed(text, model_name)
```

### Arguments

- **text**: String or array of strings to generate embeddings for.
- **model_name**: Name of the embedding model to use (e.g., 'potion_2m', 'xl_embed') as configured in your Spicepod.

### Return Type

Returns a list of floating-point values representing the embedding vector. For array inputs, returns embeddings for each element, preserving the input array length including NULL values.

### Configuration

Embedding models must be configured in `spicepod.yaml`. See [Embeddings](../../features/embeddings/) for configuration details.

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

- [Large Language Models](../../features/large-language-models/)
- [Embeddings](../../features/embeddings/)
- [Vector Search](../../features/search/vector-search)
- [Task History](../task_history)
