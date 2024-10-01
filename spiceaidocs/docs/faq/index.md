---
title: 'Frequently Asked Questions'
sidebar_label: 'FAQ'
description: 'Get answers to common questions about Spice.ai, including its features, differences from other tools, and use cases'
pagination_prev: null
pagination_next: null
sidebar_position: 2
---

## 1. What is Spice?

Spice is a portable runtime that offers developers a unified SQL interface to materialize, accelerate, and query data from any database, data warehouse, or data lake. It functions as an application-specific, tier-optimized Database CDN.

## 2. Why should I use Spice?

Spice makes it easy and fast to query data from one or more sources using SQL. You can co-locate a managed dataset with your application or machine learning model and accelerate it with Arrow in-memory, SQLite/DuckDB, or PostgreSQL for fast, high-concurrency, low-latency queries.

## 3. How is Spice different?

- **Application-focused:** Designed to integrate at the application level with a flexible 1:1 or 1:N application-to-Spice mapping.
- **Dual-Engine Acceleration:** Supports OLAP and OLTP databases at the dataset level.
- **Separation of Materialization and Storage/Compute:** Separates storage and compute for optimal data placement.
- **Edge to Cloud Native:** Deployable anywhere from standalone instances to Kubernetes containers and public clouds.

## 4. Is Spice a cache?

No, but you can think of Spice data materialization as an active cache or data prefetcher. Unlike a cache that fetches data on a miss, Spice prefetches and materializes filtered data on an interval or as new data is available.

## 5. Is Spice a CDN for databases?

Yes, Spice acts like a CDN for different data sources. It allows you to load a working set of your database where it's most frequently accessed, such as from a data application or for AI inference.

## 6. How does Spice differ from Trino/Presto and Dremio?

Spice is designed for data and AI applications, while systems like Trino/Presto and Dremio are optimized for big data and real-time analytics. Spice specializes in high-concurrency, low-latency access and data materialization close to the application.

A key differentiator of Spice is its single-node distributed nature, which sets it apart from bulky, centralized Cloud Data Warehouses (CDW). Instead of consolidating data access into a central hub, Spice facilitates bringing working sets of use-case/application-specific data closer to where it's actually queried and used. This architecture provides several advantages:

- **Proximity:** By co-locating data with applications, Spice reduces latency and improves performance for frequent data access patterns.
- **Flexibility:** You can quickly spin up multiple, lightweight instances of Spice tailored for different datasets and use cases.
- **Scalability:** Decentralized materialization allows for better resource control and optimization, as each standalone instance can scale independently based on its workload requirements.
- **Efficiency:** Reduces the need for massive data movement operations across the network, lowering bandwidth consumption and speeding up query times.

### 7. How does Spice compare to Spark?

Spark is primarily designed for large-scale data processing and batch-processing pipelines with its distributed computing engine. In contrast, Spice is focused on accelerating data access and query speeds for applications through materialization and tier-optimized storage strategies.

### 8. How does Spice compare to DuckDB?

DuckDB is an embedded database designed for OLAP queries on large datasets. Spice integrates DuckDB to accelerate queries and as a data connector, meaning you can use Spice to access any data DuckDB can access and query.
