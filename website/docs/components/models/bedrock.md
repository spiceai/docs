---
title: 'Amazon Bedrock Models'
description: 'How to use Amazon Bedrock models with Spice.'
sidebar_label: 'Amazon Bedrock'
sidebar_position: 9
---

Spice supports large language models hosted on [Amazon Bedrock](https://aws.amazon.com/bedrock/). Specify the `bedrock:` prefix in the `from` field along with the model ID.

## Supported Models

Spice supports both Amazon's Nova models and models from other providers that are available on AWS bedrock.

Providers include:

| Family | Example model IDs |
| ------ | ----------------- |
| Amazon Nova | `amazon.nova-micro-v1:0`, `amazon.nova-lite-v1:0`, `amazon.nova-pro-v1:0`, `amazon.nova-premier-v1:0` |
| Anthropic Claude | `anthropic.claude-3-5-haiku-20241022-v1:0`, `anthropic.claude-sonnet-4-20250514-v1:0` |
| Meta Llama | `meta.llama3-1-70b-instruct-v1:0`, `meta.llama3-2-90b-instruct-v1:0` |
| Mistral | `mistral.mixtral-8x7b-instruct-v0:1`, `mistral.mistral-large-2407-v1:0` |
| Cohere Command | `cohere.command-r-v1:0`, `cohere.command-r-plus-v1:0` |
| AI21 Jamba | `ai21.jamba-1-5-mini-v1:0`, `ai21.jamba-1-5-large-v1:0` |
| DeepSeek | `deepseek.r1-v1:0`, `deepseek.v3.2` |

Cross-region inference profiles (for example, `us.amazon.nova-lite-v1:0` or `us.meta.llama3-1-70b-instruct-v1:0`) are supported. See the [Amazon Bedrock model IDs documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html) for the latest IDs and availability by region.

To request support for additional models, file a [GitHub Issue](https://github.com/spiceai/spiceai/issues).

## Configuration

### `from`

Specify the Bedrock model ID in the `from` field:

```yaml
models:
  - from: bedrock:us.amazon.nova-lite-v1:0
    name: novash
    params:
      aws_region: us-east-1
      aws_access_key_id: ${ secrets:AWS_ACCESS_KEY_ID }
      aws_secret_access_key: ${ secrets:AWS_SECRET_ACCESS_KEY }
```

### Parameters

#### AWS Authentication

| Parameter               | Description                                                                                       | Default     |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ----------- |
| `aws_region`            | AWS region for Bedrock API requests.                                                              | `us-east-1` |
| `aws_access_key_id`     | AWS access key ID. If not provided, credentials load from environment variables or IAM roles.     | -           |
| `aws_secret_access_key` | AWS secret access key. If not provided, credentials load from environment variables or IAM roles. | -           |
| `aws_session_token`     | AWS session token for temporary credentials.                                                      | -           |
| `aws_iam_role_source`   | IAM role credential source. `auto` uses the default AWS credential chain, `metadata` uses only instance/container metadata (IMDS, ECS, EKS/IRSA), `env` uses only environment variables. | `auto`      |

#### Guardrails

Bedrock Guardrails filter model inputs and outputs. See [GuardrailConfiguration](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_GuardrailConfiguration.html).

| Parameter                      | Description                                                                              | Default    |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------- |
| `bedrock_guardrail_identifier` | Guardrail ID or ARN. Example: `arn:aws:bedrock:us-east-1:123456789012:guardrail/abc123`. | -          |
| `bedrock_guardrail_version`    | Guardrail version number or `DRAFT`.                                                     | -          |
| `bedrock_trace`                | Trace output for guardrail evaluation. One of: `disabled`, `enabled`, `enabled_full`.    | `disabled` |

#### Model Parameters

Bedrock models accept the OpenAI-compatible chat completion parameters and map four of them onto the Bedrock Converse API inference configuration, and `reasoning_effort` onto the model's additional request fields. To set a default for every request to the model, use the `bedrock_` prefix. A value in the request body takes precedence over the default.

| Parameter                       | Converse API field | Description                                                     |
| ------------------------------- | ------------------ | --------------------------------------------------------------- |
| `bedrock_max_completion_tokens` | `maxTokens`        | Maximum number of tokens to generate.                           |
| `bedrock_temperature`           | `temperature`      | Sampling temperature (0.0 to 1.0). Lower is more deterministic. |
| `bedrock_top_p`                 | `topP`             | Nucleus sampling probability (0.0 to 1.0).                      |
| `bedrock_stop`                  | `stopSequences`    | Sequences that stop generation when encountered.                |
| `bedrock_reasoning_effort`      | `additionalModelRequestFields` | Reasoning effort: `none`, `minimal`, `low`, `medium`, `high`, or `xhigh`. See [Reasoning Effort](#reasoning-effort). |

Top-k sampling is not supported. Parameters named after the Converse API fields, such as `maxTokens` or `topK`, are not read and have no effect.

See [Parameter Overrides](../../features/large-language-models/parameter_overrides) for details on setting default values.

#### Reasoning Effort

`reasoning_effort` in a `/v1/chat/completions` or `/v1/decisions` request, or `bedrock_reasoning_effort` as the default for every request, asks a reasoning model to reason. Spice sends it in the Converse API `additionalModelRequestFields`, in the shape the model family takes:

| Model family | What Spice sends | AWS reference |
| --- | --- | --- |
| Claude 3.7 to Claude 4.5 (for example `anthropic.claude-sonnet-4-5-20250929-v1:0`) | `thinking` with `type: enabled` and a `budget_tokens` of 1,024 (`low`), 4,096 (`medium`), or 16,384 (`high`) | [Extended thinking](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-extended-thinking.html) |
| Claude 4.6 and later | `thinking` with `type: adaptive`, and `output_config.effort` | [Adaptive thinking](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html) |
| Amazon Nova 2 Lite | `reasoningConfig` with `maxReasoningEffort` | [Nova 2 extended thinking](https://docs.aws.amazon.com/nova/latest/nova2-userguide/extended-thinking.html) |
| OpenAI gpt-oss | `reasoning_effort` | [OpenAI models](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-openai.html) |

Spice finds the family from the model ID, which can be a base model ID, a cross-region inference profile ID such as `us.anthropic.claude-sonnet-4-5-20250929-v1:0`, or a foundation model or inference profile ARN that names the model. Each family takes `low`, `medium`, or `high`: `minimal` is sent as `low`, and `xhigh` as `high`.

- **`none`** sends nothing to Claude 3.7 to 4.5 and Nova 2 Lite, which do not reason by default, and sends `thinking` with `type: disabled` to Claude 4.6 and later. AWS documents that the adaptive-only models, Claude Fable 5 and 5.1 and Claude Mythos 5 and 5.1, reject `type: disabled` with `400` ([Adaptive thinking](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-adaptive-thinking.html)), so on those models omit `reasoning_effort` rather than set `none`. gpt-oss models always reason, so `none` is ignored with a warning.
- **Claude 3.7 to 4.5 need room for the thinking budget.** Bedrock requires `budget_tokens` to be less than `maxTokens`. With no `max_completion_tokens` in the request, Spice sets `maxTokens` to the budget plus 4,096. With `max_completion_tokens`, the budget is half of it, capped at the effort's budget and never below 1,024, so a `max_completion_tokens` of 1,500 leaves 476 tokens for the answer; a request whose `max_completion_tokens` is 1,024 or less fails with `400` and a message that says to increase `max_completion_tokens` or omit `reasoning_effort`.
- **Sampling parameters are sent as set.** Spice does not remove `temperature` or `top_p` when it sends `reasoning_effort`, and AWS rejects some combinations: Claude extended thinking is not compatible with `temperature`, `top_p`, or `top_k` changes ([Extended thinking](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-extended-thinking.html)), and Nova 2 Lite at `high` effort requires `temperature`, `topP`, and `maxTokens` to be unset ([Nova 2 extended thinking](https://docs.aws.amazon.com/nova/latest/nova2-userguide/extended-thinking.html)). Leave `bedrock_temperature`, `bedrock_top_p`, and, for Nova 2 Lite at `high`, `bedrock_max_completion_tokens` unset on a model that reasons.
- **Other models**, such as Claude 3.5, Nova 1, or an application inference profile ARN, which does not name its model, receive nothing, and Spice logs a warning for each request.

A streamed response carries the answer but not the model's reasoning text. A response that is not streamed returns the answer in `content` and the reasoning text in `reasoning_content`, and omits redacted reasoning. Streamed reasoning is tracked in [spiceai/spiceai#15595](https://github.com/spiceai/spiceai/issues/15595). With Claude 3.7 to 4.5, a multi-turn tool call with `reasoning_effort` can fail with a Bedrock validation error, because Spice does not send the model's earlier `thinking` blocks back with the tool results, as AWS requires for [extended thinking with tool use](https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-extended-thinking.html).

## Examples

### Basic Configuration

```yaml
models:
  - from: bedrock:amazon.nova-lite-v1:0
    name: nova
    params:
      aws_region: us-east-1
      aws_access_key_id: ${ secrets:AWS_ACCESS_KEY_ID }
      aws_secret_access_key: ${ secrets:AWS_SECRET_ACCESS_KEY }
```

### Cross-Region Inference

Use cross-region inference profiles for improved availability:

```yaml
models:
  - from: bedrock:us.amazon.nova-pro-v1:0
    name: nova-pro
    params:
      aws_region: us-east-1
```

### Inference Profile for Models Without On-Demand Throughput

Some models (for example, several Anthropic/Meta variants) require inference profile IDs:

```yaml
models:
  - from: bedrock:us.meta.llama3-1-70b-instruct-v1:0
    name: llama31
    params:
      aws_region: us-east-1

  - from: bedrock:us.anthropic.claude-opus-4-6-v1
    name: claude-opus-46
    params:
      aws_region: us-east-1
```

### With Guardrails

```yaml
models:
  - from: bedrock:amazon.nova-lite-v1:0
    name: nova-guarded
    params:
      aws_region: us-east-1
      bedrock_guardrail_identifier: arn:aws:bedrock:us-east-1:123456789012:guardrail/abc123
      bedrock_guardrail_version: '1'
      bedrock_trace: enabled
```

## Authentication

If AWS credentials are not explicitly provided in the configuration, the connector will automatically load credentials from the following sources in order.

1. **Environment Variables**:
   - `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN` (if using temporary credentials)

2. **Shared AWS Config/Credentials Files**:
   - Config file: `~/.aws/config` (Linux/Mac) or `%UserProfile%\.aws\config` (Windows)
   - Credentials file: `~/.aws/credentials` (Linux/Mac) or `%UserProfile%\.aws\credentials` (Windows)
   - The `AWS_PROFILE` environment variable can be used to specify a named profile, otherwise the `[default]` profile is used.
   - Supports both static credentials and SSO sessions
   - Example credentials file:

     ```ini
     # Static credentials
     [default]
     aws_access_key_id = YOUR_ACCESS_KEY
     aws_secret_access_key = YOUR_SECRET_KEY

     # SSO profile
     [profile sso-profile]
     sso_start_url = https://my-sso-portal.awsapps.com/start
     sso_region = us-west-2
     sso_account_id = 123456789012
     sso_role_name = MyRole
     region = us-west-2
     ```

   :::tip
   To set up SSO authentication:
   1. Run `aws configure sso` to configure a new SSO profile
   2. Use the profile by setting `AWS_PROFILE=sso-profile`
   3. Run `aws sso login --profile sso-profile` to start a new SSO session
      :::

3. **AWS STS Web Identity Token Credentials**:
   - Used primarily with OpenID Connect (OIDC) and OAuth
   - Common in Kubernetes environments using IAM roles for service accounts (IRSA)

4. **ECS Container Credentials**:
   - Used when running in Amazon ECS containers
   - Automatically uses the task's IAM role
   - Retrieved from the ECS credential provider endpoint
   - Relies on the environment variable `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` or `AWS_CONTAINER_CREDENTIALS_FULL_URI` which are automatically injected by ECS.

5. **AWS EC2 Instance Metadata Service (IMDSv2)**:
   - Used when running on EC2 instances.
   - Automatically uses the instance's IAM role.
   - Retrieved securely using [IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).

The connector will try each source in order until valid credentials are found. If no valid credentials are found, an authentication error will be returned.

:::note[IAM Permissions]
Regardless of the credential source, the IAM role or user must have appropriate bedrock permissions (e.g., `bedrock:InvokeModel`) to access the model. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

## Required IAM Permissions

The IAM role or user needs permissions to invoke Bedrock models:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
      "Resource": ["arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-*"]
    }
  ]
}
```

| Permission                              | Purpose                                       |
| --------------------------------------- | --------------------------------------------- |
| `bedrock:InvokeModel`                   | Required. Invoke model for text generation.   |
| `bedrock:InvokeModelWithResponseStream` | Required. Invoke model with streaming output. |

## Related Resources

- [Amazon Bedrock Embeddings](../embeddings/bedrock) - Use Bedrock for text embeddings
- [Parameter Overrides](../../features/large-language-models/parameter_overrides) - Set default model parameters
- [Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/) - AWS documentation
- [Bedrock Model IDs](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html) - Available models and inference profiles
