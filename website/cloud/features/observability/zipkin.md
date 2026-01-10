---
description: Export observability traces from Spice into Zipkin
---

# Zipkin

In addition to the built-in `runtime.task_history` SQL table, Spice can export the observability traces it collects into Zipkin. 

![Zipkin UI showing traces exported by Spice](/img/cloud/Screenshot%202024-12-27%20at%2012.19.58 PM.png)

*Zipkin UI showing traces exported by Spice*

### Enabling Zipkin Export

Zipkin export is defined in the `spicepod.yaml` under the `runtime.tracing`section:

```yaml
runtime:
  tracing:
    zipkin_enabled: true
    zipkin_endpoint: http://localhost:9411/api/v2/spans
```

* `zipkin_enabled`: Optional. Default `false`. Enables or disables the Zipkin trace export.
* `zipkin_endpoint`: Required if `zipkin_enabled`is true. The path to the `/api/v2/spans`endpoint on the Zipkin instance to export to.
