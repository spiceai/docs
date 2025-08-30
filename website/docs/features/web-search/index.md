---
title: 'Web Search'
sidebar_label: 'Web Search'
description: 'Learn how Spice can perform web search'
tags:
  - search
  - models
---

Spice provides web search functionality through LLMs and tools, enabling access to recent information and relevant context. Spice supports two ways of using web search in the runtime, namely through tools and through specific model providers.

## Web Search Through LLM Tools

One way of using web search with Spice is through the dedicated web search tool configured to use Perplexity as the engine. Sample Spicepod configuration:

```yaml
tools:
  - name: the_internet
    from: websearch
    description: 'Search the web for information.'
    params:
      engine: perplexity
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }
```

This tool can then be provided to any configured models like so:

```yaml
models:
  - from: openai:gpt-4.1
    name: my-model
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
      tools: websearch

  - from: anthropic:claude-3-5-sonnet-latest
    name: claude_3_5_sonnet
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
      tools: websearch

  - from: xai:grok4
    name: xai
    params:
      xai_api_key: ${secrets:SPICE_GROK_API_KEY}
      tools: websearch
```

These models can then be invoked via an interactive REPL through [`spice chat`](/docs/cli/reference/chat) or via the OpenAI-compatible `/v1/chat/completions` HTTP endpoint. To learn more about the web search tool, view [the reference](/docs/components/tools/websearch).

## Web Search Through OpenAI Hosted Tools

Spice also supports web search using OpenAI's hosted web search tool and OpenAI's Responses API. Sample Spicepod configuration:

```yaml
models:
  - from: openai:gpt-4o-mini # Or any other model supported by OpenAI's Responses API
    name: openai_model
    params:
      openai_api_key: ${secrets:OPENAI_API_KEY}
      responses_api: enabled # Required for using web search
      openai_responses_tools: web_search # Allowlist the web search tool via OpenAI's Responses API
```

To invoke this model, use [`spice chat --responses`](/docs/cli/reference/chat) for an interactive REPL or the OpenAI-compatible `/v1/responses` HTTP endpoint in the runtime. To learn more about configuring models provided by OpenAI, view [the reference](/docs/components/models/openai).
