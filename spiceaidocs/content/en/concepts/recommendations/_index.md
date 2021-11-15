---
type: docs
title: "Recommendations"
linkTitle: "Recommendations"
weight: 13
description: "Reference documentation for Spice.ai Recommendations"
---

- [API Reference]({{<ref "api#recommendations">}})

Recommendations are the core of how Spice.ai can make apps intelligent. After a pod has been trained by specifying [Dataspaces]({{<ref "concepts/dataspaces">}}) which contain the data the AI should train on, the [Actions]({{<ref "reference/pod#actions">}}) that can be taken, the [Rewards]({{<ref "concepts/rewards">}}) for taking those actions, an app makes requests for intelligent recommendations on how it should behave based on new data.

By default, Spice.ai will recommend actions based on the last ingested observation, but this can be tweaked by asking for a recommendation at a specific time.

## API Format

Get a recommendation for action with the last ingested observation:

`GET http://localhost:8000/api/v0.1/pods/{pod}/recommendation`

Get a recommendation for an action at a specific time:

`GET http://localhost:8000/api/v0.1/pods/{pod}/recommendation?time={unix_timestamp}`

where `{unix_timestamp}` is the number of seconds since the Unix epoch.

## Example

For `quickstarts/trader` a valid request at a specific time is:

`GET http://localhost:8000/api/v0.1/pods/trader/recommendation?time=1605729600`
