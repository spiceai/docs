---
title: 'Protected Keywords'
sidebar_label: 'Protected Keywords'
description: 'Protected keywords for datasets'
tags:
  - reference
  - spicepod
  - datasets
---

The following keywords cannot be used as names for datasets.

## General Protected Keywords

These keywords apply to all data connectors:

- WITH
- EXPLAIN
- ANALYZE
- SELECT
- WHERE
- GROUP
- SORT
- PIVOT
- UNPIVOT
- TOP
- LATERAL
- VIEW
- LIMIT
- OFFSET
- FETCH
- UNION
- EXCEPT
- INTERSECT
- MINUS
- ON
- JOIN
- INNER
- CROSS
- FULL
- LEFT
- RIGHT
- NATURAL
- USING
- CLUSTER
- DISTRIBUTE
- GLOBAL
- ANTI
- SEMI
- RETURNING
- ASOF
- MATCH_CONDITION
- TABLE
- FROM
- INTO
- END

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
