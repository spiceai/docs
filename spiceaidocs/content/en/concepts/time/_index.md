---
type: docs
title: "Time"
linkTitle: "Time"
weight: 5
description: "The concept of Time and Time-Series in Spice.ai"
---

Spice.ai is a time series AI platform, so time is one of Spice.ai's most fundamental and core concepts.

## What is time series data?

Time series data is a series of timestamped data points or events indexed in time order. In Spice.ai, these data points are called Observations. For example, temperature sensor readings on an interval or a daily stock price are examples of time series data. Time series data applies to many domains, including analytics, finance, health and biometrics, IoT and industrial, security, and application monitoring. To learn more, Wikipedia has a comprehensive article on [time series](https://en.wikipedia.org/wiki/Time_series), and InfluxData has published a very informative article, [What is time series data?](https://www.influxdata.com/what-is-time-series-data/)

## Why time series AI?

One definition of artificial intelligence proposed by [Hado van Hasselt from DeepMind](https://www.youtube.com/watch?v=TCCjZe0y4Qc&list=PLqYmG7hTraZDVH599EItlEWsUOsJbAodm) is "to be able to learn to make decisions to achieve goals." Using this definition can conclude that these decisions are made over time to achieve an application's goals. Thus, time and time-series data can be seen as fundamental concepts when developing an application's intelligence.

## Time series in Spice.ai

Spice.ai natively ingests, processes, and learns from time series data. There are three core time series concepts in Spice.ai:

- A time series **Period** and its period **Epoch**
- Consecutive **intervals** or windows of time series observations
- The smallest **granularity** of time in the series
A visualization of these concepts over a timeline is below:

<img width="782" alt="spiceai-time" src="https://user-images.githubusercontent.com/80174/144559519-fc875d71-b43f-402a-ba2e-6754ebba9df0.png">

Each of these concepts translates to developer configurable parameters in the Spicepod. For example, the Trader Sample uses these pod parameters in its manifest:

```yaml
name: trader
params:
  period: 30m
  interval: 30s
  granularity: 5s
```

If not provided in the manifest, Spicepods will default to a period of **3 days**, intervals of **1 min**, and granularity of **10 seconds**. The period epoch will default to a dynamic epoch of the current time minus the period. In this mode, the period becomes a sliding window over time.

### Period

The `period` defines the entire timespan the Spicepod will use for learning and decision-making.

Thus the time series period has a start time of `epoch` and an end time of `epoch` + `period`.

### Period Epoch

The period `epoch` defines the beginning, or start, of the Spicepod's time series data. Spice.ai will discard data timestamped before the epoch time.

The epoch defaults to the current time - `period`.

### Interval

The `interval` defines the interval or window of time the AI engine uses to learn.

The first interval of data, from `epoch` to `epoch` + `interval` is considered pre-training or "warm-up" data. At least one interval's worth of data is required before the AI engine can learn and make a decision recommendation.

The AI engine then trains on consecutive data intervals for the rest of the period to learn.

### Granularity

The `granularity` defines the smallest unit of time series data. The granularity can be conceptualized in practice as the time a decision is valid. For example, a decision to turn on or off an air conditioner would be valid for a `granularity` unit of time.

Spice.ai will aggregate observations within a granularity timespan. This aggregation results in granularity-sized "ticks" or time-steps in the series.

Each consecutive training interval advances by a unit of granularity over the entire period. Thus, the granularity cannot be larger than the interval.
