---
title: 'New Relic'
sidebar_label: 'New Relic'
description: 'Monitoring Spice with New Relic'
---

Spice can be monitored with [New Relic](https://newrelic.com/) using either the [Spice Metrics Endpoint](../../features/observability) (Prometheus scrape via the New Relic infrastructure agent) or the [OpenTelemetry Metrics Exporter](../../features/observability#opentelemetry-metrics-exporter) (push directly to New Relic's OTLP intake).

For agent-based collection, see the New Relic [Prometheus integrations overview](https://docs.newrelic.com/docs/infrastructure/prometheus-integrations/get-started/send-prometheus-metric-data-new-relic/). The walkthrough below covers the agentless OTLP path, which is recommended for serverless and ephemeral deployments and for environments where the New Relic license key is managed through Spice's [secret stores](../../components/secret-stores).

## OpenTelemetry OTLP Export

New Relic accepts OpenTelemetry metrics on a hosted OTLP endpoint. Spice pushes directly to it without requiring an OpenTelemetry collector or the New Relic agent.

### Minimal Configuration

Pick the endpoint that matches your account region (see [New Relic OTLP endpoint configuration](https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/)) and store the New Relic license key in a secret:

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: https://otlp.nr-data.net/v1/metrics
      headers:
        api-key: ${secrets:new_relic_license_key}
```

| Region              | OTLP/HTTP endpoint                            |
| ------------------- | --------------------------------------------- |
| US (default)        | `https://otlp.nr-data.net/v1/metrics`         |
| EU                  | `https://otlp.eu01.nr-data.net/v1/metrics`    |
| FedRAMP             | `https://gov-otlp.nr-data.net/v1/metrics`     |

The header name is `api-key` (lowercase). Use a New Relic [license key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#license-key) — either the account's ingest license key or an ingest-specific key.

Metrics begin appearing in New Relic's [Metrics Explorer](https://docs.newrelic.com/docs/data-apis/understand-data/metric-data/query-metric-data-type/) within a minute or two.

### Namespace Spice Metrics with a Prefix

Use [`runtime.telemetry.metric_prefix`](/docs/next/reference/spicepod/runtime#runtimetelemetrymetric_prefix) to prepend a string to every exported metric name. This avoids collisions with metrics from other services in the same New Relic account:

```yaml
runtime:
  telemetry:
    metric_prefix: 'spiceai.'
```

The runtime metric `query_duration_ms` is then exported as `spiceai.query_duration_ms`.

:::caution Combining `metric_prefix` with metric filtering
If you also set [`runtime.telemetry.otel_exporter.metrics`](/docs/next/reference/spicepod/runtime#runtimetelemetryotel_exporter) to whitelist specific metrics, the entries must include the prefix. The filter runs after the prefix is applied, so e.g. `query_duration_ms` will not match when `metric_prefix: 'spiceai.'` is set — use `spiceai.query_duration_ms` instead.
:::

### Add Custom Attributes via Resource Attributes

Attach custom key/value pairs to every metric using [`runtime.telemetry.properties`](/docs/next/reference/spicepod/runtime#runtimetelemetryproperties). Spice sends these as OpenTelemetry resource attributes, which New Relic surfaces as queryable dimensions on each metric:

```yaml
runtime:
  telemetry:
    properties:
      environment: prod
      region: us-west-2
      team: data-platform
```

These attributes are available in NRQL via the `WHERE` and `FACET` clauses, e.g.:

```sql
SELECT average(spiceai.query_duration_ms) FROM Metric WHERE environment = 'prod' FACET region SINCE 1 hour ago
```

### Full Example

A complete `runtime.telemetry` block combining metric prefixing, custom attributes, and New Relic OTLP export:

```yaml
runtime:
  telemetry:
    metric_prefix: 'spiceai.'
    properties:
      environment: prod
      region: us-west-2
      team: data-platform
    otel_exporter:
      endpoint: https://otlp.nr-data.net/v1/metrics
      push_interval: '30s'
      headers:
        api-key: ${secrets:new_relic_license_key}
```

With this configuration, every Spice metric (e.g. `spiceai.query_duration_ms`, `spiceai.query_executions`) arrives in New Relic with `environment`, `region`, and `team` available as dimensions for use in NRQL queries, dashboards, and alerts.

For general OTLP exporter options (push interval, metric filtering, gRPC vs HTTP), see [OpenTelemetry Metrics Exporter](../../features/observability#opentelemetry-metrics-exporter).
