---
title: 'Google AI Embedding Models'
sidebar_label: 'Google AI'
sidebar_position: 4
---

To use a hosted Google AI embedding model, specify the `google` path in the `from` field of your configuration.

For a specific model, include its model ID in the `from` field. If no model ID is specified, it defaults to `"text-embedding-004"`.

The following parameters are specific to Google AI embedding models:

| Parameter        | Description                                                                                      | Default |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------- |
| `google_api_key` | The API key for accessing Google AI.                                                             | -       |
| `dimensions`     | The output dimensionality of the embeddings. Some embedding models support dynamic output sizes. | -       |

Below is an example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: google:text-embedding-004
    name: gemini_embeddings
    params:
      google_api_key: ${ secrets:GEMINI_API_KEY }
      dimensions: 768 # optional parameter

  - from: google:embedding-001
    name: legacy_embeddings
    params:
      google_api_key: ${ secrets:GEMINI_API_KEY }
```

See [Google AI Embedding Models](https://ai.google.dev/gemini-api/docs/models/gemini#text-embedding) for a list of supported embedding models.

<<<<<<< HEAD
For detailed instructions and examples on running vector searches, refer to the [Vector-Based Search documentation](../../features/search/vector-search.md).
=======
For detailed instructions and examples on running vector searches, refer to the [Vector-Based Search documentation](../../features/search/vector-search).
>>>>>>> origin/trunk
