---
title: 'Amazon S3 Vectors Engine'
sidebar_label: 'Amazon S3 Vectors'
description: 'Amazon S3 Vectors Engine Documentation'
sidebar_position: 1
pagination_next: null
---

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](/blog/2025/amazon-s3-vectors-with-spice.mdx) engineering blog post.

To use S3 Vectors as a Vector Engine, specify `s3_vectors` as the `engine`, and configure the associated location and AWS credentials.

```yaml
datasets:
  - from: spice.ai:dataset.with.embeddings
    name: my_dataset
    vectors:
      enabled: true
      engine: s3_vectors
      params:
        s3_vectors_bucket: my-s3-vector-bucket
    columns:
      - name: 'body'
        embeddings:
          - from: bedrock_titan

embeddings:
  - name: bedrock_titan
    # ... Define an embedding model to use.
```

## Parameters

| Parameter                          | Description                                                                                                                                                                 | Example Value                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `s3_vectors_arn`                   | The S3 vectors index to use. Incompatible with `s3_vectors_bucket` and `s3_vectors_index`.                                                                                  | `arn:aws:s3vectors:123456654321/bucket/a-bucket/index/index-of-important-embeddings` |
| `s3_vectors_aws_access_key_id`     | The access key ID for the S3 vectors index                                                                                                                                  | -                                                                                    |
| `s3_vectors_aws_region`            | The AWS region for the S3 vectors index.                                                                                                                                    | `us-east-1`                                                                          |
| `s3_vectors_aws_secret_access_key` | The secret access key for the S3 vectors index                                                                                                                              | -                                                                                    |
| `s3_vectors_aws_session_token`     | Session token for the S3 vectors index.                                                                                                                                     | -                                                                                    |
| `s3_vectors_bucket`                | The S3 vectors bucket to use. If `s3_vectors_index` is not specified, an index will be created based on the underlying embedding column. Incompatible with `s3_vectors_arn` | `a-bucket`                                                                           |
| `s3_vectors_index`                 | The name of the s3 vectors index to use or create. Incompatible with `s3_vectors_arn`.                                                                                      | `index-of-important-embeddings`                                                      |

:::warning[Limitations]

- `s3_vectors_index` and `s3_vectors_arn` specify a single index for the dataset and therefore should not be used with a dataset containing more than one embedding column.
  :::

<!--  ## Cookbook

- A cookbook recipe to configure a dataset with an S3 vectors engine in Spice. [S3 Vectors engine](https://github.com/spiceai/cookbook/tree/trunk/vectors/s3#readme)
 -->
