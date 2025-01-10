---
title: 'SQL-Based Search'
sidebar_label: 'SQL Search'
description: 'Learn how Spice can perform searches using SQL queries.'
sidebar_position: 1
---

Spice supports basic search patterns directly through SQL, leveraging its SQL query features. For example, you can perform a text search within a table using SQL's `LIKE` clause:

```sql
SELECT id, text_column
FROM my_table
WHERE
    LOWER(text_column) LIKE '%search_term%'
  AND
    date_published > '2021-01-01'
```
