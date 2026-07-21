---
title: 'Microsoft SQL Server Performance'
sidebar_label: 'Performance'
description: 'Performance tuning for the Microsoft SQL Server connector: TopK / ORDER BY ... LIMIT pushdown and NULL ordering.'
sidebar_position: 5
pagination_prev: null
pagination_next: null
---

Performance tuning for the [Microsoft SQL Server connector](./index.md).

## TopK / ORDER BY ... LIMIT pushdown

Spice pushes `ORDER BY ... LIMIT N` queries down to SQL Server as `SELECT TOP N ... ORDER BY ...`, avoiding transferring unnecessary rows over the network. This pushdown is applied when the sort can be satisfied exactly by SQL Server — which depends on NULL ordering.

SQL Server treats `NULL` as the smallest possible value, so its native ordering is:

| Direction | NULLs position |
| --------- | -------------- |
| `ASC`     | First          |
| `DESC`    | Last           |

Most SQL clients and tools (including Spice's default planner) use the opposite convention (`ASC NULLS LAST`, `DESC NULLS FIRST`). When the requested NULL ordering doesn't match SQL Server's native behavior, Spice falls back to fetching all matching rows and applying the limit locally.

**To guarantee TopK pushdown on nullable columns**, explicitly specify the NULL ordering that matches SQL Server's native behavior:

```sql
-- Pushed down: DESC NULLS LAST matches SQL Server native ordering
SELECT id, value FROM my_dataset ORDER BY value DESC NULLS LAST LIMIT 10;

-- Pushed down: ASC NULLS FIRST matches SQL Server native ordering
SELECT id, value FROM my_dataset ORDER BY value ASC NULLS FIRST LIMIT 10;
```

:::tip
Sorting on `NOT NULL` columns (e.g. primary keys) always pushes the limit down regardless of the `NULLS` clause, since there are no NULLs to order.
:::

