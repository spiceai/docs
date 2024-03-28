---
sidebar_position: 0
slug: /
title: Home
---

import ThemeBasedImage from '@site/src/components/ThemeBasedImage';

# Spice.ai OSS

## What is Spice?

**Spice** is a small, portable runtime that provides developers with a unified SQL query interface to locally materialize, accelerate, and query data tables sourced from any database, data warehouse, or data lake.

Spice makes it easy to build data-driven and data-intensive applications by streamlining the use of data and machine learning (ML) in software.

The Spice runtime is written in Rust and leverages industry leading technologies like Apache DataFusion, Apache Arrow, Apache Arrow Flight, and DuckDB.

<ThemeBasedImage width="900" alt="OGP" lightSrc="https://github.com/spiceai/spiceai/assets/80174/f71f227d-d7cd-418c-85b9-5c663a728491" darkSrc="https://github.com/spiceai/spiceai/assets/80174/96b5fcef-a550-4ce8-a74a-83931275e83e" />

## Why Spice?

Spice makes querying data by SQL across one or more data sources simple and fast. Easily co-locate a managed working set of your data with your application or ML, locally accelerated in-memory with Arrow, with SQLite/DuckDB, or with an attached database like PostgreSQL for high-performance, low-latency queries.

### Before Spice

<ThemeBasedImage width="750" alt="Before Spice" lightSrc="https://github.com/spiceai/spiceai/assets/80174/0550d682-cf3b-4b1b-a3bd-d8b3ad7d8caf" darkSrc="https://github.com/spiceai/spiceai/assets/80174/64a3216e-0bbb-48b0-bf98-72e656d690af" />

### With Spice

<ThemeBasedImage width="900" alt="With Spice" lightSrc="https://github.com/spiceai/spiceai/assets/80174/b57514fe-d53d-42de-b8f0-97ae313c5708" darkSrc="https://github.com/spiceai/spiceai/assets/80174/02dbedb4-b209-4d08-bf83-4785a1bf886f" />

### Example Use-Cases

**1. Faster applications and frontends.** Accelerate and co-locate datasets with applications and frontends, to serve more concurrent queries and users with faster page loads and data updates.

**2. Faster dashboards, analytics, and BI.** Faster, more responsive dashboards without massive compute costs.

**3. Faster data pipelines, machine learning training and inferencing.** Co-locate datasets in pipelines where the data is needed to minimize data-movement and improve query performance.

**4. Easily query many data sources.** Federated SQL query across databases, data warehouses, and data lakes using [Data Connectors](./data-connectors/index.md).

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
