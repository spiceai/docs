---
type: docs
title: "Server Ops"
linkTitle: "Example - Server Ops"
weight: 80
---

From: https://github.com/spiceai/samples/tree/trunk/serverops

```yaml
name: serverops
params:
  period: 24h
  interval: 10m
  granularity: 30s
dataspaces:
  - from: hostmetrics
    name: cpu
    data:
      connector:
        name: influxdb
        params:
          url: SPICE_INFLUXDB_URL
          token: SPICE_INFLUXDB_TOKEN
          org: SPICE_INFLUXDB_ORG
          bucket: SPICE_INFLUXDB_BUCKET
          measurement: cpu
          field: usage_idle
      processor:
        name: flux-csv
    measurements:
      # "usage_idle" measures the percentage of time the CPU is idle
      # Higher values indicate less CPU usage
      - name: usage_idle

actions:
  - name: perform_maintenance
  - name: preload_cache
  - name: do_nothing

training:
  reward_init: |
    high_cpu_usage_threshold = 10

    cpu_usage_new = 100 - next_state["hostmetrics_cpu_usage_idle"]
    cpu_usage_prev = 100 - current_state["hostmetrics_cpu_usage_idle"]
    cpu_usage_delta = cpu_usage_new - cpu_usage_prev

    cpu_usage_delta_abs = cpu_usage_delta
    if cpu_usage_delta_abs < 0:
      cpu_usage_delta_abs *= -1

  rewards:
    - reward: perform_maintenance
      # Reward when cpu usage is low and stable
      with: |
        if cpu_usage_new < high_cpu_usage_threshold:
          # The lower the cpu usage, the higher the reward
          reward = high_cpu_usage_threshold - cpu_usage_new

          # Add an additional reward if the cpu usage trend is stable
          if cpu_usage_delta_abs < 2:
            reward *= 1.5

        else:
          # Penalize performing maintenance at a time when cpu usage is high
          # The higher the cpu usage, the more harsh the penalty should be 
          reward = high_cpu_usage_threshold - cpu_usage_new

    - reward: preload_cache
      # Reward when cpu usage is low and rising
      # Is the cpu usage high now, and was the cpu usage low previously?
      # If so, previous state was a better time to preload,
      # so give a negative reward based on the change
      with: |
        if cpu_usage_new > high_cpu_usage_threshold and cpu_usage_delta > 25:
          reward = -cpu_usage_delta

        # Reward preloading during low cpu usage
        else:
          reward = high_cpu_usage_threshold - cpu_usage_new

    - reward: do_nothing
      # Reward doing nothing under high cpu usage
      # The higher the cpu usage, the higher the reward
      with: |
        if cpu_usage_new > high_cpu_usage_threshold:
          reward = high_cpu_usage_threshold - cpu_usage_new

        # Penalize doing nothing slightly when cpu usage is low
        else:
          reward = -1

          # If the cpu usage trend is unstable, do not apply the penalty
          if cpu_usage_delta_abs > 5:
            reward = 0
```
