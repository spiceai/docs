---
type: docs
title: 'Data Ingestion'
linkTitle: 'Data Ingestion'
description: ''
weight: 40
---

Data can be ingested by the Spice runtime for replication to a Data Connector, like PostgreSQL or the Spice.ai Cloud platform.

By default, the runtime exposes an [OpenTelemety](https://opentelemetry.io) (OTEL) endpoint at grpc://127.0.0.1:50052 for data ingestion.

OTEL metrics will be inserted into datasets with matching names (metric name = dataset name) and optionally replicated to the dataset source.
