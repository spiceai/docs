---
title: "Grafana & Prometheus"
sidebar_label: "Grafana & Prometheus"
description: 'Monitoring Spice instances with Grafana & Prometheus'
pagination_prev: 'clients/index'
pagination_next: null
---

The Spice runtime has a Prometheus endpoint configured by default on port `9091`. There's also prebuilt Grafana dashboards for out of the box monitoring of all your Spice instances. This tutorial creates and configures Grafana and Prometheus to scrape and display metrics from several Spice instances. It assumes:
    - Two Spice runtimes, `spiced-main` and `spiced-edge`, are running on `127.0.0.1:9091` and `127.0.0.1:9092` respectively.


1. Create a `compose.yaml`:
    ```yaml
    version: "3"
    services:
    prometheus:
        image: prom/prometheus:latest
        volumes:
        - ./prometheus.yaml:/etc/prometheus/prometheus.yml
        ports:
        - 9090:9090
        network_mode: "host"
    grafana:
        image: grafana/grafana:latest
        volumes:
        - ./.grafana/provisioning:/etc/grafana/provisioning
        ports:
        - 3000:3000
        network_mode: "host"
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