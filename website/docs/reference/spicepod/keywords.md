---
title: 'Reserved Keywords'
sidebar_label: 'Reserved Keywords'
description: 'Reserved keywords for datasets'
tags:
  - reference
  - spicepod
  - datasets
---

The following keywords cannot be used as names for datasets.

## General Protected Keywords

These keywords apply to all data connectors:

- COUNT
- FALSE
- NULL
- END-EXEC
- LATERAL
- TABLE
- UNNEST

## Connector-Specific Protected Keywords

### ClickHouse

- PREWHERE
- SETTINGS
- FORMAT

### Snowflake

- START
- CONNECT
- MATCH_RECOGNIZE
- SAMPLE
- TABLESAMPLE
- FROM

### MSSQL

- OUTER
- SET
- QUALIFY
- WINDOW
- END
- FOR

### MySQL

- PARTITION
