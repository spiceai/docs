---
title: 'Google Vertex AI Models'
description: 'Instructions for using language models hosted on Google Vertex AI with Spice.'
sidebar_label: 'Google Vertex AI'
sidebar_position: 5
---

`from: google:<model-id>` selects a Vertex AI language model. A model ID, GCP project, location,
and Google Cloud credentials are required. Google AI Studio API keys are not supported.

| Parameter                                | Description                                                                                                                                                          | Default |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `google_project`                         | Required. GCP project ID containing lowercase letters, digits, and hyphens.                                                                                          | -       |
| `google_location`                        | Required. GCP region (for example `us-central1`) or `global`.                                                                                                         | -       |
| `google_service_account_path`            | Path to a GCP service account JSON key file.                                                                                                                          | -       |
| `google_service_account_key`             | Service account JSON. Supports [secret replacement](../secret-stores).                                                                                              | -       |
| `google_application_default_credentials` | Application Default Credentials from the file specified by `GOOGLE_APPLICATION_CREDENTIALS`.                                                                        | `false` |

Authentication requires exactly one of `google_service_account_path`, `google_service_account_key`,
or `google_application_default_credentials: true`.

Example `spicepod.yml` configuration:

```yaml
models:
  - from: google:gemini-2.5-pro
    name: gemini
    params:
      google_project: my-gcp-project
      google_location: us-central1
      google_service_account_path: /etc/spice/gcp-service-account.json
```

`google_service_account_key: ${ secrets:GCP_SERVICE_ACCOUNT_KEY }` selects a secret instead of a file.

[Vertex AI Generative AI models](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models) lists model availability by project and region.

See [Large Language Models](../../features/large-language-models) for additional configuration options:

- [Tools](../../features/large-language-models/tools)
- [Memory](../../features/large-language-models/memory)
- [Parameter overrides](../../features/large-language-models/parameter_overrides)
