---
title: 'Component Metrics'
sidebar_label: 'Component Metrics'
description: 'Learn how to enable optional component metrics.'
sidebar_position: 1
pagination_prev: null
pagination_next: null
tags:
  - component-metrics
---

Component metrics provide detailed insights into the internal state and performance of individual components in Spice. Each component can expose its own set of metrics that can be enabled selectively to monitor specific aspects of its operation.

## Enabling Component Metrics

Component metrics are disabled by default and can be enabled by adding a `metrics` section to the component configuration. Each metric can be enabled individually by specifying its name in the metrics list.

### Example Configuration

```yaml
datasets:
  - from: some_component:my_resource
    name: my_resource
    metrics:
      - name: metric_one
        enabled: true
      - name: metric_two
        enabled: true
      - name: metric_three
        enabled: false
    params:
      param_one: value_one
      param_two: value_two
```

## Available Metrics

Each component defines its own set of available metrics. These metrics are exposed in the Prometheus format with the following naming convention:

```text
{component_type}_{component_name}_{metric_name}
```

For example, a MySQL dataset component's metrics would be prefixed with `dataset_mysql_`.

## Monitoring Component Metrics

Component metrics are exposed through the same Prometheus-compatible metrics endpoint as other Spice metrics. These metrics can be accessed using standard Prometheus tools or any monitoring system that supports Prometheus metrics.

To view the metrics, make a GET request to the metrics endpoint:

```bash
curl http://localhost:9090/metrics
```

The response will include all enabled component metrics in Prometheus format, with proper HELP and TYPE annotations.

## Component-Specific Metrics

For detailed information about metrics available for specific components, view all [components that expose metrics](../tags/component-metrics.md).
