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

Output trace verbosity is controlled by the `SPICED_LOG` environment variable and verbosity flags (`-v`, `-vv`).

### Default

Spice's own components log at `INFO`, suitable for general information about the system. Everything else — the libraries the runtime is built on — logs at `WARN`, and a handful of particularly noisy targets are turned off outright.

```bash
SPICED_LOG="task_history=INFO,spiced=INFO,runtime=INFO,secrets=INFO,data_components=INFO,cache=INFO,extensions=INFO,spice_cloud=INFO,llms=INFO,tpc_extension=INFO,workers=INFO,search=INFO,reqwest_retry::middleware=off,opentelemetry_sdk=off,delta_kernel::log_segment=off,aws_config::imds::region=off,aws_config::meta::credentials::chain=off,WARN"
```

### Enabling Debug Mode

Use the `-v` CLI flag to enable detailed logs, useful for debugging.

```bash
spice run -v
spiced -v
```

This raises Spice's own components to `DEBUG` and everything else to `INFO`:

```bash
SPICED_LOG="task_history=DEBUG,spiced=DEBUG,runtime=DEBUG,secrets=DEBUG,data_components=DEBUG,cache=DEBUG,extensions=DEBUG,spice_cloud=DEBUG,llms=DEBUG,tpc_extension=DEBUG,workers=DEBUG,search=DEBUG,reqwest_retry::middleware=off,opentelemetry_sdk=off,delta_kernel::log_segment=off,aws_config::imds::region=off,aws_config::meta::credentials::chain=off,INFO" spice run
```

### Enabling Trace Mode

Use the `-vv` CLI flag to enable the most detailed logs, typically for in-depth troubleshooting.

```bash
spice run -vv
spiced -vv
```

This raises Spice's own components to `TRACE` and everything else to `DEBUG`:

```bash
SPICED_LOG="task_history=TRACE,spiced=TRACE,runtime=TRACE,secrets=TRACE,data_components=TRACE,cache=TRACE,extensions=TRACE,spice_cloud=TRACE,llms=TRACE,tpc_extension=TRACE,workers=TRACE,search=TRACE,reqwest_retry::middleware=off,opentelemetry_sdk=off,delta_kernel::log_segment=off,aws_config::imds::region=off,aws_config::meta::credentials::chain=off,DEBUG" spice run
```

### Granular Configuration

For specific component trace configuration, adjust the trace levels as needed:

```bash
SPICED_LOG="spiced=INFO,runtime=DEBUG,data_components=WARN,cache=WARN" spice run
```
