---
type: docs
no_list: true
---

# Spice
## What is Spice?

**Spice** is a small, portable runtime that provides developers with a unified SQL query interface to locally accelerate and query data tables sourced from any database, data warehouse, or data lake.

Spice makes it easy to build data-driven and data-intensive applications by streamlining the use of data and machine learning (ML) in software.

The Spice runtime is written in Rust and leverages industry leading technologies like Apache DataFusion, Apache Arrow, Apache Arrow Flight, and DuckDB.

## Why Spice?

Spice makes querying data by SQL across one or more data sources simple and fast. Easily co-locate a managed working set of your data with your application or ML, locally accelerated in-memory, with DuckDB, or with an attached database like PostgreSQL for high-performance, low-latency queries.

### Before Spice

<img width="750" alt="old" src="https://github.com/spiceai/spiceai/assets/80174/1a0a883e-8bd7-4ac3-a524-33a9ddad6e47">

### With Spice

<img width="1024" alt="new" src="https://github.com/spiceai/spiceai/assets/80174/9bc84831-a75a-4fca-9643-ef7a86345ef0">

### Example Use-Cases

**1. Faster applications and frontends.** Accelerate and co-locate datasets with applications and frontends, to serve more concurrent queries and users with faster page loads and data updates.

**2. Faster analytics and BI.** Faster, more responsive dashboards without massive compute costs.

**3. Faster data pipelines, machine learning training and inferencing.** Co-locate datasets in pipelines where the data is needed to minimize data-movement and improve query performance.

⚠️ **DEVELOPER PREVIEW** Spice is under active **alpha** stage development and is not intended to be used in production until its **1.0-stable** release.

### Connect with us

We greatly appreciate and value your support! You can help Spice in a number of ways:

- ⭐️ Star this repo.
- Build an app with Spice.ai and send us feedback and suggestions at [hey@spice.ai](mailto:hey@spice.ai) or on [Discord](https://discord.gg/kZnTfneP5u), [X](https://twitter.com/spice_ai), or [LinkedIn](https://www.linkedin.com/company/74148478).
- [File an issue](https://github.com/spiceai/spiceai/issues/new) if you see something not quite working correctly.
- Join our team ([We’re hiring!](https://spice.ai/careers))
- Contribute code or documentation to the project (see [CONTRIBUTING.md](https://github.com/spiceai/spiceai/blob/trunk/CONTRIBUTING.md)).

We’re also starting a community call series soon!

Thank you for sharing this journey with us. 🙏

### Sections

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Concepts</b></h5>
      <p class="card-text">Learn about Spice.ai concepts and terminology.</p>
      <a href="/" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Getting started</b></h5>
      <p class="card-text">How to get up and running with Spice.ai in your environment in minutes.</p>
      <a href="{{< ref getting-started >}}" class="stretched-link"></a>
    </div>
  </div>
</div>
<br />
<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>CLI</b></h5>
      <p class="card-text">Documentation on the Spice.ai CLI.</p>
      <a href="{{< ref cli >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Reference</b></h5>
      <p class="card-text">Reference documentation on the Pod specification.</p>
      <a href="{{< ref reference >}}" class="stretched-link"></a>
    </div>
  </div>
</div>
