---
title: 'xAI Models'
description: 'Instructions for using xAI models'
sidebar_label: 'xAI'
sidebar_position: 7
---

To use a language model hosted on xAI, specify `xai` path in the `from` field and the associated `xai_api_key` parameter:

| Param                   | Description                                                                         | Default    |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------- |
| `xai_api_key`           | The xAI API key.                                                                    | -          |

Example:

```yaml
models:
- from: xai:grok2-latest
  name: xai
  params:
    xai_api_key: ${secrets:SPICE_GROK_API_KEY}
```

Refer to the [xAI models documentation](https://docs.x.ai/docs/models) for more details on available models and configurations.

:::note
Although the xAI [documentation](https://docs.x.ai/docs/guides/structured-outputs) show that xAI models can returned structured outputs, this is not true.
:::
