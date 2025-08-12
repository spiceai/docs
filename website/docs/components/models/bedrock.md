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

To request support for a model, file a GitHub Issue or ask us on Discord.

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

| Parameter                      | Description                                                                                                                                                                         | Default                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `aws_region`                   | AWS region for Bedrock API requests.                                                                                                                                                | -                                                                                           |
| `aws_access_key_id`            | AWS access key ID.                                                                                                                                                                  | -                                                                                           |
| `aws_secret_access_key`        | AWS secret access key.                                                                                                                                                              | -                                                                                           |
| `aws_secret_access_key`        | AWS secret access key.                                                                                                                                                              | -                                                                                           |
| `bedrock_guardrail_identifier` | Identifier for the guardrail. See [GuardrailConfiguration](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_GuardrailConfiguration.html). Pattern: `(([a-z0-9]+) \| (arn:aws(-[^:]+)?:bedrock:[a-z0-9-]{1,20}:[0-9]{12}:guardrail/[a-z0-9]+))`. Length: 0-2048. | -   |
| `bedrock_guardrail_version`    | Guardrail version. Pattern: `(([1-9][0-9]{0,7}) \| (DRAFT))`                                                                                   | -   |
| `bedrock_trace`                | Trace behavior for the guardrail. Valid values: `enabled`, `disabled`, `enabled_full`. Default: `disabled`.                                                                         | disabled                                                                                    |

### OpenAI-Compatible Overrides

The following OpenAI-compatible parameters are supported and passed in the request payload:

- `maxTokens`
- `temperature`
- `topP`
- `topK`
- `stopSequences`

See [Parameter Overrides](https://spiceai.org/docs/features/large-language-models/parameter_overrides) for details.

## Example Configuration

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

## References

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/)
- [GuardrailConfiguration API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_GuardrailConfiguration.html)
- [SpiceAI Bedrock Embeddings](https://spiceai.org/docs/components/embeddings/bedrock)
- [Parameter Overrides](https://spiceai.org/docs/features/large-language-models/parameter_overrides)
