---
title: 'Amazon S3 Vectors Engine'
sidebar_label: 'Amazon S3 Vectors'
description: 'Amazon S3 Vectors Engine Documentation'
sidebar_position: 1
pagination_next: null
---

> 🎓 Learn how it works with the [Amazon S3 Vectors with Spice](https://spiceai.org/blog/amazon-s3-vectors-with-spice) engineering blog post.

Amazon S3 Vectors, announced in public preview at AWS Summit New York 2025, is a new S3 bucket type designed for storing and querying vector embeddings at scale. It supports billions of vectors with sub-second similarity queries, reducing costs by up to 90% compared to traditional vector databases by separating storage from compute. Spice AI integrates S3 Vectors as a vector index backend, managing embedding indexing, lifecycle, and queries for hybrid search experiences.

To use Amazon S3 Vectors as a Vector Engine, specify `s3_vectors` as the `engine`, and configure the associated location and AWS credentials.

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
| `s3_vectors_aws_access_key_id`     | Optional. The access key ID for the S3 vectors index. If not specified, credentials will be loaded from the environment.                                                    | -                                                                                    |
| `s3_vectors_aws_region`            | The AWS region for the S3 vectors index.                                                                                                                                    | `us-east-1`                                                                          |
| `s3_vectors_aws_secret_access_key` | Optional. The secret access key for the S3 vectors index. If not specified, credentials will be loaded from the environment.                                                | -                                                                                    |
| `s3_vectors_aws_session_token`     | Optional. Session token for the S3 vectors index.                                                                                                                           | -                                                                                    |
| `s3_vectors_bucket`                | The S3 vectors bucket to use. If `s3_vectors_index` is not specified, an index will be created based on the underlying embedding column. Incompatible with `s3_vectors_arn` | `a-bucket`                                                                           |
| `s3_vectors_index`                 | The name of the s3 vectors index to use or create. Incompatible with `s3_vectors_arn`.                                                                                      | `index-of-important-embeddings`                                                      |
| `s3_vectors_distance_metric`                 | The distance metric to be used for similarity search. One of: `euclidean`, `cosine`. Default `cosine`.  | `euclidean`                                                      |
| `s3_vectors_index_poll_interval`             | The interval to poll for index updates to avoid excessive API calls. Minimum 5 seconds. Default is to poll on every scan. | `5m`                                                            |
| `client_timeout`                   | Timeout for S3 operations. Default: `30s`.                                                                                                                                  | `30s`, `9 century`, `1m`                                                             |


:::warning[Limitations]

- `s3_vectors_index` and `s3_vectors_arn` specify a single index for the dataset and therefore should not be used with a dataset containing more than one embedding column.
- S3 Vectors uses approximate nearest neighbor (ANN) algorithms for performance, providing probabilistically closest results.

  :::

## Overview

Amazon S3 Vectors exposes two core operations: upsert vectors (assign a vector to a key with optional metadata) and vector similarity queries (find closest vectors by metrics like cosine or Euclidean distance). It stores vectors durably in S3 and executes queries on transient compute, avoiding always-on servers. This enables petabyte-scale storage at low cost, ideal for semantic search, recommendations, and RAG in AI applications.

## Configuration

Annotate dataset schemas to specify columns for embedding and models. Spice supports local or hosted models like Amazon Titan Embeddings. When data ingests, Spice generates embeddings and stores them in the configured S3 Vectors index. Spice handles index creation, updates, and synchronization with data changes.

Example with AWS Titan model:

```yaml
datasets:
  - from: oracle:"CUSTOMER_REVIEWS"
    name: reviews
    vectors:
      enabled: true
      engine: s3_vectors
      params:
        s3_vectors_bucket: my-s3-vector-bucket
    columns:
      - name: body
        embeddings:
          from: bedrock_titan

embeddings:
  - from: bedrock:amazon.titan-embed-text-v2:0
    name: bedrock_titan
    params:
      aws_region: us-east-2
      dimensions: '256'
```

## Querying

Perform vector searches via HTTP API or SQL table-valued function `vector_search(dataset, query)`.

HTTP example:

```bash
curl -X POST http://localhost:8090/v1/search \
 -H "Content-Type: application/json" \
 -d '{
 "datasets": ["reviews"],
 "text": "issues with same day shipping",
 "additional_columns": ["rating", "customer_id"],
 "where": "created_at >= now() - INTERVAL '7 days'",
 "limit": 2
 }'
```

SQL example:

```sql
SELECT review_id, rating, customer_id, body, score
FROM vector_search(reviews, 'issues with same day shipping')
WHERE created_at >= to_unixtime(now() - INTERVAL '7 days')
ORDER BY score DESC
LIMIT 2;
```

Results include matching snippets, additional fields, primary keys, scores, and table names.

## Managing Embeddings

Spice manages the vector lifecycle: embedding data on ingestion, upserting to S3 Vectors with primary keys as identifiers, and handling updates/deletions. Vectors can be pre-stored in S3 for scalability, avoiding memory limits in accelerators or slow just-in-time computations.

## Query Execution

Spice pushes similarity computations to S3 Vectors, retrieving top matches as (id, score) pairs. These form a temporary table joinable with the dataset for full records, reducing processing to candidates only.

## Handling Filters

Mark columns as filterable metadata to push filters into S3 Vectors queries:

```yaml
columns:
  - name: created_at
    metadata:
      vectors: filterable
```

This ensures results respect constraints like time ranges during similarity search.

## Optimizations

Store non-filterable columns as metadata to avoid joins:

```yaml
columns:
  - name: rating
    metadata:
      vectors: non-filterable
```

Queries can then retrieve all needed data directly from the index, improving latency for read-heavy workloads.

## Advanced Features

Spice supports hybrid search (vector + full-text via BM25, merged with RRF), multi-vector queries (weighting columns), and re-ranking (e.g., keyword first-pass then vector on candidates). Compose via SQL CTEs and joins.

Hybrid RRF example:

```sql
WITH
vector_results AS (
 SELECT review_id, RANK() OVER (ORDER BY score DESC) AS vector_rank
 FROM vector_search(reviews, 'issues with same day shipping')
),
text_results AS (
 SELECT review_id, RANK() OVER (ORDER BY score DESC) AS text_rank
 FROM text_search(reviews, 'issues with same day shipping')
)
SELECT
 COALESCE(v.review_id, t.review_id) AS review_id,
 (1.0 / (60 + COALESCE(v.vector_rank, 1000)) +
 1.0 / (60 + COALESCE(t.text_rank, 1000))) AS fused_score
FROM vector_results v
FULL OUTER JOIN text_results t ON v.review_id = t.review_id
ORDER BY fused_score DESC
LIMIT 50;
```

Multi-column example (weighting title higher):

```sql
WITH
body_results AS (
 SELECT review_id, score AS body_score
 FROM vector_search(reviews, 'issues with same day shipping', col => 'body')
),
title_results AS (
 SELECT review_id, score AS title_score
 FROM vector_search(reviews, 'issues with same day shipping', col => 'title')
)
SELECT
 COALESCE(body.review_id, title.review_id) AS review_id,
 COALESCE(body_score, 0) + 2.0 * COALESCE(title_score, 0) AS combined_score
FROM body_results
FULL OUTER JOIN title_results ON body_results.review_id = title_results.review_id
ORDER BY combined_score DESC
LIMIT 5;
```

## Index Partitioning
S3 Vectors indexes can be partitioned using an arbitrary logical expression. This allows Spice to compose many actual vector indexes as one logical vector index, enabling elastic scalability for vector storage.

To partition your S3 vector indexes:

```yaml
vectors:
  enabled: true
  engine: s3_vectors
  partition_by:
    - 'bucket(50, PULocationID)'
```

This example uses a `bucket` user-defined function (UDF) to hash the `PULocationID` column and split the associated vectors into one of 50 partitioned indexes. The runtime will use the `s3_vectors_index` parameter as a prefix and generate partition-specific names.

:::warning[Limitations]

- `partition_by` must have only 1 expression.
- Expression must reference exactly one column from the dataset.
- Expression must produce a scalar value
- Expression cannot contain a subquery

:::

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
Regardless of the credential source, the IAM role or user must have appropriate S3 Vectors permissions (e.g., `s3vectors:QueryVectors`, `s3vectors:GetVectors`) to access the vectors. If the Spicepod connects to multiple different AWS services, the permissions should cover all of them.
:::

## Required IAM Permissions

The IAM role or user needs the following minimum permissions to access S3 Vectors:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowApplicationVectorAccess",
            "Effect": "Allow",
            "Action": [
                "s3vectors:QueryVectors",
                "s3vectors:GetIndex",
                "s3vectors:PutVectors",
                "s3vectors:ListVectors"
            ],
            "Resource": [
                "arn:aws:s3vectors:aws-region:123456789012:bucket/amzn-s3-demo-vector-bucket/index/*",
            ]
        },
        {
            "Sid": "AllowGetVectorBucket",
            "Effect": "Allow",
            "Action": "s3vectors:GetVectorBucket",
            "Resource": "arn:aws:s3vectors:aws-region:123456789012:bucket/*"
        },
        {
            "Sid": "AllowCreateVectorBucket",
            "Effect": "Allow",
            "Action": "s3vectors:CreateVectorBucket",
            "Resource": "arn:aws:s3vectors:aws-region:123456789012:bucket/*"
        },
        {
            "Sid": "AllowCreateVectorBucketIndex",
            "Effect": "Allow",
            "Action": "s3vectors:CreateIndex",
            "Resource": "arn:aws:s3vectors:aws-region:123456789012:bucket/amzn-s3-demo-vector-bucket/index/*"
        }
    ]
}
```

### Permission Details

| Permission | Purpose |
|------------|---------|
| `s3vectors:GetIndex` | Required. Used to verify if the index already exists or needs to be created. |
| `s3vectors:GetVectorBucket` | Required. Used to verify if the vector bucket already exists or needs to be created. |
| `s3vectors:ListVectors` | Required. Used to populate the `*_embeddings` column on vector tables in Spice. |
| `s3vectors:PutVectors` | Required. Used to populate the vector index with Spice-computed embeddings. |
| `s3vectors:QueryVectors` | Required. Used to query for vectors using the `vector_search` table function. |
| `s3vectors:CreateIndex` | Optional. Spice can automatically create indexes if this permission is given. |
| `s3vectors:CreateVectorBucket` | Optional. Spice can automatically create the vector bucket if this permission is given. |

### `metrics`

Spice supports the following [S3 Vector engine metrics](/docs/features/observability/component_metrics):

| Metric Name | Type | Description |
| ----------- | ---- | ----------- |
| `s3_vectors_create_index_errors` | counter | Number of errors returned from create_index operation. |
| `s3_vectors_create_index_latency` | histogram | Total duration of create_index operation, in milliseconds. |
| `s3_vectors_create_index_requests` | counter | Number of requests to create_index operation. |
| `s3_vectors_create_vector_bucket_errors` | counter | Number of errors returned from create_vector_bucket operation. |
| `s3_vectors_create_vector_bucket_latency` | histogram | Total duration of create_vector_bucket operation, in milliseconds. |
| `s3_vectors_create_vector_bucket_requests` | counter | Number of requests to create_vector_bucket operation. |
| `s3_vectors_delete_index_errors` | counter | Number of errors returned from delete_index operation. |
| `s3_vectors_delete_index_latency` | histogram | Total duration of delete_index operation, in milliseconds. |
| `s3_vectors_delete_index_requests` | counter | Number of requests to delete_index operation. |
| `s3_vectors_delete_vector_bucket_errors` | counter | Number of errors returned from delete_vector_bucket operation. |
| `s3_vectors_delete_vector_bucket_latency` | histogram | Total duration of delete_vector_bucket operation, in milliseconds. |
| `s3_vectors_delete_vector_bucket_policy_errors` | counter | Number of errors returned from delete_vector_bucket_policy operation. |
| `s3_vectors_delete_vector_bucket_policy_latency` | histogram | Total duration of delete_vector_bucket_policy operation, in milliseconds. |
| `s3_vectors_delete_vector_bucket_policy_requests` | counter | Number of requests to delete_vector_bucket_policy operation. |
| `s3_vectors_delete_vector_bucket_requests` | counter | Number of requests to delete_vector_bucket operation. |
| `s3_vectors_delete_vectors_errors` | counter | Number of errors returned from delete_vectors operation. |
| `s3_vectors_delete_vectors_latency` | histogram | Total duration of delete_vectors operation, in milliseconds. |
| `s3_vectors_delete_vectors_requests` | counter | Number of requests to delete_vectors operation. |
| `s3_vectors_get_index_errors` | counter | Number of errors returned from get_index operation. |
| `s3_vectors_get_index_latency` | histogram | Total duration of get_index operation, in milliseconds. |
| `s3_vectors_get_index_requests` | counter | Number of requests to get_index operation. |
| `s3_vectors_get_vector_bucket_errors` | counter | Number of errors returned from get_vector_bucket operation. |
| `s3_vectors_get_vector_bucket_latency` | histogram | Total duration of get_vector_bucket operation, in milliseconds. |
| `s3_vectors_get_vector_bucket_policy_errors` | counter | Number of errors returned from get_vector_bucket_policy operation. |
| `s3_vectors_get_vector_bucket_policy_latency` | histogram | Total duration of get_vector_bucket_policy operation, in milliseconds. |
| `s3_vectors_get_vector_bucket_policy_requests` | counter | Number of requests to get_vector_bucket_policy operation. |
| `s3_vectors_get_vector_bucket_requests` | counter | Number of requests to get_vector_bucket operation. |
| `s3_vectors_get_vectors_errors` | counter | Number of errors returned from get_vectors operation. |
| `s3_vectors_get_vectors_latency` | histogram | Total duration of get_vectors operation, in milliseconds. |
| `s3_vectors_get_vectors_requests` | counter | Number of requests to get_vectors operation. |
| `s3_vectors_list_indexes_errors` | counter | Number of errors returned from list_indexes operation. |
| `s3_vectors_list_indexes_latency` | histogram | Total duration of list_indexes operation, in milliseconds. |
| `s3_vectors_list_indexes_requests` | counter | Number of requests to list_indexes operation. |
| `s3_vectors_list_vector_buckets_errors` | counter | Number of errors returned from list_vector_buckets operation. |
| `s3_vectors_list_vector_buckets_latency` | histogram | Total duration of list_vector_buckets operation, in milliseconds. |
| `s3_vectors_list_vector_buckets_requests` | counter | Number of requests to list_vector_buckets operation. |
| `s3_vectors_list_vectors_errors` | counter | Number of errors returned from list_vectors operation. |
| `s3_vectors_list_vectors_latency` | histogram | Total duration of list_vectors operation, in milliseconds. |
| `s3_vectors_list_vectors_requests` | counter | Number of requests to list_vectors operation. |
| `s3_vectors_put_vector_bucket_policy_errors` | counter | Number of errors returned from put_vector_bucket_policy operation. |
| `s3_vectors_put_vector_bucket_policy_latency` | histogram | Total duration of put_vector_bucket_policy operation, in milliseconds. |
| `s3_vectors_put_vector_bucket_policy_requests` | counter | Number of requests to put_vector_bucket_policy operation. |
| `s3_vectors_put_vectors_errors` | counter | Number of errors returned from put_vectors operation. |
| `s3_vectors_put_vectors_latency` | histogram | Total duration of put_vectors operation, in milliseconds. |
| `s3_vectors_put_vectors_requests` | counter | Number of requests to put_vectors operation. |
| `s3_vectors_query_vectors_errors` | counter | Number of errors returned from query_vectors operation. |
| `s3_vectors_query_vectors_latency` | histogram | Total duration of query_vectors operation, in milliseconds. |
| `s3_vectors_query_vectors_requests` | counter | Number of requests to query_vectors operation. |

## Cookbook

- A cookbook recipe to configure a dataset with an S3 vectors engine in Spice. [S3 Vectors engine](https://github.com/spiceai/cookbook/tree/trunk/vectors/s3#readme)

## References

- [Spice.ai announcement](https://spiceai.org/blog/amazon-s3-vectors-with-spice)
- [Amazon S3 Vectors official page](https://aws.amazon.com/s3/vectors/)
