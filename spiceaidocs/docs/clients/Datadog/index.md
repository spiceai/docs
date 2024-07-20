---
title: "Datadog"
sidebar_label: "Datadog"
description: 'Monitoring Spice with Datadog'
pagination_prev: 'clients/index'
sidebar_position: 3
pagination_next: null
---

Spice can be monitored with [Datadog](https://www.datadoghq.com/) using the [Spice Metrics Endpoint](https://prometheus.io/docs/instrumenting/exposition_formats/#basic-info).

## Metrics Endpoint Configuration

The metrics endpoint uses port `9090` by default. The metrics endpoint configuration is logged at startup.

```bash
2024-07-15T21:48:00.158267Z  INFO spiced: Metrics listening on 127.0.0.1:9090
```

Configuration of the metrics endpoint can be verified using a HTTP GET request, for example:

```bash
curl http://localhost:9090/metrics

# TYPE spiced_runtime_http_server_start counter
spiced_runtime_http_server_start 1

# TYPE spiced_runtime_flight_server_start counter
spiced_runtime_flight_server_start 1

# TYPE datasets_count gauge
datasets_count{engine="None"} 1
datasets_count{engine="arrow"} 1
...
```

## Datadog Agent Configuration

Prerequisite: [Datadog Agent version 6.5.0 or later is installed](https://docs.datadoghq.com/getting_started/agent/).

Configure the Datadog Agent to scrape the Spice metrics endpoint:

1. Edit the `openmetrics.d/conf.yaml` file in the `conf.d/` folder at the root of your [Agent’s configuration directory](https://docs.datadoghq.com/agent/guide/agent-configuration-files/#agent-configuration-directory):

```yaml
init_config:

instances:
    - prometheus_url: SPICE-METRICS-ENDPOINT>/metrics # for example http://localhost:9090/metrics
      namespace: spice
      metrics:
          - '*'
```

1. [Restart the Agent](https://docs.datadoghq.com/agent/guide/agent-commands/#start-stop-and-restart-the-agent) to start collecting Spice metrics.
1. Refer to [Prometheus and OpenMetrics metrics collection from a host](https://docs.datadoghq.com/integrations/guide/prometheus-host-collection/) for all available configuration options and supported parameters.
1. Open Datadog Metrics Explorer and type `spice` to confirm Spice telemetry information is successfully collected.

<img width="800" src="/img/datadog/spice_datadog_metrics_explorer.png"/>

## Import the Spice Datadog Dashboard

1. Create [New Datadog Dashboard](https://docs.datadoghq.com/dashboards/#get-started)

<img width="800" src="/img/datadog/spice_datadog_dashboard_new.png"/>

2. Click **Import dashboard JSON** and drag and drop [monitoring/datadog-dashboard.json](https://raw.githubusercontent.com/spiceai/spiceai/trunk/monitoring/datadog-dashboard.json) file

<img width="800" src="/img/datadog/spice_datadog_dashboard_import.png"/>

3. Dashbord is now configured to display Spice.ai OSS key performance metrics

<img width="800" src="/img/datadog/spice_datadog_dashboard.png"/>