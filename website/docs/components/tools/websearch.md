---
title: 'Web Search Tool'
sidebar_label: 'Websearch'
---

The Web Search Tool enables Spice models to search the web for information. The tool is available through the `websearch` tool, and backed by different search engines.

## Usage
```yaml
tools:
  - name: the_internet
    from: websearch
    description: "Search the web for information."
    params:
      engine: perplexity
      perplexity_auth_token: ${ secrets:SPICE_PERPLEXITY_AUTH_TOKEN }
```

# Configuration
## `from`

The `from` field is used to specify the tool to use. For the Web Search Tool, use `websearch`.

## `name`

The `name` field is used to specify the name of the tool. This name is used:
 - To reference the tool in the model's `params.tools` field
 - To make HTTP requests to the tool via the [API](/docs/api/HTTP/post), i.e. `v1/tools/{name}`.
 - Provided to any language model that uses the tool.

## `description`

The `description` field is used to provide a description of the tool. This description is provided to any language model that uses the tool.

## `params`

The `params` field is used to ... The following parameters are supported:
 - `engine`: The search engine to use. Possible values:
   - `perplexity`: Use the Perplexity search engine.
 - `engine_*`: Each search engine has its own set of parameters. See the documentation for the specific search engine for more information.

# Search Engines
- [Perplexity](https://perplexity.com): Powered by Perplexity [Sonar](https://docs.perplexity.ai/).

## Perplexity
To define a Perplexity search engine, use the following parameters:
 - `perplexity_auth_token` (required):  The authentication token for the Perplexity API. Use the [secret replacement syntax](../secret-stores/index.md) to reference a secret, e.g. `${secrets:my_perplexity_auth_token}`. To get an authentication token, see Perplexity's [Getting Started](https://docs.perplexity.ai/guides/getting-started).
 - `perplexity_return_images` (default: false): Determines whether or not a request should return images.
 - `perplexity_return_related_questions` (default: false): Determines whether or not a request should return related questions.
  - `perplexity_search_domain_filter`: Given a list of domains, limit the citations used by the online model to URLs from the specified domains. Currently limited to only 3 domains for whitelisting and blacklisting. For blacklisting add a - to the beginning of the domain string.
    - Example:
      ```yaml
      perplexity_search_domain_filter:
        - spice.ai
        - docs.perplexity.ai
      ```
  - `perplexity_search_recency_filter`: Returns search results within the specified time interval - does not apply to images. One of: `month`, `week`, `day`, `hour`.
