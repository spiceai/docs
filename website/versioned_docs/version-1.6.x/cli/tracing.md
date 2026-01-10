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

The default trace level is `INFO`, suitable for general information about the system.

```bash
SPICED_LOG="task_history=INFO,spiced=INFO,runtime=INFO,secrets=INFO,data_components=INFO,cache=INFO,extensions=INFO,spice_cloud=INFO,llms=INFO,reqwest_retry::middleware=off,WARN"
```

### Enabling Debug Mode

Use the `-v` CLI flag to enable detailed logs, useful for debugging.

```bash
spice run -v
spiced -v
```

This sets `SPICED_LOG` to `DEBUG` level:

```bash
SPICED_LOG="task_history=DEBUG,spiced=DEBUG,runtime=DEBUG,secrets=DEBUG,data_components=DEBUG,cache=DEBUG,extensions=DEBUG,spice_cloud=DEBUG,llms=DEBUG,DEBUG" spice run
```

### Enabling Trace Mode

Use the `-vv` CLI flag to enable the most detailed logs, typically for in-depth troubleshooting.

```bash
spice run -vv
spiced -vv
```

This sets `SPICED_LOG` to `TRACE` level:

```bash
SPICED_LOG="task_history=TRACE,spiced=TRACE,runtime=TRACE,secrets=TRACE,data_components=TRACE,cache=TRACE,extensions=TRACE,spice_cloud=TRACE,llms=TRACE,TRACE" spice run
```

### Granular Configuration

For specific component trace configuration, adjust the trace levels as needed:

```bash
SPICED_LOG="spiced=INFO,runtime=DEBUG,data_components=WARN,cache=WARN" spice run
```
