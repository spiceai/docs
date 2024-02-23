---
type: docs
title: "Spice.ai Core Concepts"
linkTitle: "Core Concepts"
weight: 10
no_list: true
---

## What is Spice?

**Spice** is a portable runtime that provides developers with a unified SQL query interface to locally accelerate and query data tables sourced from any database, data warehouse, or data lake.

Spice makes it easy to build data-driven and data-intensive applications by streamlining the use of data and machine learning (ML) in software.

The Spice runtime is written in Rust and leverages industry leading technologies like Apache DataFusion, Apache Arrow, Apache Arrow Flight, and DuckDB.

## Why Spice?

Spice makes querying data by SQL across one or more data sources simple and fast. Easily co-locate a managed working set of your data with your application or ML, locally accelerated in-memory, with DuckDB, or with an attached database like PostgreSQL for high-performance, low-latency queries.

### Before Spice

<img width="750" alt="old" src="https://github.com/spiceai/spiceai/assets/80174/1a0a883e-8bd7-4ac3-a524-33a9ddad6e47">

### With Spice

<img width="1024" alt="new" src="https://github.com/spiceai/spiceai/assets/80174/9bc84831-a75a-4fca-9643-ef7a86345ef0">

## Spice CLI

The `spice` command line tool for interacting with the Spice.ai runtime during development. View the [CLI reference]({{<ref "cli">}}) to learn more.

## Spice Runtime

The Spice.ai core runtime which runs as the daemon `spiced` and includes the AI and Data engines. The runtime also serves the [Spice.ai API]({{<ref "api">}}).

## [spicerack.org](https://spicerack.org)

The registry [spicerack.org](https://spicerack.org) of Spice.ai pods that can be fetched with the Spice.ai CLI.

## Spicepod

A `Spicepod` is a package of configuration and data used to train and deploy Spice.ai with an application.

A `Spicepod manifest` is a YAML file that describes how to connect data with a learning environment.
