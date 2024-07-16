---
title: "Datadog"
sidebar_label: "Datadog"
description: 'Monitoring Spice with Datadog'
pagination_prev: 'clients/index'
pagination_next: null
---

The Spice runtime metrics could be integrated to Datadog via Spice [Prometheus endpoint](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format).

## Spice Prometheus endpoint configuration

By default, Prometheus endpoint is running on port `9000`. Review Spice runtime output after it is started to confirm metrics endpoint is correctly displayed.

```bash
2024-07-15T21:48:00.158267Z  INFO spiced: Metrics listening on 127.0.0.1:9000
```

Pass the `--metrics` parameter to bind to a specific port. For example, to bind to port `9090`:

```bash
 spiced --metrics 0.0.0.0:9090
```

or when using Docker:

```Dockerfile
FROM spiceai/spiceai:latest

# Docker configuration ...

# Configure the metrics endpoint on port 9090
CMD ["--metrics", "0.0.0.0:9090"]
EXPOSE 9090
```

Prometheus endpoint could be verified by using HTTP GET request, for example:

```bash
curl http://localhost:9000/metrics

# TYPE spiced_runtime_http_server_start counter
spiced_runtime_http_server_start 1

# TYPE spiced_runtime_flight_server_start counter
spiced_runtime_flight_server_start 1

# TYPE datasets_count gauge
datasets_count{engine="None"} 1
datasets_count{engine="arrow"} 1
...
```

## Datadog Agent configuration

Prerequisite: [Datadog Agent version 6.5.0 or later is installed](https://docs.datadoghq.com/getting_started/agent/). Datadog Agent supports Prometheus metrics scraping by default, no additional packages are required on host or container.

To start collecting Spice runtime metrics:

1. Edit the `openmetrics.d/conf.yaml` file in the `conf.d/` folder at the root of your [Agent’s configuration directory](https://docs.datadoghq.com/agent/guide/agent-configuration-files/#agent-configuration-directory):

```yaml
init_config:

instances:
    - prometheus_url: SPICE-METRICS-ENDPOINT>/metrics # for example http://localhost:9000/metrics
      namespace: spice
      metrics:
          - '*'
```

1. [Restart the Agent](https://docs.datadoghq.com/agent/guide/agent-commands/#start-stop-and-restart-the-agent) to start collecting Spice runtime metrics.
1. Refer to [Prometheus and OpenMetrics metrics collection from a host](https://docs.datadoghq.com/integrations/guide/prometheus-host-collection/) for all available configuration options and supported parameters.
1. Open Datadog Metrics Explorer and type `spice` to confirm Spice telemetry information is successfully collected.

<img width="800" src="/img/datadog/spice_datadog_metrics_explorer.png"/>

## Import the Spice Datadog Dashboard

1. Create [New Datadog Dashboard](https://docs.datadoghq.com/dashboards/#get-started)

<img width="800" src="/img/datadog/spice_datadog_dashboard_new.png"/>

2. Click **Import dashboard JSON** and drag and drop [monitoring/datadog-dashboard.json](https://github.com/spiceai/spiceai/blob/trunk/monitoring/datadog-dashboard.json) file

<img width="800" src="/img/datadog/spice_datadog_dashboard_import.png"/>

3. Dashbord is now configured to display Spice.ai OSS key performance metrics

<img width="800" src="/img/datadog/spice_datadog_dashboard.png"/>