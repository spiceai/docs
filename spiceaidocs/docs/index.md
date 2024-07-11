---
sidebar_position: 0
slug: /
title: Home
---

import ThemeBasedImage from '@site/src/components/ThemeBasedImage';

# Spice.ai OSS

## What is Spice?

**Spice** is a portable runtime offering developers a unified SQL interface to materialize, accelerate, and query data from any database, data warehouse, or data lake.

📣 Read the [Spice.ai OSS announcement blog post](https://blog.spiceai.org/posts/2024/03/28/adding-spice-the-next-generation-of-spice.ai-oss/).

Spice connects, fuses, and delivers data to applications, machine-learning models, and AI-backends, functioning as an application-specific, tier-optimized Database CDN.

The Spice runtime, written in Rust, is built-with industry leading technologies such as [Apache DataFusion](https://datafusion.apache.org), Apache Arrow, Apache Arrow Flight, SQLite, and DuckDB.

<ThemeBasedImage width="900" alt="OGP" lightSrc="https://github.com/spiceai/spiceai/assets/80174/f71f227d-d7cd-418c-85b9-5c663a728491" darkSrc="https://github.com/spiceai/spiceai/assets/80174/96b5fcef-a550-4ce8-a74a-83931275e83e" />

## Why Spice?

Spice makes it easy and fast to query data from one or more sources using SQL. You can co-locate a managed dataset with your application or machine learning model, and accelerate it with Arrow in-memory, SQLite/DuckDB, or with attached PostgreSQL for fast, high-concurrency, low-latency queries. Accelerated engines give you flexibility and control over query cost and performance.

### How is Spice different?

1. **Application-focused:** Spice is designed to integrate at the application level; 1:1 or 1:N application to Spice mapping, whereas most other data systems are designed for multiple applications to share a single database or data warehouse. It's not uncommon to have many Spice instances, even down to one for each tenant or customer.

2. **Dual-Engine Acceleration:** Spice supports both **OLAP** (Arrow/DuckDB) and **OLTP** (SQLite/PostgreSQL) databases at the dataset level, unlike other systems that only support one type.

3. **Separation of Materialization and Storage/Compute:** Spice separates storage and compute, allowing you to keep data close to its source and bring a materialized working set next to your application, dashboard, or data/ML pipeline.

4. **Edge to Cloud Native**. Spice is designed to be deployed anywhere, from a standalone instance to a Kubernetes container sidecar, microservice, or cluster at the Edge/POP, On-Prem, or in public clouds. You can also chain Spice instances and deploy them across multiple infrastructure tiers.

### How does Spice compare?

|                            | Spice                              | Trino/Presto                     | Dremio                           | Clickhouse              |
| -------------------------- | ---------------------------------- | -------------------------------- | -------------------------------- | ----------------------- |
| Primary Use-Case           | Data & AI Applications             | Big Data Analytics               | Interative Analytics             | Real-Time Analytics     |
| Typical Deployment         | Colocated with application         | Cloud Cluster                    | Cloud Cluster                    | On-Prem/Cloud Cluster   |
| Application-to-Data System | One-to-One/Many                    | Many-to-One                      | Many-to-One                      | Many-to-One             |
| Query Federation           | Native with query push-down        | Supported with push-down         | Supported with limited push-down | Limited                 |
| Materialization            | Arrow/SQLite/DuckDB/PostgreSQL     | Intermediate Storage             | Reflections (Iceberg)            | Views & MergeTree       |
| Query Result Caching       | Supported                          | Supported                        | Supported                        | Supported               |
| Typical Configuration      | Single-Binary/Sidecar/Microservice | Coodinator+Executor w/ Zookeeper | Coodinator+Executor w/ Zookeeper | Clickhouse Keeper+Nodes |

### Before Spice

<ThemeBasedImage width="750" alt="Before Spice" lightSrc="https://github.com/spiceai/spiceai/assets/80174/0550d682-cf3b-4b1b-a3bd-d8b3ad7d8caf" darkSrc="https://github.com/spiceai/spiceai/assets/80174/64a3216e-0bbb-48b0-bf98-72e656d690af" />

### With Spice

<ThemeBasedImage width="900" alt="With Spice" lightSrc="https://github.com/spiceai/spiceai/assets/80174/b57514fe-d53d-42de-b8f0-97ae313c5708" darkSrc="https://github.com/spiceai/spiceai/assets/80174/02dbedb4-b209-4d08-bf83-4785a1bf886f" />

### Example Use-Cases

**1. Faster applications and frontends.** Accelerate and co-locate datasets with applications and frontends, to serve more concurrent queries and users with faster page loads and data updates. [Try the CQRS sample app](https://github.com/spiceai/samples/tree/trunk/acceleration#local-materialization-and-acceleration-cqrs-sample)

**2. Faster dashboards, analytics, and BI.** Faster, more responsive dashboards without massive compute costs. [Watch the Apache Superset demo](https://github.com/spiceai/samples/blob/trunk/sales-bi/README.md)

**3. Faster data pipelines, machine learning training and inferencing.** Co-locate datasets in pipelines where the data is needed to minimize data-movement and improve query performance. [Predict hard drive failure with the SMART data demo](https://github.com/spiceai/demos/tree/trunk/smart-demo#spiceai-smart-demo)

**4. Easily query many data sources.** Federated SQL query across databases, data warehouses, and data lakes using [Data Connectors](/components/data-connectors).

### FAQ

- **Is Spice a cache?** No, however you can think of Spice data materialization like an _active_ cache or data prefetcher. A cache would fetch data on a cache-miss while Spice prefetches and materializes filtered data on an interval or as new data becomes available. In addition to materialization Spice supports [results caching](/features/caching).

- **Is Spice a CDN for databases?** Yes, you can think of Spice like a CDN for different data sources. Using CDN concepts, Spice enables you to ship (load) a working set of your database (or data lake, or data warehouse) where it's most frequently accessed, like from a data application or for AI-inference.

:::warning[DEVELOPER PREVIEW]
Spice is under active **alpha** stage development and is not intended to be used in production until its **1.0-stable** release. If you are interested in running Spice in production, please get in touch below so we can support you.
:::

### Intelligent Applications

Spice enables developers to build both data _and_ AI-driven applications by co-locating data _and_ ML models with applications. Read more about the vision to enable the development of [intelligent AI-driven applications](./intelligent-applications/index.md).

### Connect with us

We greatly appreciate and value your support! You can help Spice in a number of ways:

- ⭐️ Star this repo.
- Build an app with Spice and send us feedback and suggestions at [hey@spice.ai](mailto:hey@spice.ai) or on [Discord](https://discord.gg/kZnTfneP5u), [X](https://twitter.com/spice_ai), or [LinkedIn](https://www.linkedin.com/company/74148478).
- [File an issue](https://github.com/spiceai/spiceai/issues/new) if you see something not quite working correctly.
- Join our team ([We’re hiring!](https://spice.ai/careers))
- Contribute code or documentation to the project (see [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md)).

We’re also starting a community call series soon!

Thank you for sharing this journey with us. 🙏
