---
title: 'AWS Integrations'
description: 'Complete guide to Spice.ai integrations with Amazon Web Services, including data connectors, AI models, vector stores, and secret management.'
sidebar_label: 'Integrations'
sidebar_position: 2
pagination_next: null
keywords: [spice.ai, aws, amazon, s3, dynamodb, redshift, bedrock, glue, s3 vectors, secrets manager, eks, ecs]
image: /img/aws-spice.png
---

![Spice.ai and AWS](/img/aws-spice.png)

Spice.ai provides deep integrations with Amazon Web Services (AWS), enabling data federation, AI inference, vector search, and secure secret management across the AWS ecosystem. This page consolidates all AWS-compatible components and provides quick access to configuration guides.

## Data Connectors

Data connectors federate SQL queries across AWS data sources without data movement.

| Connector                    | Description                                                                                                                                     | Documentation                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Amazon S3**                | Query Parquet, CSV, and JSON files stored in S3 buckets. Supports private buckets with IAM authentication and S3-compatible storage like MinIO. | [S3 Data Connector](/docs/components/data-connectors/s3)                 |
| **Amazon S3 Tables**         | Query Iceberg tables in [Amazon S3 Tables](https://aws.amazon.com/s3/features/tables/) using the Glue connector with S3 Tables catalog format.  | [Glue Data Connector](/docs/components/data-connectors/glue)             |
| **Amazon DynamoDB**          | Federated SQL queries on DynamoDB tables with automatic schema inference.                                                                       | [DynamoDB Data Connector](/docs/components/data-connectors/dynamodb)     |
| **Amazon DynamoDB Streams**  | Real-time CDC streaming of table changes via [DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html). | [DynamoDB Data Connector](/docs/components/data-connectors/dynamodb)     |
| **Amazon Redshift**          | Connect to Redshift clusters using the PostgreSQL-compatible connector.                                                                         | [Redshift Data Connector](/docs/components/data-connectors/redshift)     |
| **Amazon Aurora PostgreSQL** | Connect to Aurora PostgreSQL clusters using the PostgreSQL connector.                                                                           | [PostgreSQL Data Connector](/docs/components/data-connectors/postgres)   |
| **Amazon Aurora MySQL**      | Connect to Aurora MySQL clusters using the MySQL connector.                                                                                     | [MySQL Data Connector](/docs/components/data-connectors/mysql)           |
| **Amazon RDS PostgreSQL**    | Connect to RDS PostgreSQL instances using the PostgreSQL connector.                                                                             | [PostgreSQL Data Connector](/docs/components/data-connectors/postgres)   |
| **Amazon RDS MySQL**         | Connect to RDS MySQL instances using the MySQL connector.                                                                                       | [MySQL Data Connector](/docs/components/data-connectors/mysql)           |
| **Amazon MSK**               | Stream data from [Amazon MSK](https://aws.amazon.com/msk/) (Managed Streaming for Apache Kafka) topics using the Kafka connector.               | [Kafka Data Connector](/docs/components/data-connectors/kafka)           |
| **Debezium (Amazon MSK)**    | Change Data Capture (CDC) from databases via Debezium running on Amazon MSK for real-time dataset updates.                                      | [Debezium Data Connector](/docs/components/data-connectors/debezium)     |
| **AWS Glue Data Catalog**    | Query Iceberg tables registered in AWS Glue.                                                                                                    | [Glue Data Connector](/docs/components/data-connectors/glue)             |
| **Apache Iceberg (AWS)**     | Query Iceberg tables stored in S3 with Glue or REST catalog metadata.                                                                           | [Iceberg Data Connector](/docs/components/data-connectors/iceberg)       |
| **Delta Lake (S3)**          | Query Delta Lake tables stored in Amazon S3.                                                                                                    | [Delta Lake Data Connector](/docs/components/data-connectors/delta-lake) |
| **AWS Athena (ODBC)**        | Connect to Athena using the ODBC connector with Athena SQL dialect support.                                                                     | [ODBC Data Connector](/docs/components/data-connectors/odbc)             |

### Example: Amazon S3

```yaml
datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: taxi_trips
    params:
      file_format: parquet
      s3_region: us-east-1
      s3_auth: iam_role  # Uses IAM credentials from environment
```

### Example: DynamoDB

```yaml
datasets:
  - from: dynamodb:users
    name: users
    params:
      dynamodb_aws_region: us-west-2
```

### Example: AWS Glue with Amazon S3 Tables

```yaml
datasets:
  - from: glue:my_namespace.orders
    name: orders
    params:
      glue_catalog_id: 123635965758:s3tablescatalog/my-table-bucket
      glue_region: us-east-2
```

## Catalog Connectors

Catalog connectors provide schema discovery and unified access to tables in AWS data catalogs.

| Connector            | Description                                                                       | Documentation                                            |
| -------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **AWS Glue Catalog** | Discover and query tables from AWS Glue Data Catalog with glob pattern filtering. | [Glue Catalog Connector](/docs/components/catalogs/glue) |

### Example: Glue Catalog

```yaml
catalogs:
  - from: glue
    name: my_data_lake
    include:
      - '*.*'  # Include all tables from all databases
    params:
      glue_region: us-east-1
```

## AI Models (Amazon Bedrock)

Spice integrates with [Amazon Bedrock](https://aws.amazon.com/bedrock/) for large language model inference, supporting Amazon Nova and other foundation models.

| Provider           | Supported Models                                                         | Documentation                                     |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------- |
| **Amazon Bedrock** | Amazon Nova (Micro, Lite, Pro, Premier), cross-region inference profiles | [Bedrock Models](/docs/components/models/bedrock) |

### Example: Amazon Nova

```yaml
models:
  - from: bedrock:us.amazon.nova-lite-v1:0
    name: nova
    params:
      aws_region: us-east-1
```

### Guardrails Support

Bedrock Guardrails can filter model inputs and outputs:

```yaml
models:
  - from: bedrock:amazon.nova-pro-v1:0
    name: nova-guarded
    params:
      aws_region: us-east-1
      bedrock_guardrail_identifier: arn:aws:bedrock:us-east-1:123456789012:guardrail/abc123
      bedrock_guardrail_version: '1'
```

## Embeddings (Amazon Bedrock)

Generate vector embeddings using Amazon Bedrock embedding models for semantic search and RAG applications.

| Provider           | Supported Models                                                         | Documentation                                             |
| ------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Amazon Bedrock** | Amazon Titan Embeddings, Amazon Nova Multimodal Embeddings, Cohere Embed | [Bedrock Embeddings](/docs/components/embeddings/bedrock) |

### Example: Amazon Titan Embeddings

```yaml
embeddings:
  - from: bedrock:amazon.titan-embed-text-v2:0
    name: titan
    params:
      aws_region: us-east-1
      dimensions: '256'
```

### Example: Amazon Nova Multimodal Embeddings

```yaml
embeddings:
  - from: bedrock:amazon.nova-2-multimodal-embeddings-v1:0
    name: nova_embed
    params:
      dimensions: '1024'
      truncation_mode: START
      embedding_purpose: GENERIC_RETRIEVAL
      aws_region: us-east-1
```

## Vector Stores (Amazon S3 Vectors)

[Amazon S3 Vectors](https://aws.amazon.com/s3/features/s3-vectors/) is a new S3 bucket type for storing and querying vector embeddings at scale. Spice integrates S3 Vectors as a vector index backend for hybrid search applications.

| Engine                | Description                                                                                                                  | Documentation                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Amazon S3 Vectors** | Sub-second similarity queries on billions of vectors with up to 90% cost reduction compared to traditional vector databases. | [S3 Vectors Engine](/docs/components/vectors/s3_vectors) |

### Example: S3 Vectors with Bedrock Embeddings

```yaml
datasets:
  - from: oracle:"CUSTOMER_REVIEWS"
    name: reviews
    vectors:
      enabled: true
      engine: s3_vectors
      params:
        s3_vectors_bucket: my-s3-vector-bucket
        s3_vectors_aws_region: us-east-1
    columns:
      - name: body
        embeddings:
          from: bedrock_titan

embeddings:
  - from: bedrock:amazon.titan-embed-text-v2:0
    name: bedrock_titan
    params:
      aws_region: us-east-1
      dimensions: '256'
```

## Secret Management

Securely store and retrieve credentials using AWS Secrets Manager.

| Store                   | Description                                           | Documentation                                                             |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| **AWS Secrets Manager** | Read secrets from AWS Secrets Manager by secret name. | [AWS Secrets Manager](/docs/components/secret-stores/aws-secrets-manager) |

### Example: Using Secrets Manager

```yaml
secrets:
  - from: aws_secrets_manager:my_database_creds
    name: db

datasets:
  - from: postgres:public.users
    name: users
    params:
      pg_host: ${db:host}
      pg_user: ${db:username}
      pg_pass: ${db:password}
```

## Authentication

All AWS integrations support the standard AWS SDK credential chain. When credentials are not explicitly configured, Spice loads them from the following sources in order:

1. **Environment Variables**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
2. **Shared Credentials Files**: `~/.aws/credentials` and `~/.aws/config`
3. **AWS SSO Sessions**: Configured via `aws configure sso`
4. **Web Identity Token**: For OIDC/OAuth (common with EKS IRSA)
5. **ECS Container Credentials**: Automatic IAM role for ECS tasks
6. **EC2 Instance Metadata (IMDSv2)**: Automatic IAM role for EC2 instances

### IAM Permissions

Ensure the IAM role or user has appropriate permissions for all AWS services used:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "dynamodb:Scan",
        "dynamodb:DescribeTable",
        "glue:GetTable",
        "glue:GetTables",
        "glue:GetDatabase",
        "glue:GetDatabases",
        "bedrock:InvokeModel",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

## Deployment Options

Deploy Spice on AWS infrastructure for optimal performance and integration:

| Option         | Description                                         | Documentation                          |
| -------------- | --------------------------------------------------- | -------------------------------------- |
| **Amazon EKS** | Kubernetes orchestration with Helm chart deployment | [AWS Deployment](/docs/deployment/aws) |
| **Amazon ECS** | Container service with Fargate or EC2 launch types  | [AWS Deployment](/docs/deployment/aws) |
| **Amazon EC2** | Direct deployment with Docker or binary             | [AWS Deployment](/docs/deployment/aws) |

## Resources

### AWS Blog Posts

- [Architecting High-Performance AI-Driven Data Applications with Spice.ai and AWS](https://aws.amazon.com/blogs/storage/architecting-high-performance-ai-driven-data-applications-with-spice-ai-and-aws/) - AWS Storage Blog

### Spice.ai Blog Posts

- [Amazon S3 Vectors](https://spice.ai/blog/amazon-s3-vectors) - Overview of S3 Vectors integration
- [Getting Started with Amazon S3 Vectors and Spice](https://spice.ai/blog/getting-started-with-amazon-s3-vectors-and-spice) - Step-by-step tutorial

### Videos

- [Getting started with Amazon S3 Vectors and Spice](https://www.youtube.com/watch?v=KuWI0yDOnIU) - YouTube walkthrough

### Marketplace

- [Spice.ai on AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jmf6jskjvnq7i) - Deploy Spice.ai from AWS Marketplace

## Quick Start

Get started with Spice on AWS in minutes:

1. **Install Spice CLI**:

```bash
curl https://install.spiceai.org | /bin/bash
```

2. **Configure AWS credentials**:

```bash
aws configure
```

3. **Create a Spicepod with S3 data**:

```yaml
# spicepod.yaml
version: v1beta1
kind: Spicepod
name: aws_quickstart

datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: taxi_trips
    params:
      file_format: parquet
      s3_auth: iam_role
```

4. **Start the runtime**:

```bash
spice run
```

5. **Query your data**:

```bash
spice sql
> SELECT COUNT(*) FROM taxi_trips;
```
