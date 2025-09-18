---
title: 'Zipkin Integration'
sidebar_label: 'Zipkin'
description: 'Learn how to integrate Spice with Zipkin tracing.'
tags:
  - zipkin
  - observability
  - tracing
---

Spice supports distributed tracing by integrating with [Zipkin](https://zipkin.io/) and compatible tracing systems.

<img width="740" alt="zipkin" src="https://github.com/user-attachments/assets/5addc073-35ee-4a84-bf63-7d94ad106187" />

<img width="740" alt="zipkin" src="https://github.com/user-attachments/assets/d8f77900-de1b-430c-96eb-051c10d3ff72" />

## Configuration

Enable Zipkin tracing by configuring the `runtime.tracing` section in `spicepod.yaml`:

```yaml
runtime:
  tracing:
    zipkin_enabled: true
    zipkin_endpoint: "http://your_zipkin_host:9411/api/v2/spans"
```

Trace data will be available in the Zipkin UI at `http://your_zipkin_host:9411`. See the [Zipkin Quickstart](https://zipkin.io/pages/quickstart) to run a test server.

## Trace Information

A trace in Spice represents a completed task (such as a SQL query, AI chat completion, or tool call). Each trace is a unique span, recording execution time, inputs, outputs, and errors.

```console
+----------------------------------+------------------+---------------------+----------------------------+----------------------------+-----------------------+---------------------------------------------------------------------------------------------+
| trace_id                         | span_id          | task                | start_time                 | end_time                   | execution_duration_ms | error_message                                                                               |
+----------------------------------+------------------+---------------------+----------------------------+----------------------------+-----------------------+---------------------------------------------------------------------------------------------+
| 687e0970f8c49d19c5a08764ea2d4dc1 | f4f52ed29db8b151 | text_embed          | 2024-11-25T05:39:37.444749 | 2024-11-25T05:39:53.577195 | 16132.446000000002    |                                                                                             |
| 1e881188e5fd252b26adb8a8d838efb8 | 532b0019ad778094 | sql_query           | 2024-11-25T05:40:38.864982 | 2024-11-25T05:40:38.871090 | 6.108                 |                                                                                             |
| ac5abd8bfec7e5aa7c19fc84772c55f1 | 316622ac359e3c00 | sql_query           | 2024-11-25T05:39:39.872946 | 2024-11-25T05:39:39.872994 | 0.048                 | This feature is not implemented: The context currently only supports a single SQL statement |
| 701874d7282dd47791e7519b343a9694 | 5dacf75c4537ee0e | accelerated_refresh | 2024-11-25T05:39:30.452534 | 2024-11-25T05:39:30.452900 | 0.366                 |                                                                                             |
| 18d76b6389898cc5253a49294607477d | cc0d06a4e69cbcd5 | health              | 2024-11-25T05:39:30.451626 | 2024-11-25T05:39:31.563876 | 1112.25               |                                                                                             |
| 3c75d16b6b4b8da98c551d115e1c049c | 9a16dc065a95236a | sql_query           | 2024-11-25T05:42:27.386754 | 2024-11-25T05:42:27.386859 | 0.10500000000000001   | SQL error: ParserError("Expected: an SQL statement, found: ELECT")                          |
+----------------------------------+------------------+---------------------+----------------------------+----------------------------+-----------------------+---------------------------------------------------------------------------------------------+
```

For more details, see [task_history](/docs/reference/task_history).
