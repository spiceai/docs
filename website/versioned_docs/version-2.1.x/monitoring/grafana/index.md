---
title: 'Grafana & Prometheus'
sidebar_label: 'Grafana & Prometheus'
description: 'Monitoring Spice instances with Grafana & Prometheus'
---

Spice can be monitored with [Grafana](https://grafana.com/grafana/) using the [Spice Metrics Endpoint](../features/observability) and pre-built dashboards available in the [Spice repository](https://github.com/spiceai/spiceai/tree/trunk/monitoring).

## Import Grafana Dashboard

Navigate to the Dashboards section in Grafana and click "New" > "Import".

<img width="500" src="/img/grafana/import-dashboard-button.png" />

Copy the dashboard JSON from [monitoring/grafana-dashboard.json](https://github.com/spiceai/spiceai/blob/trunk/monitoring/grafana-dashboard.json) into the Grafana import box.

<img width="500" src="/img/grafana/import-dashboard.png" />

Click "Load".

## Kubernetes

### Scrape Spice metrics

View the [Kubernetes](../../deployment/kubernetes/helm/index.md) deployment guide for configuring the Prometheus Operator (`monitoring.podMonitor.enabled=true`) to scrape metrics from Spice pods.

### Kubernetes Resource Utilization panels

The **Kubernetes Resource Utilization** section of the Grafana dashboard does **not** use Spice `/metrics`. It queries cluster metrics that must already be in Prometheus:

| Panel | Metrics | Label used with `$instances` |
| --- | --- | --- |
| CPU / Memory | `k8s_pod_cpu_usage`, `k8s_pod_memory_working_set` | `k8s_pod_name` |
| PVC storage | `k8s_volume_capacity`, `k8s_volume_available` | `k8s_pod_name` |

The dashboard **Instances** variable is the Prometheus scrape `instance` label on Spice metrics. For those K8s panels to filter correctly, `instance` should match the pod name (same value as `k8s_pod_name`). Relabel the Spice PodMonitor/ServiceMonitor if your scrape target is `pod:port` or an IP.

**Minimal setup**

1. Prometheus scraping Spice (Helm PodMonitor or equivalent) — required for all Spice panels and the Instances filter.
2. A source of the `k8s_pod_*` / `k8s_volume_*` metrics above, with label `k8s_pod_name`.

A common approach is [`kube-prometheus-stack`](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) plus an [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) DaemonSet using the [kubeletstats](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/kubeletstatsreceiver) receiver, exporting Prometheus metrics **without** unit suffixes so names match the dashboard (`k8s_pod_cpu_usage`, not `k8s_pod_cpu_usage_seconds_total`).

Example Collector install (contrib image; enable the kubelet metrics preset and a Prometheus exporter scraped by your Prometheus):

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update
helm upgrade --install otel-collector open-telemetry/opentelemetry-collector \
  --set mode=daemonset \
  --set image.repository=otel/opentelemetry-collector-contrib \
  --set presets.kubeletMetrics.enabled=true
```

Tune the chart values so kubeletstats includes the **volume** metric group (for PVC panels) and the Prometheus exporter omits unit suffixes. See the [kubeletstats receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/kubeletstatsreceiver) docs.

:::note
Without the cluster metrics in the table above, Spice application panels still work; only the Kubernetes Resource Utilization row stays empty. Some environments (for example Kind with local-path volumes) do not expose PVC stats from the kubelet, so disk panels may remain empty even when CPU and memory work.
:::

## Prometheus

Configure a Prometheus instance to scrape metrics from the Spice runtimes.

```yaml
global:
    scrape_interval: 1s
    scrape_configs:
    - job_name: spiceai
        static_configs:
        - targets: ['127.0.0.1:9090'] # Change to your Spice runtime endpoint + port
```

## Local Quickstart

This tutorial creates and configures Grafana and Prometheus locally to scrape and display metrics from several Spice instances. It assumes:

- Two Spice runtimes, `spiced-main` and `spiced-edge`, are running on `127.0.0.1:9091` and `127.0.0.1:9092` respectively.

1. Create a `compose.yaml`:

   ```yaml
   version: '3'
   services:
   prometheus:
     image: prom/prometheus:latest
     volumes:
       - ./prometheus.yaml:/etc/prometheus/prometheus.yml
     ports:
       - 9090:9090
     network_mode: 'host'
   grafana:
     image: grafana/grafana:latest
     volumes:
       - ./.grafana/provisioning:/etc/grafana/provisioning
     ports:
       - 3000:3000
     network_mode: 'host'
   ```

1. Create a `prometheus.yaml` to

   ```yaml
   global:
   scrape_interval: 1s
   scrape_configs:
   - job_name: spiced-main
       static_configs:
       - targets: ['127.0.0.1:9091']
   - job_name: spiced-edge
       static_configs:
       - targets: ['127.0.0.1:9092']
   ```

1. Add a prometheus as a source to grafana. Create a `.grafana/provisioning/datasources/prometheus.yml`

   ```yaml
   apiVersion: 1

   datasources:
   - name: Prometheus
       type: prometheus
       access: proxy
       url: http://localhost:9090
       isDefault: true
   ```

1. Run the Docker Compose

   ```bash
   docker-compose up
   ```

1. Go to `http://localhost:3000/dashboard/import` and add the JSON from [monitoring/grafana-dashboard.json](https://github.com/spiceai/spiceai/blob/trunk/monitoring/grafana-dashboard.json).

1. The dashboard will have data from the Spice runtimes.

<img src="/img/grafana/screenshot.png" />

## Query Spice as a Grafana Data Source

In addition to monitoring Spice with Grafana, you can query datasets served by Spice and visualize the results in Grafana panels using the [Infinity data source](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/), which can query Spice's [HTTP SQL API](../../api/HTTP/post-sql.api.mdx).

1. Install the [Infinity data source](https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/) plugin from the Grafana plugin catalog.

1. Add a new Infinity data source. No base URL or authentication is required at the data source level when targeting a Spice runtime that does not require an API key — credentials can be configured per query if needed (see [API Auth](../../api/auth/index.md)).

1. Create a panel backed by the Infinity data source and configure the query as an HTTP request against the Spice SQL endpoint:

   - **Type**: `JSON`
   - **Method**: `POST`
   - **URL**: `http://localhost:8090/v1/sql`
   - **Headers**: `Content-Type: application/json`
   - **Body** (raw):

     ```json
     { "sql": "SELECT passenger_count, AVG(total_amount) FROM taxi_trips GROUP BY passenger_count ORDER BY passenger_count" }
     ```

   The endpoint returns a JSON array of row objects (the default `application/json` response format), which Infinity parses directly into table rows for visualization.

:::note
The legacy `spiceai-spicexyz-datasource` Grafana plugin is no longer maintained and targets the earlier Spice.ai product, not the current runtime. Use the Infinity data source against the HTTP SQL API as shown above.
:::
