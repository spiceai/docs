---
type: docs
title: "Spice.ai API Reference"
linkTitle: "API Reference"
weight: 60
description: "Detailed documentation on the Spice.ai API"
---

A comprehensive API reference will be released. In the meantime here is a basic API guide.

### Health

`GET http://localhost:8000/health`

Gets the health of the runtime.

Returns status `ok` if healthy and the error if not.

### Pods

`GET http://localhost:8000/api/v0.1/pods`

Gets the valid pods for the application.

Returns a list of pods. E.g.

```json
[
  {
    "name": "logpruner"
  }
]
```

`GET http://localhost:8000/api/v0.1/pods/[pod]`

Gets the pod for the application.

Returns a pod. E.g.

```json
{
  "name": "logpruner"
}
```

### Observations

`GET http://localhost:8000/api/v0.1/pods/<pod>/observations`

Gets the cached observations for the pod.

Returns a list of observations in CSV format. E.g.

```
time,hostmetrics.cpu.usage_idle
1629159360,99.56272495215877
1629159600,99.56016726103087
1629159840,99.5835393622478
1629160080,99.58402078629656
1629160320,99.5845216501822
```

### Flights

`GET http://localhost:8000/api/v0.1/pods/<pod>/flights`

Gets the training flights for a pod.

Returns a list of flights. E.g.

```json
[
  {
    "id": "flight-abc",
    "start": 123456789,
    "end": 123456789
  }
]
```

### Recommendations

`GET http://localhost:8000/api/v0.1/pods/<pod>/recommendation`

Gets a recommendation for a given pod at the current state.

Returns a recommendation for an action. E.g.

```json
{
  "response": {
    "result": "ok"
  },
  "start": 1607886000,
  "end": 1607907600,
  "action": "sell",
  "confidence": 0.901,
  "tag": "latest"
}
```
