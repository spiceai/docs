---
title: 'OpenAI (or Compatible) Embedding Models'
sidebar_label: 'OpenAI'
sidebar_position: 1
---

To use a hosted OpenAI (or compatible) embedding model, specify the `openai` path in the `from` field of your configuration.

For a specific model, include its model ID in the `from` field. If no model ID is specified, it defaults to `"text-embedding-3-small"`.

The following parameters are specific to OpenAI models:

| Parameter           | Description                                                                                                                                                                                                                                                                            | Default                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `openai_api_key`    | The API key for accessing OpenAI.                                                                                                                                                                                                                                                      | -                           |
| `openai_org_id`     | The organization ID for OpenAI.                                                                                                                                                                                                                                                        | -                           |
| `openai_project_id` | The project ID for OpenAI.                                                                                                                                                                                                                                                             | -                           |
| `openai_identity_provider_id` | The OpenAI workload identity provider (`idp_...`) that verifies the workload's identity token. With `openai_service_account_id`, the embedding model authenticates with [workload identity federation](../../models/openai/index.md#workload-identity-federation) instead of `openai_api_key`. | - |
| `openai_service_account_id` | The OpenAI service account (`user-...`) that the workload identity provider's mapping resolves the workload to. Required for workload identity federation. | - |
| `openai_identity_token_audience` | The audience Spice requests the workload's identity token for, from GitHub Actions or the workload's cloud identity. Not used with `openai_identity_token_file`. The workload identity provider's Audience must match the `aud` claim of the token issued for this value, which is usually this value but, for a Microsoft Entra app registration that issues v2.0 access tokens, is the application ID. | `https://api.openai.com/v1` |
| `openai_identity_token_file` | A file that holds the workload's identity token, such as a Kubernetes projected service account token. Spice reads it again for every exchange. When unset, Spice requests the token from GitHub Actions, then from the workload's cloud identity. | - |
| `openai_usage_tier` | The [OpenAI usage tier](https://platform.openai.com/settings/organization/limits) for the account. This parameter sets the maximum number of concurrent requests based on OpenAI's published limits per tier. Valid values are `free`, `tier1`, `tier2`, `tier3`, `tier4`, or `tier5`. | `tier1`                     |
| `endpoint`          | The base endpoint for the OpenAI API.                                                                                                                                                                                                                                                  | `https://api.openai.com/v1` |

Credential parameters must keep the `openai_` prefix, including when `endpoint` points at an OpenAI-compatible provider such as Mistral — an unprefixed `api_key` is ignored with a warning at load time. `endpoint` is the exception and must not be prefixed.

Below is an example configuration in `spicepod.yaml`:

```yaml
embeddings:
  - from: openai:text-embedding-3-large
    name: xl_embed
    params:
      openai_api_key: ${ secrets:SPICE_OPENAI_API_KEY }

  - name: mistral
    from: openai:mistral-embed
    params:
      endpoint: https://api.mistral.ai/v1
      openai_api_key: ${ secrets:SPICE_MISTRAL_API_KEY }
```

For detailed instructions and examples on running vector searches, refer to the [Vector-Based Search documentation](../../features/search/vector-search).
