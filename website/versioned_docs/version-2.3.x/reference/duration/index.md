---
title: 'Duration'
sidebar_label: 'Duration'
sidebar_position: 5
pagination_prev: 'reference/index'
pagination_next: null
---

Durations are represented as a number with a time unit suffix. A value without a suffix is interpreted as seconds, and fractional values (e.g. `1.5h`) are accepted.

Supported time units are:

| Time Unit     | Identifier | Calculation |
| ------------: | ---------: | ----------: |
| `Nanosecond`  |         ns |         `1` |
| `Millisecond` |         ms |   `1000000` |
|      `Second` |          s |        `1s` |
|      `Minute` |          m |       `60s` |
|        `Hour` |          h |       `60m` |
|         `Day` |          d |       `24h` |
|        `Week` |          w |        `7d` |

Microseconds are also supported, spelled `Ms` (capital `M`, lowercase `s`).

Month and year units are **not** supported — their length is ambiguous, so express longer intervals in weeks or days.

## Example

```example
# 1 second
1s

# 250 milliseconds
250ms

# 3 minutes
3m

# 1 hour
1h
```

### Additional Example

```example
# 2 days
2d

# 1 week
1w

# 90 minutes
1.5h

# 30 seconds (no suffix)
30
```
