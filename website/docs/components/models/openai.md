---
title: 'OpenAI (or Compatible) Language Models'
description: 'Instructions for using language models hosted on OpenAI or compatible services with Spice.'
sidebar_label: 'OpenAI'
sidebar_position: 1
---

To use a language model hosted on OpenAI (or compatible), specify the `openai` path in the `from` field.

For a specific model, include it as the model ID in the `from` field (see example below). The default model is `gpt-4o-mini`.

```yaml
models:
  - from: openai:gpt-4o-mini
    name: openai_model
    params:
      openai_api_key: ${ secrets:OPENAI_API_KEY } # Required for official OpenAI models
      tools: auto # Optional. Connect the model to datasets via SQL query/vector search tools
      system_prompt: 'You are a helpful assistant.' # Optional.

      # Optional parameters
      endpoint: https://api.openai.com/v1 # Override to use a compatible provider (i.e. NVidia NIM)
      openai_org_id: ${ secrets:OPENAI_ORG_ID }
      openai_project_id: ${ secrets:OPENAI_PROJECT_ID }

      # Override default chat completion request parameters
      openai_temperature: 0.1
      openai_response_format: { 'type': 'json_object' }

      # OpenAI Responses API configuration
      responses_api: enabled
      openai_responses_tools: web_search, code_interpreter
```

## Configuration

### `from`

The `from` field takes the form `openai:model_id` where `model_id` is the model ID of the OpenAI model, valid model IDs are found in the `{endpoint}/v1/models` API response.

Example:

```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "created": 1727389042,
      "owned_by": "system"
    },
...
}
```

### `name`

The model name. This will be used as the model ID within Spice and Spice's endpoints (i.e. `http://localhost:8090/v1/models`). This can be set to the same value as the model ID in the `from` field.

### `params`

| Param                     | Description                                                                                        | Default                     |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------- |
| `endpoint`                | The OpenAI API base endpoint. Can be overridden to use a compatible provider (i.e. Nvidia NIM).    | `https://api.openai.com/v1` |
| `tools`                   | Which [tools] should be made available to the model. Set to `auto` to use all available tools.     | -                           |
| `system_prompt`           | An additional system prompt used for all chat completions to this model.                           | -                           |
| `openai_api_key`          | The OpenAI API key.                                                                                | -                           |
| `openai_org_id`           | The OpenAI organization ID.                                                                        | -                           |
| `openai_project_id`       | The OpenAI project ID.                                                                             | -                           |
| `openai_temperature`      | Set the default temperature to use on chat completions.                                            | -                           |
| `openai_response_format`  | An object specifying the format that the model must output, see [structured outputs].              | -                           |
| `openai_reasoning_effort` | For reasoning models, like `o1`, this parameter specifies the reasoning effort used for the model. | -                           |
| `openai_usage_tier`       | The [OpenAI usage tier](https://platform.openai.com/settings/organization/limits) for the account. This parameter sets the maximum number of concurrent requests based on OpenAI's published limits per tier. Valid values are `free`, `tier1`, `tier2`, `tier3`, `tier4`, or `tier5`. | `tier1`                     |
| `responses_api`           | `enabled` or `disabled`. Whether to enable invoking this model from the `/v1/responses` HTTP endpoint using [OpenAI's Responses API](https://platform.openai.com/docs/api-reference/responses). When using OpenAI-compatible providers, ensure the provider supports OpenAI's Responses API. | `disabled` |
| `openai_responses_tools`  | Comma-separated list of OpenAI-hosted tools exposed via the Responses API for this model.  These hosted tools are **not** available from the `/v1/chat/completions` HTTP endpoint. Supported tools: `code_interpreter`, `web_search`. | -                           |

[tools]: ../../features/large-language-models/tools.md
[structured outputs]: https://platform.openai.com/docs/guides/structured-outputs

See [Large Language Models](../../features/large-language-models) for additional configuration options.

- [Tools](../../features/large-language-models/tools.md)
- [Memory](../../features/large-language-models/memory.md)
- [Evals](../../features/large-language-models/evals.md)
- [Parameter overrides](../../features/large-language-models/parameter_overrides.md)

## Supported OpenAI Compatible Providers

Spice supports several OpenAI compatible providers. Specify the appropriate endpoint in the params section.

### Azure OpenAI

Follow [Azure AI Models](./azure) instructions.

### Groq

Groq provides OpenAI compatible endpoints. Use the following configuration:

```yaml
models:
  - from: openai:llama3-groq-70b-8192-tool-use-preview
    name: groq-llama
    params:
      endpoint: https://api.groq.com/openai/v1
      openai_api_key: ${ secrets:SPICE_GROQ_API_KEY }
```

### NVidia NIM

NVidia NIM models are OpenAI compatible endpoints. Use the following configuration:

```yaml
models:
  - from: openai:my_nim_model_id
    name: my_nim_model
    params:
      endpoint: https://my_nim_host.com/v1
      openai_api_key: ${ secrets:SPICE_NIM_API_KEY }
```

View the Spice cookbook for an example of setting up NVidia NIM with Spice [here](https://github.com/spiceai/cookbook/tree/trunk/nvidia-nim/ec2).

### Parasail

Parasail also offers OpenAI compatible endpoints. Use the following configuration:

```yaml
models:
  - from: openai:parasail-model-id
    name: parasail_model
    params:
      endpoint: https://api.parasail.com/v1
      openai_api_key: ${ secrets:SPICE_PARASAIL_API_KEY }
```

Refer to the respective provider documentation for more details on available models and configurations.
