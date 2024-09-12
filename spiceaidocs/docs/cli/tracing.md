---
title: 'Configuring Trace Levels'
sidebar_label: 'Trace Levels'
description: 'Documentation on how to configure Spice.ai OSS trace levels'
pagination_prev: null
---

Trace verbosity is controlled by the `SPICED_LOG` environment variable.

### Default Trace Levels

The default level is `INFO` for these components:

```bash
SPICED_LOG="task_history=INFO,spiced=INFO,runtime=INFO,secrets=INFO,data_components=INFO,cache=INFO,extensions=INFO,spice_cloud=INFO"
```

### Enabling Debug Mode

To enable debug mode, which provides detailed logs, use:

```bash
SPICED_LOG="DEBUG" spice run
```

For the most verbose logging, set the trace level to `TRACE`:

```bash
SPICED_LOG="TRACE" spice run
```

### Granular Configuration

For specific components, adjust the trace levels as needed:

```bash
SPICED_LOG="spiced=INFO,runtime=DEBUG,data_components=WARN,cache=WARN" spice run
```