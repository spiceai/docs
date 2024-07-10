---
title: 'Use Cases'
sidebar_label: 'Use Cases'
sidebar_position: 4
description: Examples and use cases for Spice'
pagination_prev: null
pagination_next: null
---

## Spice as a CDN for Databases

### Slow data applications

Colocate a local working set of hot data with data applications and frontends to serve more concurrent requests and users with faster page loads and data updates.

- ✅ Low-latency queries for faster page loads.
- ✅ High-concurrency queries to serve more users.
- ✅ Control over resource allocation, performance, and scale.
- ✅ Local replicas for high resiliency.

[Try the CQRS sample app](https://github.com/spiceai/samples/tree/trunk/acceleration#local-materialization-and-acceleration-cqrs-sample)

### Fragile data applications

Keep local replicas of data with the application for significantly higher application resilience and availability.

- ✅ Local replicas for high resiliency.

### Slow dashboards, analytics, and BI

Create a materialization layer for visualization products like Power BI, Tableau, or Superset for faster, more responsive dashboards without massive compute costs.

- ✅ Low-latency queries for faster dashboards.
- ✅ High-concurrency queries to serve more users.
- ✅ Control over resource allocation, performance, and scale.

[Watch the Apache Superset demo](https://github.com/spiceai/samples/blob/trunk/sales-bi/README.md)

## Spice for SQL Query Mesh/Federation

### Accessing data across many, disparate data sources

- ✅ Query and join data from disparate data sources.
- ✅ Minimize data migrations.
- ✅ High-performance queries to legacy data sources.

[Federated SQL query](/features/federated-queries) across databases, data warehouses, and data lakes using [Data Connectors](/data-connectors).

### Migrations from legacy data systems

A drop-in solution to provides a single, unified endpoint to many data systems without changes to the application.

- ✅ Query and join data from disparate data sources.
- ✅ High-performance queries to legacy data sources.

## Spice as a CDN for ML Models and AI

### Slow data pipelines, machine learning training and inferencing

Co-locate datasets in pipelines where the data is needed to minimize data-movement and improve query performance.

- ✅ Low-latency queries for fast inference.
- ✅ High-performance queries for faster training.

[Predict hard drive failure with the SMART data demo](https://github.com/spiceai/demos/tree/trunk/smart-demo#spiceai-smart-demo)

## Spice for Enterprise Search

### Vector similarily search across disparate and legacy data systems

Enterprises face a new challenge when using AI. They now need to access data from disparate and legacy systems so AI has full-knowledge for context. It needs to be fast to be useful.

Spice is a blazingly fast knowledge index into structured and unstructured data.

- ✅ Query and join data from disparate data sources.
- ✅ High-performance queries to legacy data sources.
