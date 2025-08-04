---
title: 'Monitoring Spice'
sidebar_label: 'Monitoring'
sidebar_position: 11
description: 'Learn how Spice exposes observability data for integration with monitoring tools using OpenTelemetry and Prometheus.'
pagination_prev: null
pagination_next: null
---

## Monitoring Spice

Spice exposes observability data through OpenTelemetry and a metrics endpoint compatible with Prometheus. This enables integration with monitoring tools such as Datadog, New Relic, and Grafana.

### OpenTelemetry Integration

Spice provides an [OpenTelemetry](https://opentelemetry.io/) (OTEL) endpoint at `grpc://127.0.0.1:50052` by default. Metrics and traces sent to this endpoint can be consumed by OTEL-compatible services. Configure your monitoring tool to ingest data from the Spice OTEL endpoint. For Datadog and New Relic, refer to their documentation for OTEL integration:

- [Datadog OpenTelemetry Guide](./datadog/index.md)
- [Grafana & Prometheus](./grafana/index.md)

### Prometheus Metrics Endpoint

Spice exposes a metrics endpoint at `/metrics` (default port: 9090) for Prometheus scraping. Configure Prometheus to collect metrics from this endpoint and visualize them in Grafana. Example Prometheus configuration:

```yaml
global:
    scrape_interval: 1s
scrape_configs:
    - job_name: spiceai
        static_configs:
            - targets: ['127.0.0.1:9090']
```
