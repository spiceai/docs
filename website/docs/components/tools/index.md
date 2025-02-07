---
title: 'Tools'
sidebar_label: 'Tools (Function calling)'
description: 'Overview of supported runtime tools & how to define new tools'
---

A tool is a function or operation that can be called directly or by a [language model](/docs/features/large-language-models) (LLMs). The Spice runtime has several tools available by default, allowing LLMs access to various parts of the runtime. Tools can also be added or configured by the user by declaring them in the `tools` section of `spicepod.yaml`.

For details about how to provide LLMs access to tools, see [Language Model Tools](/docs/features/large-language-models/tools).

**Example**
```yaml
tools:
  - name: arpanet
    from: websearch
    description: "Search the web for information."
    params:
      engine: perplexity
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }

```

For detailed specification on defining tools, see the [Tools Spicepod Reference](/docs/reference/spicepod/tools).

### Available Tools

| Name                      | Description                                                       | Within `auto`     |
| ------------------------- | ----------------------------------------------------------------- | ----------------- |
| `list_datasets`           | List all available datasets in the runtime.                       | Yes               |
| `sql`                     | Execute SQL queries on the runtime.                               | Yes               |
| `table_schema`            | Get the schema of a specific SQL table.                           | Yes               |
| `document_similarity`     | Retrieve documents based on an input query.                       | Yes               |
| `sample_distinct_columns` | Generate a synthetic sample of data with distinct values.         | Yes               |
| `random_sample`           | Sample random rows from a table.                                  | Yes               |
| `top_n_sample`            | Sample the top N rows from a table based on a specified ordering. | Yes               |
| `memory:load`             | Retrieve all stored memories from the last time period.           | No                |
| `memory:store`            | Store information from LLM interaction(s) for future reference.   | No                |
| [`websearch`][websearch]  | Search the web for information.                                   | No                |

[websearch]: /docs/components/tools/websearch

### Tool Group
TBD here or in LLM using tool.
