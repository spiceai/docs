---
title: 'Views'
sidebar_label: 'Views'
description: 'Documentation for defining Views in Spice'
sidebar_position: 7
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

## Limitations and Considerations

- Views do not support acceleration; instead accelerate the underlying dataset(s).
- Views are read-only; insert, update, and delete operations are not supported.
- Performance depends on SQL complexity and underlying data.
- Ensure queries are optimized to prevent slow execution.
