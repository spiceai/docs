---
title: 'Amazon Bedrock Model Provider'
description: 'Instructions for using Amazon Bedrock embedding models'
sidebar_label: 'AWS Bedrock'
sidebar_position: 8
---

To use an embedding model deployed to [AWS Bedrock service](https://aws.amazon.com/bedrock/), specify the model endpoint name prefixed with `bedrock:` in the `from` field and include the required parameters in the `params` section.

### Parameters
#### AWS Parameters

| Parameter               | Description                                                                                                                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `aws_region`            |  S3 bucket region. Default: `us-east-1`.                                                                                                |
| `aws_profile`           | Optional. AWS profile to load credentials.                                                                                              |
| `aws_access_key_id`     | Optional. AWS access key ID for authentication. If not provided, credentials will be loaded from environment variables or IAM roles     |
| `aws_secret_access_key` | Optional. AWS secret access key for authentication. If not provided, credentials will be loaded from environment variables or IAM roles |
| `aws_session_token`     | Optional. AWS session token for authentication                                                                                          |

#### AWS Titan Models
These parameters are used for [Amazon Titan Text](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html) embedding model

| Parameter    | Description                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `normalize`  | Whether or not to normalize the output embedding. Defaults to true.                                                     |
| `dimensions` | The number of dimensions the output embedding should have. The following values are accepted: 1024 (default), 512, 256. |


#### Cohere Models
| Parameter    | Description                                                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `truncate`   | Specifies how the API handles inputs longer than the maximum token length. One of: `START`, `END` or `NONE` (default).                                          |
| `input_type` | Use the Cohere embeddings model optimized for different types of inputs. One of: `search_document` (default), `search_query`, `classification` or `clustering`. |


### Example `spicepod.yaml` configuration, Cohere model

```yaml
embeddings:
  - from: bedrock:cohere.embed-english-v3
    name: cohere-embeddings
    params:
      aws_region: us-east-1
      input_type: classification
      truncate: END
      aws_access_key_id: ${ secrets:AWS_ACCESS_KEY_ID }
      aws_secret_access_key: ${ secrets:AWS_SECRET_ACCESS_KEY }
```

### Example `spicepod.yaml` configuration, Titan model

```yaml
  - from: bedrock:amazon.titan-embed-text-v2:0
    name: titan-embeddings
    params:
      dimensions: "256"
```

### Additional Information

Refer to the [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/) for more details on available models and configurations.
