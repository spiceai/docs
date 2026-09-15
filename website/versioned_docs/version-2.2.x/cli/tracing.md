---
title: 'Configuring Trace Levels'
sidebar_label: 'Trace Levels'
description: 'Configuring Spice.ai OSS trace output verbosity levels'
pagination_prev: null
tags:
  - cli
  - tracing
  - logging
---

Trace output verbosity is determined by the following sources, listed in order of precedence:

1. Verbosity flags (`-v`/`--verbose`, `-vv`/`--very-verbose`). If these flags are provided, they override all other settings.
2. The `SPICED_LOG` environment variable. This is used only if verbosity flags are not set
3. The `runtime.output_level` YAML configuration file. This is used only if neither verbosity flags nor the environment variable are set.

### Default

Spice's own components log at `INFO`, suitable for general information about the system. Everything else — the libraries the runtime is built on — logs at `WARN`, and a handful of particularly noisy targets are held down further still — turned off outright, or pinned to `warn`/`error`.

```bash
SPICED_LOG="app=INFO,task_history=INFO,spiced=INFO,runtime=INFO,secrets=INFO,data_components=INFO,cayenne=INFO,cache=INFO,extensions=INFO,spice_cloud=INFO,llms=INFO,tpc_extension=INFO,workers=INFO,search=INFO,ballista=INFO,datafusion=INFO,runtime_rate_control=INFO,reqwest_retry::middleware=off,opentelemetry=warn,opentelemetry_sdk=off,delta_kernel::log_segment=off,delta_kernel::listed_log_files=off,aws_config::imds::region=off,aws_config::meta::credentials::chain=off,tower::buffer=off,h2::codec=off,datafusion_datasource::source=off,datafusion_optimizer::utils=off,datafusion_optimizer::optimizer=off,datafusion::physical_planner=off,tantivy=warn,text_embeddings_backend_candle=error,WARN"
```

The equivalent `runtime.output_level` configuration is `info`:
```yaml
runtime:
  output_level: info
```

### Enabling Debug Mode

Use the `-v`/`--verbose` CLI flags to enable detailed logs, useful for debugging.

```bash
spice run -v
spiced -v
```

Alternatively you can use `runtime.output_level` yaml configuration:
```yaml
runtime:
  output_level: verbose
```

This raises Spice's own components to `DEBUG`. Everything else falls back to `INFO`, and the same handful of noisy targets stay held down — turned off outright, or pinned to `warn`/`error`:

```bash
SPICED_LOG="app=DEBUG,task_history=DEBUG,spiced=DEBUG,runtime=DEBUG,secrets=DEBUG,data_components=DEBUG,cayenne=DEBUG,cache=DEBUG,extensions=DEBUG,spice_cloud=DEBUG,llms=DEBUG,tpc_extension=DEBUG,workers=DEBUG,search=DEBUG,ballista=DEBUG,datafusion=DEBUG,runtime_rate_control=DEBUG,reqwest_retry::middleware=off,opentelemetry=warn,opentelemetry_sdk=off,delta_kernel::log_segment=off,delta_kernel::listed_log_files=off,aws_config::imds::region=off,aws_config::meta::credentials::chain=off,tower::buffer=off,h2::codec=off,datafusion_datasource::source=off,datafusion_optimizer::utils=off,datafusion_optimizer::optimizer=off,datafusion::physical_planner=off,tantivy=warn,text_embeddings_backend_candle=error,INFO" spice run
```

### Enabling Trace Mode

Use the `-vv`/`--very-verbose` CLI flag to enable the most detailed logs, typically for in-depth troubleshooting.

```bash
spice run -vv
spiced -vv
```

Alternatively you can use `runtime.output_level` yaml configuration:
```yaml
runtime:
  output_level: very_verbose
```

This raises Spice's own components to `TRACE`. Everything else falls back to `DEBUG`, and the filters held down only at the lower levels are lifted, though a few noisy targets remain — turned off outright, or pinned to `warn`:

```bash
SPICED_LOG="app=TRACE,task_history=TRACE,spiced=TRACE,runtime=TRACE,secrets=TRACE,data_components=TRACE,cayenne=TRACE,cache=TRACE,extensions=TRACE,spice_cloud=TRACE,llms=TRACE,tpc_extension=TRACE,workers=TRACE,search=TRACE,ballista=TRACE,datafusion=TRACE,runtime_rate_control=TRACE,reqwest_retry::middleware=off,opentelemetry=warn,opentelemetry_sdk=off,delta_kernel::log_segment=off,delta_kernel::listed_log_files=off,aws_config::imds::region=off,aws_config::meta::credentials::chain=off,tower::buffer=off,h2::codec=off,DEBUG" spice run
```

### Granular Configuration

For specific component trace configuration, adjust the trace levels as needed:

```bash
SPICED_LOG="spiced=INFO,runtime=DEBUG,data_components=WARN,cache=WARN" spice run
```
