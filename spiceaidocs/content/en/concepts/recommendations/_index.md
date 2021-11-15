---
type: docs
title: "Recommendations"
linkTitle: "Recommendations"
weight: 13
description: "Reference documentation for Spice.ai Recommendations"
---

- [API Reference]({{<ref "api#recommendations">}})

Recommendations are core to making intelligent apps that learn and adapt.

Adaptive applications use Spice.ai Recommendations to inform their behavior and decisions on what actions to take during their operation. Each recommendation includes a confidence score, from zero to one. Applications should decide on the appropriate level of confidence for its given scenario as to act upon the recommendation or not.

Valid recommendations (confidence scores greater than zero) are returned after the first training run for a pod is complete.

If a time is not specified, the resulting recommendation query time will default to the time of the most recently ingested observation within the pod period.

## API Format

Get a recommendation using the latest ingested observation time:

`GET http://localhost:8000/api/v0.1/pods/{pod}/recommendation`

Get a recommendation for a specified time:

`GET http://localhost:8000/api/v0.1/pods/{pod}/recommendation?time={unix_timestamp}`

where `{unix_timestamp}` is specified in [Unix time](https://en.wikipedia.org/wiki/Unix_time) in seconds. See [Time]({{<ref "concepts/#time">}}) for more information on how Spice.ai handles time.

## Example

For `quickstarts/trader` a valid request at a specific time is:

`GET http://localhost:8000/api/v0.1/pods/trader/recommendation?time=1605729600`
