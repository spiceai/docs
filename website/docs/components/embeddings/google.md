---
title: 'Google Vertex AI Embedding Models'
sidebar_label: 'Google Vertex AI'
sidebar_position: 4
---

To use a hosted Google embedding model, specify the `google` path in the `from` field of your configuration.

Include the model ID in the `from` field; a model ID is required. For example, `google:gemini-embedding-001`.

Requests are sent to Vertex AI, which is scoped to a GCP project and region and authenticated with Google Cloud credentials. There is no API-key path: the Google AI Studio (`generativelanguage.googleapis.com`) endpoint and its `google_api_key` parameter are no longer supported.

The following parameters are specific to Google Vertex AI embedding models:

| Parameter                                | Description                                                                                                                                                          | Default |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `google_project`                         | Required. The GCP project ID. Only lowercase letters, digits, and hyphens.                                                                                            | -       |
| `google_location`                        | Required. The GCP region (for example `us-central1`), or `global`. A region is served by `<region>-aiplatform.googleapis.com`; `global` by `aiplatform.googleapis.com`. | -       |
| `google_service_account_path`            | Path to a GCP service account JSON key file.                                                                                                                          | -       |
| `google_service_account_key`             | The GCP service account JSON key itself, as a string. Supports [secret replacement](../secret-stores).                                                                | -       |
| `google_application_default_credentials` | Set to `true` to authenticate with Application Default Credentials, read from the path in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.                    | `false` |
| `dimensions`                             | The output dimensionality of the embeddings. Some embedding models support dynamic output sizes.                                                                       | -       |

`google_project` and `google_location` are both required, and **exactly one** of `google_service_account_path`, `google_service_account_key`, or `google_application_default_credentials` must be set — setting none, or more than one, fails the embedding model at load with an error naming the three.

Below is an example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: google:gemini-embedding-001
    name: gemini_embeddings
    params:
      google_project: my-gcp-project
      google_location: us-central1
      google_service_account_path: /etc/spice/gcp-service-account.json
      dimensions: 768 # optional parameter
```

See [Vertex AI text embeddings](https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings) for the embedding models available in your project and region.

For detailed instructions and examples on running vector searches, refer to the [Vector-Based Search documentation](../../features/search/vector-search).
