---
title: 'Cron Schedules'
sidebar_label: 'Cron Schedules'
pagination_prev: 'reference/index'
pagination_next: null
sidebar_position: 9
---

The Spice Runtime uses the [`croner` Rust crate](https://github.com/hexagon/croner-rust?tab=readme-ov-file#pattern) for parsing cron expressions.

The Runtime supports cron expressions with optional seconds, like `*/10 * * * * *` which evaluates to every 10th second (10, 20, 30, etc).

Cron expressions in the Runtime evaluate according to the systems local time where the Runtime is running.

## Examples

### At 1am every Monday

```text
0 1 * * 1
```

### At midday every weekday (Monday-Friday)

```text
0 12 * * 1-5
```

### Every hour, at 5 minutes past the hour

```text
5 * * * *
```

### Every 10 minutes

```text
*/10 * * * *
```

### Every 5 minutes at 30 seconds

```text
30 */5 * * * *
```