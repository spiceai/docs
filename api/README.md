# API Reference

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

Returns a list of observations. E.g.

```json
[
  {
    "time": 123456789,
    "data": {
      "usd_balance": 123,
      "btc_balance": 123
    }
  }
]
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

### Inference

`GET http://localhost:8000/api/v0.1/pods/<pod>/inference`

Gets an inference for a given pod at the current state.

Returns an inference. E.g.

```json
{
  "action": "right",
  "confidence": 0.0,
  "end": "2021-08-18T20:59:10",
  "start": "2021-08-18T20:59:00",
  "tag": "latest"
}
```
