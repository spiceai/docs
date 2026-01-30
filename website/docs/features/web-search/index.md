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
      tools: websearch # configure the model to use the websearch tool.

  - from: anthropic:claude-3-5-sonnet-latest
    name: claude_3_5_sonnet
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
      tools: websearch # configure the model to use the websearch tool.

  - from: xai:grok4
    name: xai
    params:
      xai_api_key: ${secrets:SPICE_GROK_API_KEY}
      tools: websearch # configure the model to use the websearch tool.
```

These models can then be invoked via an interactive REPL through [`spice chat`](../cli/reference/chat.md) or via the OpenAI-compatible `/v1/chat/completions` HTTP endpoint. To learn more about the `websearch` tool, refer to [the reference](../../components/tools/websearch.md).

## Web Search Through OpenAI Hosted Tools

Spice also supports web search using [OpenAI's hosted web search tool](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses) when using [OpenAI's Responses API](https://platform.openai.com/docs/api-reference/responses). Sample Spicepod configuration:

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

Output:

```
Here are some of the latest news updates as of August 30, 2025:

**International Affairs**

- **Thailand's Prime Minister Removed from Office**: The Constitutional Court of Thailand has dismissed Prime Minister Paetongtarn Shinawatra from office due to ethical misconduct related to leaked phone calls with former Cambodian Prime Minister Hun Sen. ([en.wikipedia.org](https://en.wikipedia.org/wiki/2025?utm_source=openai))

- **Armenia and Azerbaijan Sign Peace Deal**: On August 8, Armenia and Azerbaijan signed a peace agreement mediated by the United States, ending 37 years of hostilities over the Nagorno-Karabakh region. ([en.wikipedia.org](https://en.wikipedia.org/wiki/2025?utm_source=openai))

**Science and Technology**

- **OpenAI Releases GPT-5**: OpenAI has unveiled GPT-5, an upgraded version of its language model, featuring "PhD-level intelligence." ([en.wikipedia.org](https://en.wikipedia.org/wiki/2025_in_science?utm_source=openai))

- **NASA-ISRO Synthetic Aperture Radar (NISAR) Satellite Launched**: A joint project between NASA and the Indian Space Research Organisation (ISRO), the NISAR satellite was launched on July 30, 2025. It is the first dual-band radar imaging satellite, designed for remote sensing of Earth's surface. ([en.wikipedia.org](https://en.wikipedia.org/wiki/2025_in_spaceflight?utm_source=openai))

**United States**

- **Federal Reserve Governor Lisa Cook Dismissed**: President Donald Trump has removed Federal Reserve Governor Lisa Cook from her position, citing "false statements" on "one or more mortgage agreements." This decision has led to a weakening of the U.S. dollar. ([cnbc.com](https://www.cnbc.com/2025/08/25/stock-market-today-live-updates.html?utm_source=openai))

- **Stock Market Performance**: On August 26, 2025, major U.S. stock indices closed with gains. The Nasdaq Composite advanced 0.44%, the S&P 500 gained 0.41%, and the Dow Jones Industrial Average climbed 0.30%. ([cnbc.com](https://www.cnbc.com/2025/08/25/stock-market-today-live-updates.html?utm_source=openai))

**Space Exploration**

- **SpaceX's Seventh Starship Test Flight**: On January 16, 2025, SpaceX launched its seventh test flight of the Starship launch vehicle from its Starbase site in Boca Chica, Texas. The first stage was successfully recovered, but the second stage broke up shortly before engine shutdown. ([en.wikipedia.org](https://en.wikipedia.org/wiki/2025_in_Texas?utm_source=openai))

Please note that news developments are ongoing, and it's advisable to consult multiple sources for the most current information.
```

To invoke this model, use [`spice chat --responses`](../cli/reference/chat.md) for an interactive REPL or the OpenAI-compatible `/v1/responses` HTTP endpoint in the runtime. To learn more about configuring models provided by OpenAI, view [the reference](../../components/models/openai.md).

## References

- [Perplexity Search Documentation](https://docs.perplexity.ai/getting-started/overview)
- [OpenAI Web Search Tool Documentation](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses)
- [OpenAI Responses API Documentation](https://platform.openai.com/docs/api-reference/responses)
