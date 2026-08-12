---
title: 'Datadog'
sidebar_label: 'Datadog'
description: 'Monitoring Spice with Datadog'
---

Spice can be monitored with [Datadog](https://www.datadoghq.com/) using the [Spice Metrics Endpoint](../features/observability) and pre-built dashboards available in the [Spice repository](https://github.com/spiceai/spiceai/tree/trunk/monitoring).

## Datadog Agent Configuration

Prerequisite: [Datadog Agent version 6.5.0 or later is installed](https://docs.datadoghq.com/getting_started/agent/).

Configure the Datadog Agent to scrape the Spice metrics endpoint:

1. Edit the `openmetrics.d/conf.yaml` file in the `conf.d/` folder at the root of your [Agent’s configuration directory](https://docs.datadoghq.com/agent/guide/agent-configuration-files/#agent-configuration-directory):

```yaml
init_config:

instances:
  - openmetrics_endpoint: http://localhost:9090/metrics # Spice metrics endpoint
    namespace: spiceai
    metrics:
      - .*
    collect_histogram_buckets: true # Required for percentile queries, see below
    histogram_buckets_as_distributions: true # Required for percentile queries, see below
    max_returned_metrics: 3000 # Default is 2000, which Spice can exceed
    tags:
      - service_instance_id:<unique-id> # e.g. hostname; required by the Spice dashboard filter
```

1. [Restart the Agent](https://docs.datadoghq.com/agent/guide/agent-commands/#start-stop-and-restart-the-agent) to start collecting Spice metrics.
1. Refer to [Prometheus and OpenMetrics metrics collection from a host](https://docs.datadoghq.com/integrations/guide/prometheus-host-collection/) for all available configuration options and supported parameters.
1. Open Datadog Metrics Explorer and type `spiceai` to confirm Spice telemetry information is successfully collected.

<img width="800" src="/img/datadog/spice_datadog_metrics_explorer.png"/>

:::note The `namespace` sets the metric prefix
Every scraped metric is prefixed with the configured `namespace`, so `query_duration_ms` is stored as `spiceai.query_duration_ms`. Keep this value consistent with the prefix used by the queries in the Spice dashboard JSON, and with [`runtime.telemetry.metric_prefix`](#namespace-spice-metrics-with-a-prefix) if the same deployment also pushes metrics over OTLP.
:::

### Histogram Percentiles (Distributions)

Spice exports latency and size metrics — `query_duration_ms`, `flight_request_duration_ms`, `http_requests_duration_ms`, `dataset_acceleration_refresh_duration_ms`, and others — as Prometheus histograms. Configuring the Agent to submit those buckets as [Datadog distributions](https://docs.datadoghq.com/integrations/guide/prometheus-metrics/?tab=latestversion#histogram) makes percentiles queryable over the selected time window:

```text
p99:spiceai.flight_request_duration_ms{method:do_get} by {command}
```

| Option                               | Default | Why Spice needs it                                                                                                                                                                                      |
| ------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `collect_histogram_buckets`          | `true`  | Sends the `_bucket` series that percentiles are computed from.                                                                                                                                          |
| `histogram_buckets_as_distributions` | `false` | Submits those buckets as a Datadog distribution rather than a set of counters. Required for `p50:`, `p90:`, `p95:`, and `p99:` queries.                                                                 |

:::caution Percentile aggregations must be enabled on the metric
Submitting a distribution is not sufficient on its own. Datadog computes `p50`/`p90`/`p95`/`p99` for a distribution metric only once **percentile aggregations** are enabled for that metric on the Metrics Summary page — see [Enabling advanced query functionality](https://docs.datadoghq.com/metrics/distributions/#enabling-advanced-query-functionality). Until then a `p99:` query returns no data and the widget renders empty rather than reporting an error.
:::

:::note Why not the `_summary` metrics
The metrics endpoint also exposes a `<metric>_summary` family carrying `quantile` tags, derived from each histogram at scrape time. The underlying histogram is cumulative, so those quantiles describe the **entire lifetime of the process** rather than the queried time window: they flatten the longer a pod stays up and will not surface a latency regression. Prefer distributions for any percentile that needs to track a time window.
:::

## Kubernetes (Operator / Autodiscovery)

With the [Datadog Agent](https://docs.datadoghq.com/containers/kubernetes/installation/) in the cluster, annotate the Spice container (`spiceai` in the Helm chart) so OpenMetrics scrapes include the `service_instance_id` tag used by the dashboard instance filter:

```yaml
ad.datadoghq.com/spiceai.checks: |
  {
    "openmetrics": {
      "instances": [
        {
          "openmetrics_endpoint": "http://%%host%%:9090/metrics",
          "namespace": "spiceai",
          "metrics": [".*"],
          "collect_histogram_buckets": true,
          "histogram_buckets_as_distributions": true,
          "max_returned_metrics": 3000,
          "tags": ["service_instance_id:%%kube_pod_name%%"]
        }
      ]
    }
  }
```

`collect_histogram_buckets`, `histogram_buckets_as_distributions`, and `max_returned_metrics` serve the same purpose here as in the host configuration — see [Histogram Percentiles (Distributions)](#histogram-percentiles-distributions).

## Import the Spice Datadog Dashboard

1. Create [New Datadog Dashboard](https://docs.datadoghq.com/dashboards/#get-started)

<img width="800" src="/img/datadog/spice_datadog_dashboard_new.png"/>

2. Click **Import dashboard JSON** and drag and drop [monitoring/datadog-dashboard.json](https://raw.githubusercontent.com/spiceai/spiceai/trunk/monitoring/datadog-dashboard.json) file

<img width="800" src="/img/datadog/spice_datadog_dashboard_import.png"/>

3. Dashboard is now configured to display Spice.ai OSS key performance metrics

<img width="800" src="/img/datadog/spice_datadog_dashboard.png"/>

## OpenTelemetry OTLP Export

As an alternative to scraping the Prometheus endpoint with the Datadog Agent, Spice can push metrics directly to Datadog's [OTLP Metrics Intake Endpoint](https://docs.datadoghq.com/opentelemetry/setup/intake_endpoint/) over HTTP. This is the recommended approach for agentless deployments (e.g. serverless, ephemeral containers) and for environments where the Datadog API key is managed through Spice's [secret stores](../components/secret-stores).

### Minimal Configuration

Replace `us3` with the Datadog site for the target account (`us3`, `us5`, `eu`, `ap1`, etc.) and store the Datadog API key in a secret:

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: https://otlp.us3.datadoghq.com/v1/metrics
      headers:
        DD-API-KEY: ${secrets:DD_API_KEY}
```

Metrics begin appearing in the Datadog Metrics Explorer within a minute or two.

### Namespace Spice Metrics with a Prefix

Use [`runtime.telemetry.metric_prefix`](/docs/next/reference/spicepod/runtime#runtimetelemetrymetric_prefix) to prepend a string to every exported metric name. This avoids collisions with metrics from other services in the same Datadog account:

```yaml
runtime:
  telemetry:
    metric_prefix: 'spiceai.'
```

The runtime metric `query_duration_ms` is then exported as `spiceai.query_duration_ms`.

:::caution Combining `metric_prefix` with metric filtering
If you also set [`runtime.telemetry.otel_exporter.metrics`](/docs/next/reference/spicepod/runtime#runtimetelemetryotel_exporter) to whitelist specific metrics, the entries must include the prefix. The filter runs after the prefix is applied, so e.g. `query_duration_ms` will not match when `metric_prefix: 'spiceai.'` is set — use `spiceai.query_duration_ms` instead.
:::

### Add Custom Tags via Resource Attributes

Attach custom key/value pairs to every metric using [`runtime.telemetry.properties`](/docs/next/reference/spicepod/runtime#runtimetelemetryproperties). Spice sends these as OpenTelemetry resource attributes:

```yaml
runtime:
  telemetry:
    properties:
      environment: prod
      region: us-west-2
      team: data-platform
```

For these resource attributes to surface as **tags** in Datadog, the Datadog OTLP intake also requires the `dd-otel-metric-config` header with `resource_attributes_as_tags` enabled (see [Datadog OTLP Metrics Intake Endpoint](https://docs.datadoghq.com/opentelemetry/setup/intake_endpoint/)):

```yaml
runtime:
  telemetry:
    otel_exporter:
      endpoint: https://otlp.us3.datadoghq.com/v1/metrics
      headers:
        DD-API-KEY: ${secrets:DD_API_KEY}
        dd-otel-metric-config: '{"resource_attributes_as_tags": true}'
```

:::note Tags can lag behind metrics
Datadog typically ingests OTLP metrics within seconds, but the associated tags (from resource attributes) can take noticeably longer to appear in the UI — sometimes several minutes after the first datapoints. The metrics and tags do eventually converge.
:::

:::caution Manage tag cardinality in Datadog
Datadog [bills on custom metric cardinality](https://docs.datadoghq.com/account_management/billing/custom_metrics/), driven by the number of unique tag-value combinations per metric. The custom tags added via `runtime.telemetry.properties` are typically low-cardinality (`environment`, `region`, `team`), but Spice metrics also carry a number of automatically populated dimensions — for example `dataset`, `protocol`, `client`, `client_version`, `client_system`, `user_agent`, `runtime`, `runtime_version`, `runtime_system` (see [Available Metrics](../features/observability#available-metrics)) — some of which can grow with the size of the deployment.

Datadog's [Metrics without Limits™](https://docs.datadoghq.com/metrics/metrics-without-limits/) decouples ingestion from indexing for exactly this case. With Metrics without Limits™, every tag Spice emits is still ingested, but each metric is configured with one of:

- an **allowlist** that keeps only the tags actually used in dashboards, monitors, and queries (e.g. keep `dataset` and `environment`, drop the rest), or
- a **blocklist** that drops specific auto-populated tags that are not useful for a given metric (e.g. exclude `user_agent` or `client_version`).

Only the indexed (queryable) tag combinations count toward custom metric billing. Configuration is done per metric in the Metrics Summary page or via the Metrics API, and the in-app UI surfaces an estimated indexed-metric volume before saving and can pre-populate an allowlist from tags actively queried in dashboards, monitors, and notebooks.
:::

### Full Example

A complete `runtime.telemetry` block combining metric prefixing, custom tags, and Datadog OTLP export:

```yaml
runtime:
  telemetry:
    metric_prefix: 'spiceai.'
    properties:
      environment: prod
      region: us-west-2
      team: data-platform
    otel_exporter:
      endpoint: https://otlp.us3.datadoghq.com/v1/metrics
      headers:
        DD-API-KEY: ${secrets:DD_API_KEY}
        dd-otel-metric-config: '{"resource_attributes_as_tags": true}'
```

With this configuration, every Spice metric (e.g. `spiceai.query_duration_ms`, `spiceai.query_executions`) arrives in Datadog tagged with `environment:prod`, `region:us-west-2`, and `team:data-platform`.

For general OTLP exporter options (push interval, metric filtering, gRPC vs HTTP), see [OpenTelemetry Metrics Exporter](../features/observability#opentelemetry-metrics-exporter).
