---
title: "Datadog"
sidebar_label: "Datadog"
description: 'Monitoring Spice instances with Datadog'
pagination_prev: 'clients/index'
pagination_next: null
---

The Spice runtime metrics could be integrated to Datadog via Spice Prometheus endpoint configured by default on port `9000`.

## Spice Prometheus endpoint configuration

By default, Prometheus endpoint is running on port `9000`. Review Spice runtime output after it is started to confirm metrics endpoint is correctly displayed.

```bash
2024-07-15T21:48:00.158267Z  INFO spiced: Metrics listening on 127.0.0.1:9000
```

Use `--metrics` param to configure Prometheus endpoint, for example

```bash
 spiced --metrics 0.0.0.0:9090
```

or when using Docker:

```Dockerfile
FROM spiceai/spiceai:latest

# Docker configuration ...

# Run Promeheus metrics exporter on port 9090
CMD ["--metrics", "0.0.0.0:9090"]
EXPOSE 9090
```

## Datadog Agent configuration

Prerequisite: [Datadog Agent version 6.5.0 or later is installed](https://docs.datadoghq.com/getting_started/agent/). Datadog Agent supports Prometheus metrics scraping by default, no additional packages are required on your container or host.

To start collecting Spice runtime metrics:

1. Edit the `openmetrics.d/conf.yaml` file in the `conf.d/` folder at the root of your [Agent’s configuration directory](https://docs.datadoghq.com/agent/guide/agent-configuration-files/#agent-configuration-directory):

```yaml
init_config:

instances:
    - prometheus_url: SPICE-METRICS-ENDPOINT>/metrics
      namespace: spice
      metrics:
          - '*'
```

1. [Restart the Agent](https://docs.datadoghq.com/agent/guide/agent-commands/#start-stop-and-restart-the-agent) to start collecting Spice runtime metrics.
1. Refer to [Prometheus and OpenMetrics metrics collection from a host](https://docs.datadoghq.com/integrations/guide/prometheus-host-collection/) for all available configuration options and supported parameters.
1. Open Datadog Metrics Explorer and type `spice` to confirm Spice telemetry information is successfully collected.

<img width="800" src="/img/datadog/spice_datadog_metrics_explorer.png"/>

TODO: troubleshooting

## Import Spice.ai Dashboard for Datadog

In-progress

<img width="800" src="/img/datadog/spice_datadog_dashboard.png"/>