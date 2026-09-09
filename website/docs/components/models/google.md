---
title: 'Google Vertex AI Models'
description: 'Instructions for using language models hosted on Google Vertex AI with Spice.'
sidebar_label: 'Google Vertex AI'
sidebar_position: 5
---

To use a language model hosted on Google Vertex AI, specify `google` in the `from` field.

Include a model ID in the `from` field (see example below); a model ID is required. Spice does not apply a default model — the model fails to load if the ID is omitted (`from: google`).

Requests are sent to Vertex AI, which is scoped to a GCP project and region and authenticated with Google Cloud credentials. There is no API-key path: the Google AI Studio (`generativelanguage.googleapis.com`) endpoint and its `google_api_key` parameter are no longer supported.

The following parameters are specific to Google Vertex AI models:

| Parameter                                | Description                                                                                                                                                          | Default |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `google_project`                         | Required. The GCP project ID. Only lowercase letters, digits, and hyphens.                                                                                            | -       |
| `google_location`                        | Required. The GCP region (for example `us-central1`), or `global`. A region is served by `<region>-aiplatform.googleapis.com`; `global` by `aiplatform.googleapis.com`. | -       |
| `google_service_account_path`            | Path to a GCP service account JSON key file.                                                                                                                          | -       |
| `google_service_account_key`             | The GCP service account JSON key itself, as a string. Supports [secret replacement](../secret-stores).                                                                | -       |
| `google_application_default_credentials` | Set to `true` to authenticate with Application Default Credentials, read from the path in the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.                    | `false` |

`google_project` and `google_location` are both required, and **exactly one** of `google_service_account_path`, `google_service_account_key`, or `google_application_default_credentials` must be set — setting none, or more than one, fails the model at load with an error naming the three.

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

Authenticating with a key held in a secret store instead of a file on disk:

```yaml
models:
  - from: google:gemini-2.5-pro
    name: gemini
    params:
      google_project: my-gcp-project
      google_location: global
      google_service_account_key: ${ secrets:GCP_SERVICE_ACCOUNT_KEY }
```

See [Vertex AI Generative AI models](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models) for the models available in your project and region.

See [Large Language Models](../../features/large-language-models) for additional configuration options:

- [Tools](../../features/large-language-models/tools)
- [Memory](../../features/large-language-models/memory)
- [Parameter overrides](../../features/large-language-models/parameter_overrides)
