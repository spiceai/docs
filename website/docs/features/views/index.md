---
title: 'Views'
sidebar_label: 'Views'
description: 'Documentation for defining Views in Spice'
image: /img/og/views.png
sidebar_position: 16
---

Views in Spice are virtual tables defined by SQL queries. They help simplify complex queries and promote reuse across different applications by encapsulating query logic in a single, reusable entity.

## Defining a View

To define a view in the `spicepod.yaml` configuration file, specify the `views` section. Each view definition must include a `name` and a `sql` field.

### Example

The following example demonstrates how to define a view named `rankings` that lists the top five products based on the total count of orders:

```yaml
views:
  - name: rankings
    sql: |
      WITH a AS (
        SELECT products.id, SUM(count) AS count
        FROM orders
        INNER JOIN products ON orders.product_id = products.id
        GROUP BY products.id
      )
      SELECT name, count
      FROM products
      LEFT JOIN a ON products.id = a.id
      ORDER BY count DESC
      LIMIT 5
```

### Fields

- `name`: The view's identifier, used for referencing in queries.
- `sql`: The SQL query defining the view, supporting joins, subqueries, and aggregations.
- `acceleration`: Views can be [locally accelerated](../data-acceleration/index.md).

## Limitations and Considerations

- Views are read-only; insert, update, and delete operations are not supported.
- Performance depends on SQL complexity and underlying data. Ensure queries are optimized to prevent slow execution.
- An accelerated view re-runs its **full** SQL on each [`refresh_check_interval`](../../reference/spicepod/views#accelerationrefresh_check_interval). There is no "only recompute rows that changed in the base" maintenance today. [Spice Cayenne](../../components/data-accelerators/cayenne#maintained-aggregates) incrementally maintains **aggregate** views declared with `maintained_aggregates` on CDC (`refresh_mode: changes`) datasets — that is a dataset feature, not a general accelerated-view maintenance path.
- Prefer a few datasets plus [indexes](../data-acceleration/indexes) (and/or [cluster acceleration](../../deployment/architectures/cluster-sidecar) plus a sidecar [SQL results cache](../caching)) over hundreds of per-key accelerated views. An accelerated view's store sits on top of the base — roughly twice the disk if it keeps a full filtered copy. Views do not compact the base dataset's history; bound disk with [`retention_period`](../../reference/spicepod/datasets#accelerationretention_period) / [`retention_sql`](../../reference/spicepod/datasets#accelerationretention_sql) on the source acceleration.
- Spicepod datasets and views can [hot-reload](../../cli/reference/spiced) without a process restart (`spice run`, or `spiced --pods-watcher-enabled`). For large numbers of definitions, the [Spice.ai Enterprise Kubernetes Operator](https://docs.spice.ai/docs/enterprise/kubernetes-operator/kubernetes) is the recommended control plane.

## Schema Inference and Evolution

Views derive their schema from the SQL query that defines them. When a view is accelerated, Spice materializes this schema into the acceleration engine at startup.

If the underlying dataset schemas change while the runtime is running, the accelerated view will fail to refresh because the materialized schema no longer matches the source data. Restart the runtime to re-derive the view schema from the updated datasets.

For more detail on schema inference and runtime schema changes, see the [Data Connectors schema inference](../../components/data-connectors/index.md#schema-inference) documentation.
