---
title: 'Language Models Tools'
sidebar_label: 'Tools'
description: 'Learn how LLMs interact with the Spice runtime.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - models
  - tools
  - runtime
---

Spice provides tools that help LLMs interact with the runtime. To specify these tools for a Spice model, include them in its `params.tools`.

For a list of available tools, or how to define additional tools, see [Tool Components](../../components/tools).

### Tool Modes

The `tools` parameter on a model controls how tools are provided to the LLM:

| Value | Description |
| --- | --- |
| `auto` | Automatically choose between direct tools and searchable registry discovery. When the number of available tools exceeds 20 and an embedding model is available, `auto` switches to registry-based discovery; otherwise it uses direct tools. |
| `all` | Provide all built-in and Spicepod-configured tools directly to the LLM. |
| `search_registry` | Use searchable registry discovery. The LLM receives `tool_search` and `tool_invoke` meta-tools instead of individual tool definitions. Requires an embedding model (see `tool_embedding_model`). |
| `nsql` | Provide only the built-in tools relevant to text-to-SQL: `table_schema`, `sql`, `list_datasets`, `get_current_datetime`, `random_sample`, `sample_distinct_columns`, and `top_n_sample`. |
| `disabled` | Provide no tools to the LLM. |
| `<tool1>, <tool2>, ...` | Provide only the named tools directly. |

### Example: Specifying Tools for a Model

```yaml
models:
  - name: sql-model
    from: openai:gpt-4o
    params:
      tools: list_datasets, sql, table_schema
```

### Example: Using all default tools directly

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: all
```

### Example: Using auto mode (default)

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: auto
```

For details on tool groups, see [Tool Components](../../components/tools#tool-groups).

### Tool Registry

When the runtime exposes many tools (multiple MCP servers, lots of dataset-bound tools, or many [Functions](../functions) declared with `as_tool: true`), passing every tool definition into every chat turn consumes a large portion of the context window and degrades selection accuracy. The **Tool Registry** replaces individual tool definitions with two meta-tools — `tool_search` and `tool_invoke` — backed by a hybrid search index over the runtime's tool catalog. This typically saves **~10×** the per-turn tool-definition tokens for tool-heavy Spicepods.

`tools: auto` enables the registry automatically when there are more than 20 tools and an embedding model is configured; `tools: search_registry` requires it.

See **[Tool Registry](../tool-registry)** for the full reference, including the hybrid-search algorithm, `tool_search` / `tool_invoke` parameters and response shapes, and guidance on when to prefer direct tools.

### Example: Specifying tools and tool groups

```yaml
models:
  - name: full-runtime
    from: openai:gpt-4o
    params:
      tools: memory, sql
```

### Tool Recursion Limit

When a model requests to call a runtime tool, Spice runs the tool internally and feeds the result back to the model. The model may then request another tool call based on the result, creating a chain of tool invocations. The `tool_recursion_limit` parameter limits the depth of this internal recursion. By default, this limit is set to 10.

Lowering the limit can help prevent runaway tool chains in cases where a model repeatedly invokes tools without converging on a final answer.

```yaml
models:
  - name: my-model
    from: openai
    params:
      tool_recursion_limit: 3
```

On `/v1/responses`, the round after the last permitted tool round is sent to the model without Spice's tools, so the response ends with an answer rather than a tool call that Spice does not run. On [`/v1/messages`](messages.md#spice-tools), Spice runs the last permitted round's calls and the response ends with `stop_reason: pause_turn`, for the client to continue.

### Text Written Beside a Tool Call

A model can write text and call a Spice tool in the same step, for example "Let me check." followed by a `sql` call. On [`/v1/chat/completions`](../../api/HTTP/post-chat-completions), Spice sends that text back to the model with the tool call and its results, and the response message carries the text, a blank line, and then the answer, whether or not the response is streamed:

```text
Let me check.

There are 3 rows.
```

There is no blank line when the text already ends with whitespace or the answer already starts with it. When the request sets `logprobs`, there is no blank line either, so `content` is exactly the text its log probabilities cover. A response that is not streamed and uses a `json_object` or `json_schema` `response_format` carries only the answer, so it parses as JSON.

### Tool Calls in Responses API Output

On the [`/v1/responses`](../../api/HTTP/post-responses) endpoint, each Spice tool call the model made appears in the response `output` as an `mcp_call` item, at the position where the model made the call. Spice has already run the call, so clients that follow the OpenAI convention for server-run tool calls, including the OpenAI Agents SDKs, do not try to run it themselves.

```json
{
  "type": "mcp_call",
  "id": "mcp_spice_call_Zx3",
  "server_label": "spice",
  "name": "sql",
  "arguments": "{\"query\":\"SELECT region, SUM(quantity * unit_price) AS revenue FROM orders GROUP BY region\"}",
  "output": "[{\"region\":\"north\",\"revenue\":124.0}]",
  "error": null,
  "approval_request_id": null,
  "status": "completed"
}
```

The item's `server_label` is `spice`, and its `id` is `mcp_spice_` followed by the model's call ID. `output` is the tool result exactly as the model received it: a string result as is, and any other value as JSON. A call that failed has `"status": "failed"` and the error message the model received in `output`.

Because Spice tool calls precede the answer, `output[0]` is not necessarily the model's message. Read the answer from the `message` items in `output`, or with the `output_text` property of the OpenAI SDKs.

When streaming, a Spice tool call produces the same events OpenAI streams for a hosted MCP call: `response.output_item.added`, `response.mcp_call.in_progress`, `response.mcp_call_arguments.delta` and `response.mcp_call_arguments.done` as the model writes the arguments, then `response.mcp_call.completed` or `response.mcp_call.failed` and `response.output_item.done` after Spice runs the call.

A client that keeps its own conversation history can send the `output` items back as the next request's `input` unchanged. Before calling the model provider, Spice converts each of its `mcp_call` items back into the `function_call` and `function_call_output` pair the model originally saw, so the model knows which tools it called and what they returned. If an item comes back without its `output`, as the OpenAI Agents SDK for JavaScript sends it, the model receives a note that the result was not sent back, and still sees the call and its arguments. Spice does not run a replayed call again. Hosted MCP calls from other servers pass through unchanged, and requests that continue a conversation with `previous_response_id` are unaffected.

### Tool Calls in Earlier Chat Completions Turns

On the [`/v1/chat/completions`](../../api/HTTP/post-chat-completions) endpoint, the response carries only the model's answer, not the Spice tool calls and tool results that produced it, so a client cannot send them back on its next turn. Spice keeps them instead. When a request continues a conversation that ended in an answer from Spice, Spice puts the tool calls and results of the earlier turns back in their places before calling the model, so the model knows which tools it ran and what they returned. The client sends its conversation history as usual, and no extra parameter or header is needed.

Spice matches a request to its conversation by the caller's identity and the messages up to and including the last assistant message, which must be the answer Spice returned. Steps stored for one authenticated caller are never restored for another. Requests without an authenticated identity, such as requests to a runtime without [API key authentication](../../api/auth/index.md), share one anonymous scope, so two such clients that send identical conversation histories can restore the same steps. Only the latest point of each conversation is kept: after a turn succeeds, its stored steps move to the new point, so a request that sends an earlier turn again, for example to regenerate an answer, gets no steps restored. A turn that fails, or a stream that the client disconnects from before it ends, leaves the stored steps unchanged.

The steps are held in memory, up to about 128 MiB of message data for each model that uses tools, so a Spicepod with several such models can hold more in total. When that bound is reached, the least recently used conversation is evicted first. Stored steps do not expire otherwise. A restart of the runtime clears them.

## Cookbook

- A cookbook recipe to query data with natural language using the built-in text-to-SQL tools. [Text-to-SQL (NSQL)](https://github.com/spiceai/cookbook/tree/trunk/text-to-sql#readme)
