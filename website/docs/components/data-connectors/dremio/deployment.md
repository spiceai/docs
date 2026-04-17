---
title: 'Dremio Data Connector Deployment Guide'
sidebar_label: 'Deployment Guide'
description: 'Production operating guide for the Dremio data connector: resilience controls, authentication, metrics, and observability.'
sidebar_position: 10
pagination_prev: null
pagination_next: null
tags:
  - data-connectors
  - deployment
  - observability
---

Production operating guide for the **Dremio Data Connector** covering resilience tuning, authentication, capacity sizing, metrics, and observability.

:::info
This deployment guide is a work in progress. For a complete reference example, see the [Databricks Deployment Guide](../databricks/deployment).
:::

## Authentication & Secrets

Guidance for production authentication, credential rotation, and secret store integration.

<!-- TODO: Document supported auth methods, required IAM/roles/permissions, recommended secret store, and rotation procedures. -->

## Resilience Controls

Production resilience parameters such as concurrency limits, retry budgets, backoff, and permanent-error handling.

<!-- TODO: Document component-specific resilience parameters, defaults, and recommended overrides for production. -->

## Capacity & Sizing

Recommended sizing guidance (CPU, memory, disk, network) and scaling behavior under load.

<!-- TODO: Document per-dataset resource expectations, batch sizing, and expected throughput characteristics. -->

## Metrics

Operational metrics exposed by the data connector. See [Component Metrics](../../../features/observability/component_metrics) for general configuration.

<!-- TODO: List component metrics (counter/gauge/histogram), their meaning, and how to enable them in the spicepod. -->

## Task History & Tracing

Spans emitted by the data connector for the [task history](../../../reference/task_history) system.

<!-- TODO: List span names and input/output fields, and any trace attributes specific to this component. -->

## Known Limitations

Any production limitations, compatibility caveats, or unsupported features.

<!-- TODO: Document known limitations (data types, query patterns, concurrency ceilings, etc.). -->

## Troubleshooting

Common failure modes and resolutions.

<!-- TODO: Document common errors, diagnostic steps, and recovery procedures. -->
