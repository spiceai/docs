---
title: 'Explain'
sidebar_label: 'Explain'
pagination_prev: 'reference/sql/subqueries'
pagination_next: 'reference/sql/information_schema'
sidebar_position: 1
---

:::info
Spice is built on [Apache DataFusion](https://datafusion.apache.org/) and uses the PostgreSQL dialect, even when querying datasources with different SQL dialects.  
:::

# EXPLAIN

The `EXPLAIN` command shows the logical and physical execution plan of a SQL statement.

<pre>
EXPLAIN [ANALYZE] [VERBOSE] statement
</pre>

Shows the execution plan of a statement.
Use `EXPLAIN VERBOSE` if more detailed output is needed.

```
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

```
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
