---
title: 'Amazon Bedrock Models'
description: 'How to use Amazon Bedrock models with Spice.'
sidebar_label: 'Bedrock'
sidebar_position: 9
---

Amazon Bedrock provides access to a range of foundation models for generative AI. Spice supports using Bedrock-hosted models by specifying the `bedrock` prefix in the `from` field and configuring the required parameters.

## Supported Model IDs

The following model IDs are supported:

- `amazon.nova-lite-v1:0`
- `amazon.nova-micro-v1:0`
- `amazon.nova-premier-v1:0`
- `amazon.nova-pro-v1:0`

Refer to the [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html) for details on available models and cross-region inference profiles.

To request support for a model, file a GitHub Issue or ask us on Slack.

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

| Parameter                      | Description                                                                                                                                                                                                                                                                        | Default  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `aws_region`                   | AWS region for Bedrock API requests.                                                                                                                                                                                                                                               | -        |
| `aws_access_key_id`            | AWS access key ID. If not provided, credentials will be loaded from environment variables or IAM roles.                                                                                                                                                                            | -        |
| `aws_secret_access_key`        | AWS secret access key. If not provided, credentials will be loaded from environment variables or IAM roles.                                                                                                                                                                        | -        |
| `aws_session_token`            | Session token (e.g. AWS_SESSION_TOKEN for AWS) for temporary credentials                                                                                                                                                                                                           | -        |
| `bedrock_guardrail_identifier` | Identifier for the guardrail. See [GuardrailConfiguration](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_GuardrailConfiguration.html). Pattern: `(([a-z0-9]+) \| (arn:aws(-[^:]+)?:bedrock:[a-z0-9-]{1,20}:[0-9]{12}:guardrail/[a-z0-9]+))`. Length: 0-2048. | -        |
| `bedrock_guardrail_version`    | Guardrail version. Pattern: `(([1-9][0-9]{0,7}) \| (DRAFT))`                                                                                                                                                                                                                       | -        |
| `bedrock_trace`                | Trace behavior for the guardrail. Valid values: `enabled`, `disabled`, `enabled_full`. Default: `disabled`.                                                                                                                                                                        | disabled |

### OpenAI-Compatible Overrides

The following OpenAI-compatible parameters are supported and passed in the request payload:

- `maxTokens`
- `temperature`
- `topP`
- `topK`
- `stopSequences`

See [Parameter Overrides](https://spiceai.org/docs/features/large-language-models/parameter_overrides) for details.

#### Model Parameters

These parameters control model behavior and are passed in the request payload:

| Parameter       | Description                                                     |
| --------------- | --------------------------------------------------------------- |
| `maxTokens`     | Maximum number of tokens to generate.                           |
| `temperature`   | Sampling temperature (0.0 to 1.0). Lower is more deterministic. |
| `topP`          | Nucleus sampling probability (0.0 to 1.0).                      |
| `topK`          | Number of highest probability tokens to consider.               |
| `stopSequences` | Sequences that stop generation when encountered.                |

See [Parameter Overrides](../../features/large-language-models/parameter_overrides) for details on setting default values.

## Examples

### Basic Configuration

```yaml
models:
  - from: bedrock:us.amazon.nova-lite-v1:0
    name: novash
    params:
      aws_region: us-east-1
      aws_access_key_id: ${ secrets:AWS_ACCESS_KEY_ID }
      aws_secret_access_key: ${ secrets:AWS_SECRET_ACCESS_KEY }
      bedrock_guardrail_identifier: arn:aws:bedrock:abcdefg012927:0123456789876:guardrail/hello
      bedrock_guardrail_version: DRAFT
      bedrock_trace: enabled
      bedrock_temperature: 42
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

The IAM role or user needs the following permissions to access DynamoDB tables:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
      "Resource": ["arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-*"]
    }
  ]
}
```

### Permission Details

| Permission                              | Purpose                                                           |
| --------------------------------------- | ----------------------------------------------------------------- |
| `bedrock:InvokeModel`                   | Required. Used to invoke the text model.                          |
| `bedrock:InvokeModelWithResponseStream` | Required. Used to invoke the text model with streaming responses. |

- [Amazon Bedrock Embeddings](../embeddings/bedrock) - Use Bedrock for text embeddings
- [Parameter Overrides](../../features/large-language-models/parameter_overrides) - Set default model parameters
- [Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/) - AWS documentation
- [Bedrock Model IDs](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html) - Available models and inference profiles
