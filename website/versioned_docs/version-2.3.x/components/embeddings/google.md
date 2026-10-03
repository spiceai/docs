---
title: 'Google Vertex AI Embedding Models'
sidebar_label: 'Google Vertex AI'
sidebar_position: 4
---

`from: google:<model-id>` selects a Vertex AI embedding model. A model ID, GCP project, location,
and Google Cloud credentials are required. Google AI Studio API keys are not supported.

| Parameter                                | Description                                                                                                                                                          | Default |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `google_project`                         | Required. GCP project ID containing lowercase letters, digits, and hyphens.                                                                                          | -       |
| `google_location`                        | Required. GCP region (for example `us-central1`) or `global`.                                                                                                         | -       |
| `google_service_account_path`            | Path to a GCP service account JSON key file.                                                                                                                          | -       |
| `google_service_account_key`             | Service account JSON. Supports [secret replacement](../secret-stores).                                                                                              | -       |
| `google_application_default_credentials` | Application Default Credentials from the file specified by `GOOGLE_APPLICATION_CREDENTIALS`.                                                                        | `false` |
| `dimensions`                             | The output dimensionality of the embeddings. Some embedding models support dynamic output sizes.                                                                       | -       |

Authentication requires exactly one of `google_service_account_path`, `google_service_account_key`,
or `google_application_default_credentials: true`.

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

[Vertex AI text embeddings](https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings) lists model availability by project and region.

For detailed instructions and examples on running vector searches, refer to the [Vector-Based Search documentation](../../features/search/vector-search).
