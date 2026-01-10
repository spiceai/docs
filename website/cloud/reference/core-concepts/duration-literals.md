# Duration Literals

A _duration literal_ is a representation of a length of time. It has an integer part and a duration unit part. Multiple durations may be specified together and the resulting duration is the sum of each smaller part. When several durations are specified together, larger units must appear before smaller ones, and there can be no repeated units.

| Units | Meaning             |
| ----- | ------------------- |
| w     | week (7 days)       |
| d     | day (24 hours)      |
| h     | hour (60 minutes)   |
| m     | minute (60 seconds) |
| s     | second              |

Durations represent a length of time. Lengths of time are dependent on specific instants in time they occur and as such, durations do not represent a fixed amount of time.

**Examples of duration literals**

```js
1s
1h15m  // 1 hour and 15 minutes
72h // 72h hrs = 3 days
```
