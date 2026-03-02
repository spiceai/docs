---
title: 'Spicepods'
sidebar_label: 'Spicepods'
sidebar_position: 1
description: 'An introduction to Spicepods'
pagination_next: null
tags:
  - getting-started
  - spicepod
---

## Overview

A **Spicepod** is a configuration package that defines application-specific datasets, catalogs, machine learning (ML) models, and secrets. It functions similarly to a code packaging system (such as npm or pip), but is designed for data and AI components rather than code libraries.

Spicepods are defined in a YAML manifest file, typically named `spicepod.yaml`, and can be shared, versioned, and reused across projects.

To create a new Spicepod, run:

```bash
spice init my_app
```

This generates a `spicepod.yaml` file in the `my_app` directory with the minimum required fields:

```yaml
version: v1
kind: Spicepod
name: my_app
```

## Structure

A Spicepod is described by a YAML manifest file, typically named `spicepod.yaml`, which includes the following key sections:

- **Metadata:** Basic information about the Spicepod, such as its name and version.
- **Datasets:** Definitions of datasets that are used or produced within the Spicepod.
- **Catalogs:** Definitions of catalogs that are used within the Spicepod.
- **Models:** Definitions of language or traditional ML models that the Spicepod manages, including their sources and associated datasets.
- **Secrets:** Configuration for any secret stores used within the Spicepod.

## Example Manifest

```yaml
version: v1
kind: Spicepod
name: my_spicepod

datasets:
  - from: spice.ai/spiceai/quickstart/datasets/taxi_trips
    name: taxi_trips
    acceleration:
      enabled: true

models:
  - from: openai:gpt-4o-mini
    name: openai_model
    params:
      openai_api_key: ${ env:OPENAI_API_KEY }
      tools: auto

secrets:
  - from: env
    name: env
```

### Additional Example

```yaml
version: v1
kind: Spicepod
name: another_spicepod

datasets:
  - from: databricks:spiceai_demo.public.dataset
    name: sample_ds
    params:
      mode: delta_lake
      databricks_endpoint: dbc-a1b2345c-d6e7.cloud.databricks.com
      databricks_token: ${secrets:my_token}
      databricks_aws_access_key_id: ${secrets:aws_access_key_id}
      databricks_aws_secret_access_key: ${secrets:aws_secret_access_key}
    acceleration:
      enabled: true
      refresh_mode: full

models:
  - from: huggingface.co/microsoft/Phi-3.5-mini-instruct
    name: phi

secrets:
  - from: env
    name: env
```

## Key Components

### Datasets

Datasets in a Spicepod define the tables available for SQL queries. Each dataset specifies a source (using the `from` field) and optionally an acceleration engine for local materialization. Sources include local files, databases (PostgreSQL, MySQL), cloud warehouses (Snowflake, Databricks), object storage (S3), and more.

```yaml
datasets:
  - from: postgres:public.orders
    name: orders
    params:
      pg_host: localhost
      pg_port: "5432"
      pg_db: mydb
      pg_user: reader
      pg_pass: ${secrets:PG_PASSWORD}
    acceleration:
      enabled: true
      engine: duckdb
      refresh_check_interval: 30s
```

Learn more at [Datasets](../reference/spicepod/datasets).

### Catalogs

Catalogs in a Spicepod can contain multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored.

Learn more at [Catalogs](../reference/spicepod/catalogs).

### Models

ML and language models are configured in the Spicepod similarly to datasets. Models can reference hosted services (OpenAI, Anthropic) or local files (Hugging Face models). When tools are enabled, models can query datasets and run SQL during inference.

```yaml
models:
  - from: openai:gpt-4o-mini
    name: assistant
    params:
      openai_api_key: ${ env:OPENAI_API_KEY }
      tools: auto  # Gives the model access to dataset schemas and SQL
```

Learn more at [Models](../reference/spicepod/models).

### Secrets

Spice supports various secret stores to manage sensitive information such as API keys or database credentials. Supported secret store types include environment variables, files, AWS Secrets Manager, Kubernetes secrets, and keyrings.

Reference secrets in dataset or model params using the `${secrets:KEY_NAME}` syntax. The `env` secret store (enabled by default) reads from environment variables and `.env` files:

```yaml
secrets:
  - from: env
    name: env

datasets:
  - from: postgres:users
    name: users
    params:
      pg_pass: ${secrets:DB_PASSWORD}  # Reads DB_PASSWORD from environment or .env file
```

Learn more at [Secret Stores](../components/secret-stores)
