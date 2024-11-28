---
title: 'Grafana & Prometheus'
sidebar_label: 'Grafana & Prometheus'
description: 'Monitoring Spice instances with Grafana & Prometheus'
pagination_prev: 'clients/index'
pagination_next: null
---

Spice can be monitored with [Grafana](https://grafana.com/grafana/) using the [Spice Metrics Endpoint](/features/monitoring/) and pre-built dashboards available in the [Spice repository](https://github.com/spiceai/spiceai/tree/trunk/monitoring).

## Import Grafana Dashboard

Navigate to the Dashboards section in Grafana and click "New" > "Import".

<img width="500" src="/img/grafana/import-dashboard-button.png" />

Copy the dashboard JSON from [monitoring/grafana-dashboard.json](https://github.com/spiceai/spiceai/blob/trunk/monitoring/grafana-dashboard.json) into the Grafana import box.

<img width="500" src="/img/grafana/import-dashboard.png" />

Click "Load".

## Kubernetes

View the [Kubernetes](/deployment/kubernetes) deployment guide for configuring the Prometheus Operator to scrape metrics from the Spice instances in Kubernetes.

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
