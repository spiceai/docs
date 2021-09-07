---
type: docs
title: "Duration literals"
linkTitle: "Duration literals"
weight: 80
---

A _duration literal_ is a representation of a length of time. It has an integer part and a duration unit part. Multiple durations may be specified together and the resulting duration is the sum of each smaller part. When several durations are specified together, larger units must appear before smaller ones, and there can be no repeated units.

```js
duration_lit = { int_lit duration_unit } .
duration_unit = "y" | "mo" | "w" | "d" | "h" | "m" | "s" | "ms" | "us" | "µs" | "ns" .
```

| Units    | Meaning                                 |
| -------- | --------------------------------------- |
| y        | year (12 months)                        |
| mo       | month                                   |
| w        | week (7 days)                           |
| d        | day                                     |
| h        | hour (60 minutes)                       |
| m        | minute (60 seconds)                     |
| s        | second                                  |
| ms       | milliseconds (1 thousandth of a second) |
| us or µs | microseconds (1 millionth of a second)  |
| ns       | nanoseconds (1 billionth of a second)   |

Durations represent a length of time.
Lengths of time are dependent on specific instants in time they occur and as such,
durations do not represent a fixed amount of time.
There are no amount of days equal to a month, as months vary in their number of days.

##### Examples of duration literals

```js
1s
10d
1h15m  // 1 hour and 15 minutes
5w
1mo5d  // 1 month and 5 days
-1mo5d // negative 1 month and 5 days
5w * 2 // 10 weeks
```
