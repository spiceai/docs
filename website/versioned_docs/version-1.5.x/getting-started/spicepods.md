---
title: 'Spicepods'
sidebar_label: 'Spicepods'
sidebar_position: 1
description: 'An introduction to Spicepods'
pagination_next: null
tags:
  - getting-started
  - spicepods
  - introduction
---

## Overview

A **Spicepod** is a package that encapsulates application-centric datasets and machine learning (ML) models.

Spicepods are analogous to code packaging systems, like NPM, however differ by expanding the concepts to data and ML models.

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

Datasets in a Spicepod can be sourced from various locations, including local files or remote databases. They can be materialized and accelerated using different engines such as DuckDB, SQLite, or PostgreSQL to optimize performance.

Learn more at [Datasets](../../reference/spicepod/datasets).

### Catalogs

Catalogs in a Spicepod can contain multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored.

Learn more at [Catalogs](../../reference/spicepod/catalogs).

### Models

ML models are integrated into the Spicepod similarly to datasets. The models can be specified using paths to local files or remote locations. ML inference can be performed using the models and datasets defined within the Spicepod.

Learn more at [Models](../../reference/spicepod/models).

### Secrets

Spice.ai supports various secret stores to manage sensitive information such as API keys or database credentials. Supported secret store types include environment variables, files, AWS Secrets Manager, Kubernetes secrets, and keyrings.

Learn more at [Secret Stores](../../components/secret-stores/index)
