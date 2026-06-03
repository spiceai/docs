---
title: 'Web Search'
sidebar_label: 'Web Search'
description: 'Learn how Spice can perform web search'
sidebar_position: 15
tags:
  - search
  - models
---

Spice provides web search functionality through OpenAI's hosted tools, enabling access to recent information and relevant context.

:::note
The `websearch` tool (backed by Perplexity) is no longer supported and was deprecated in [spiceai/spiceai#9910](https://github.com/spiceai/spiceai/pull/9910). Use OpenAI's hosted web search tool as described below.
:::

## Web Search Through OpenAI Hosted Tools

Spice supports web search using [OpenAI's hosted web search tool](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses) when using [OpenAI's Responses API](https://platform.openai.com/docs/api-reference/responses). Sample Spicepod configuration:

```yaml
models:
  - from: openai:gpt-4o-mini # Or any other model supported by OpenAI's Responses API
    name: openai_model
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
      tools: auto
      responses_api: enabled # Required for using web search
      openai_responses_tools: web_search # Allowlist the web search tool via OpenAI's Responses API
```

**Sample Usage (with the above configuration)**

Start Spice with `spice run`. Then, execute the following command, which makes a request to the `/v1/responses` endpoint.

```
curl -s -H "Content-Type: application/json" -X POST "http://localhost:8090/v1/responses" -d '{"model": "openai_model", "input": "what is the latest news today? use the web search tool"}' | jq -r '.output[] | select(.type=="message") | .content[] | select(.type=="output_text") | .text'
```

To invoke this model, use [`spice chat --responses`](../../cli/reference/chat) for an interactive REPL or the OpenAI-compatible `/v1/responses` HTTP endpoint in the runtime. To learn more about configuring models provided by OpenAI, view [the reference](../../components/models/openai).

## References

- [OpenAI Web Search Tool Documentation](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses)
- [OpenAI Responses API Documentation](https://platform.openai.com/docs/api-reference/responses)
