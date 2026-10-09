---
title: 'Explain'
sidebar_label: 'Explain'
sidebar_position: 5
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.
:::

The `EXPLAIN` command shows the logical and physical execution plan of a SQL statement.

`EXPLAIN [ANALYZE] [VERBOSE] statement`

Shows the execution plan of a statement.
Use `EXPLAIN VERBOSE` if more detailed output is needed.

```sql
EXPLAIN SELECT SUM(x) FROM table GROUP BY b;
+---------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                           |
+---------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| logical_plan  | Projection: #SUM(table.x)                                                                                                                                        |
|               |   Aggregate: groupBy=[[#table.b]], aggr=[[SUM(#table.x)]]                                                                                                          |
|               |     TableScan: table projection=[x, b]                                                                                                                           |
| physical_plan | ProjectionExec: expr=[SUM(table.x)@1 as SUM(table.x)]                                                                                                              |
|               |   AggregateExec: mode=FinalPartitioned, gby=[b@0 as b], aggr=[SUM(table.x)]                                                                                      |
|               |     CoalesceBatchesExec: target_batch_size=4096                                                                                                                |
|               |       RepartitionExec: partitioning=Hash([Column { name: "b", index: 0 }], 16)                                                                                 |
|               |         AggregateExec: mode=Partial, gby=[b@1 as b], aggr=[SUM(table.x)]                                                                                         |
|               |           RepartitionExec: partitioning=RoundRobinBatch(16)                                                                                                    |
|               |             DataSourceExec: file_groups={1 group: [[/tmp/table.csv]]}, projection=[x, b], has_header=false                                            |
|               |                                                                                                                                                                |
+---------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

## EXPLAIN ANALYZE

Shows the execution plan of a statement.
Use `EXPLAIN ANALYZE VERBOSE` if more detailed output is needed.
`EXPLAIN ANALYZE FORMAT pgjson` returns the plan with its metrics in the PostgreSQL JSON plan format.

```sql
EXPLAIN ANALYZE SELECT SUM(x) FROM table GROUP BY b;
+-------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type         | plan                                                                                                                                                      |
+-------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Plan with Metrics | CoalescePartitionsExec, metrics=[]                                                                                                                        |
|                   |   ProjectionExec: expr=[SUM(table.x)@1 as SUM(x)], metrics=[]                                                                                             |
|                   |     HashAggregateExec: mode=FinalPartitioned, gby=[b@0 as b], aggr=[SUM(x)], metrics=[outputRows=2]                                                       |
|                   |       CoalesceBatchesExec: target_batch_size=4096, metrics=[]                                                                                             |
|                   |         RepartitionExec: partitioning=Hash([Column { name: "b", index: 0 }], 16), metrics=[sendTime=839560, fetchTime=122528525, repartitionTime=5327877] |
|                   |           HashAggregateExec: mode=Partial, gby=[b@1 as b], aggr=[SUM(x)], metrics=[outputRows=2]                                                          |
|                   |             RepartitionExec: partitioning=RoundRobinBatch(16), metrics=[fetchTime=5660489, repartitionTime=0, sendTime=8012]                              |
|                   |               DataSourceExec: file_groups={1 group: [[/tmp/table.csv]]}, has_header=false, metrics=[]                                                        |
+-------------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
```

## EXPLAIN Options

`EXPLAIN` also accepts a PostgreSQL-style list of options in parentheses:

```sql
EXPLAIN ( option [, ...] ) statement
```

The list form also exposes the `METRICS`, `LEVEL`, and `COSTS` settings, which have no keyword form.

| Option    | Argument             | Effect                                                                                                                               |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ANALYZE` | Boolean, optional    | Run the statement and collect metrics. The same as the `ANALYZE` keyword.                                                           |
| `VERBOSE` | Boolean, optional    | Show more detail. The same as the `VERBOSE` keyword.                                                                                 |
| `FORMAT`  | Format name          | `indent`, `tree`, `pgjson`, or `graphviz`. The same as the `FORMAT` clause.                                                          |
| `METRICS` | String               | Requires `ANALYZE`. The metric categories to show: `'all'`, `'none'`, or a comma-separated list of `rows`, `bytes`, `timing`, and `uncategorized`. |
| `LEVEL`   | `summary` or `dev`   | Requires `ANALYZE`. `summary` shows the common metrics, and `dev` shows every operator metric.                                       |
| `TIMING`  | Boolean              | Requires `ANALYZE`. Include or exclude the `timing` metric category.                                                                 |
| `SUMMARY` | Boolean              | Requires `ANALYZE`. `TRUE` is the same as `LEVEL summary`, and `FALSE` is the same as `LEVEL dev`.                                   |
| `COSTS`   | Boolean              | Add the operator statistics, such as row counts and column minimums and maximums, to the physical plan. Cannot be combined with `ANALYZE`. |

A boolean argument can be omitted, which means `TRUE`, or written as `TRUE`, `FALSE`, `ON`, `OFF`, `1`, or `0`. For example, `EXPLAIN (ANALYZE OFF) SELECT 1` shows the plan without running the statement.

PostgreSQL options that Spice does not model, such as `BUFFERS`, `WAL`, `SETTINGS`, `GENERIC_PLAN`, and `MEMORY`, return an error instead of being ignored:

```sql
EXPLAIN (BUFFERS) SELECT 1;
```

```text
This feature is not implemented: EXPLAIN option BUFFERS is not supported by DataFusion; see METRICS for category filtering
```
