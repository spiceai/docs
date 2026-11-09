---
title: 'Anthropic Models'
description: 'Instructions for using language models hosted on Anthropic with Spice.'
sidebar_label: 'Anthropic'
sidebar_position: 3
---

To use a language model hosted on Anthropic, specify `anthropic` in the `from` field.

To use a specific model, include its model ID in the `from` field (see example below). If not specified, the default model is `claude-sonnet-4-6`. Name a model explicitly for anything long-lived: Anthropic retires model IDs, and a request for a retired one fails with a `not_found_error`.

The default deliberately trails Anthropic's newest model. Claude 5 models reject `temperature` and `top_p` individually, so a request that sets either of them fails against them; `claude-sonnet-4-6` is the newest model that still accepts each of them. It accepts them one at a time, not in every combination — Claude 4 and later reject `temperature` and `top_p` set *together*, and reject a trailing assistant message (a response prefill). Set `from: anthropic:<model_id>` to use a newer model, and drop these parameters when you do.

When a model refuses `temperature` or `top_p`, Spice returns HTTP `400` with an error that names the model, the parameter, and where to remove it:

```
Failed to run a chat completion with Anthropic model 'claude-sonnet-5': the model does not accept the `temperature` parameter. Remove `temperature` from the request and from the model's `params` (as `temperature`, `anthropic_temperature` or `openai_temperature`), or set `from: anthropic:<model_id>` to a model that accepts it. Cause: `temperature` is deprecated for this model. See: https://spiceai.org/docs/components/models/anthropic
```

A streaming request receives the same message in an SSE `error` event.

Per-token log probabilities are not available from any Anthropic model — the Messages API returns none. A request that sets `logprobs: true` or `top_logprobs` is therefore refused by Spice before it reaches Anthropic, rather than answered with a completion that silently omits what was asked for. The refusal is an `invalid_request_error` naming the parameter:

```
Failed to run model 'claude-sonnet-4-6' (anthropic): the `top_logprobs` parameter is not supported. Anthropic's Messages API returns no per-token log probabilities. Remove `top_logprobs` from the request and from the model's parameters, or use a model provider that reports them. See: https://spiceai.org/docs/components/models/anthropic
```

Either field can arrive from the request or from the model's [parameter overrides](../../features/large-language-models/parameter_overrides), so remove it from both. `logprobs: false` asks for nothing and is accepted.

## Parallel Tool Calls

`parallel_tool_calls` defaults to `true`, as it does for OpenAI models, so an Anthropic model can call more than one tool in a single response. Set `parallel_tool_calls: false` in the request, or as the `anthropic_parallel_tool_calls` [parameter override](../../features/large-language-models/parameter_overrides), to ask for at most one tool call per response. Spice sends it to Anthropic as `disable_parallel_tool_use: true` on the request's `tool_choice`. `parallel_tool_calls` has no effect on a request that offers no tools or sets `tool_choice` to `none`, because Spice sends no `tool_choice` for it.

:::note

Through `v2.4.0-rc.3`, a request that set `tool_choice` without `parallel_tool_calls` was sent with `disable_parallel_tool_use: true`, and a request that set `parallel_tool_calls: false` without `tool_choice` was sent with parallel tool use enabled. Set `parallel_tool_calls: false` explicitly to keep at most one tool call per response.

:::

## Serving the Anthropic Messages API

A `from: anthropic` model also serves [`POST /v1/messages`](../../features/large-language-models/messages.md) natively: Spice forwards the client's Messages API request to Anthropic as sent, with the model's credentials, `system_prompt`, parameter overrides, and Spice tools applied. `POST /v1/messages/count_tokens` counts tokens only for `from: anthropic` models.

## Parameters

The following parameters are specific to Anthropic models:

| Parameter                | Description                                                                                                                      | Default                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `anthropic_api_key`      | The Anthropic API key.                                                                                                           | -                              |
| `anthropic_auth_token`   | The Anthropic Auth Token.                                                                                                        | -                              |
| `anthropic_workspace_id` | The Anthropic workspace ID, sent as the `anthropic-workspace-id` header. Required when the API key is not scoped to a workspace. | -                              |
| `anthropic_federation_rule_id` | The Anthropic federation rule (`fdrl_...`) that accepts the workload's identity token. With `anthropic_organization_id` and `anthropic_service_account_id`, the model authenticates with [workload identity federation](#workload-identity-federation) instead of `anthropic_api_key`. | - |
| `anthropic_organization_id` | The Anthropic organization ID (a UUID). Required for workload identity federation. | - |
| `anthropic_service_account_id` | The Anthropic service account (`svac_...`) that the federated access token acts as. Required for workload identity federation. | - |
| `anthropic_identity_token_audience` | The audience Spice requests the workload's identity token for, from GitHub Actions or the workload's cloud identity. Not used with `anthropic_identity_token_file`. | `https://api.anthropic.com` |
| `anthropic_identity_token_file` | A file that holds the workload's identity token, such as a Kubernetes projected service account token. Spice reads it again for every exchange. When unset, Spice requests the token from GitHub Actions, then from the workload's cloud identity. | - |
| `anthropic_usage_tier`   | Anthropic usage tier (1-4). Used for rate limit defaults.                                                                        | -                              |
| `endpoint`               | The Anthropic API base endpoint.                                                                                                 | `https://api.anthropic.com/v1` |

Example `spicepod.yml` configuration:

```yaml
models:
  - from: anthropic:claude-sonnet-4-5
    name: claude_4_5_sonnet
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
```

An API key that is not scoped to a single workspace needs `anthropic_workspace_id`, because Anthropic runs a request from a multi-workspace key in the workspace named by its `anthropic-workspace-id` header (see [API keys and resource scoping](https://platform.claude.com/docs/en/manage-claude/workspaces#api-keys-and-resource-scoping)). When the parameter is set, Spice sends the header on chat requests, on [Messages API](../../features/large-language-models/messages.md) requests, and on the request that lists available models. A value that is not a valid HTTP header value fails the model load with an error that begins `` Invalid `anthropic_workspace_id` ``.

```yaml
models:
  - from: anthropic:claude-sonnet-4-6
    name: anthropic
    params:
      anthropic_api_key: ${ secrets:SPICE_ANTHROPIC_API_KEY }
      anthropic_workspace_id: wrkspc_...
```

## Workload Identity Federation

An Anthropic model can authenticate with [workload identity federation](https://platform.claude.com/docs/en/build-with-claude/workload-identity-federation) instead of an API key or auth token, for chat and for the [Messages API](../../features/large-language-models/messages.md). Spice exchanges the identity token that the platform gives the workload for a short-lived Anthropic access token ([RFC 7523](https://datatracker.ietf.org/doc/html/rfc7523)), and exchanges again before each access token expires, so no Anthropic API key is stored with Spice.

```yaml
models:
  - from: anthropic:claude-haiku-4-5
    name: claude
    params:
      anthropic_federation_rule_id: ${ secrets:ANTHROPIC_FEDERATION_RULE_ID }
      anthropic_organization_id: ${ secrets:ANTHROPIC_ORGANIZATION_ID }
      anthropic_service_account_id: ${ secrets:ANTHROPIC_SERVICE_ACCOUNT_ID }
      anthropic_workspace_id: ${ secrets:ANTHROPIC_WORKSPACE_ID }
      anthropic_identity_token_file: /var/run/secrets/tokens/anthropic
```

`anthropic_federation_rule_id`, `anthropic_organization_id`, and `anthropic_service_account_id` are all required. The identity token comes from the first of these sources that answers:

1. `anthropic_identity_token_file`, read again for every exchange.
2. The GitHub Actions job Spice runs in, which needs `permissions: id-token: write` (see [OpenID Connect in GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)).
3. The workload's cloud identity, tried in this order: the AWS IAM role, through STS [`GetWebIdentityToken`](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetWebIdentityToken.html), which needs outbound web identity federation enabled on the AWS account and `sts:GetWebIdentityToken` granted to the role; the Google Cloud metadata server; then the workload's Microsoft Entra identity. A source counts only once it issues a token for the audience, so AWS credentials without `sts:GetWebIdentityToken` pass to the next source. A model on EC2, an Azure VM, or Compute Engine therefore needs no token file.

Spice requests the token from GitHub Actions or the cloud identity for `anthropic_identity_token_audience`, which defaults to `https://api.anthropic.com`. The audience of a token file is set where the token is issued, so a model that sets both `anthropic_identity_token_file` and `anthropic_identity_token_audience` fails to load. When no source answers, the model fails to load with an error that lists what each cloud identity reported.

Spice exchanges again one minute before the access token expires, or, for a token that lasts less than four minutes, after three quarters of its lifetime. When an exchange after the first one fails, Spice keeps using the current access token and retries, waiting at most 15 seconds between attempts.

By default, Anthropic accepts an identity token that carries a `jti` claim only once, and refuses it again with the reason `jti_reused` in its authentication history ([token lifetime and refresh](https://platform.claude.com/docs/en/manage-claude/workload-identity-federation)). A token requested from GitHub Actions is new for every exchange. A token in `anthropic_identity_token_file` must be rotated before each exchange: Spice reads the file again but does not change its contents, so a token that is not rotated well within the access token's lifetime fails the next exchange, and a runtime restarted on a token it already exchanged fails to load the model. Kubernetes projected service account tokens rotate on their own; set their expiry so they rotate more often than the access token expires.

A model that sets a federation parameter and `anthropic_api_key` or `anthropic_auth_token` fails to load with an error that names both, and a model that sets only some of the required parameters fails with an error that names the missing one. When Anthropic refuses the first exchange, the model fails to load with a message that points to Anthropic's authentication history, where Anthropic records the reason.

See [Anthropic Model Names](https://platform.claude.com/docs/en/about-claude/models/overview) for a list of supported model names.
