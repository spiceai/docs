---
title: 'Go SDK'
description: 'Connect to spice using spice go SDK'
pagination_prev: null
pagination_next: null
---

## Golang SDK for Spice.ai

https://github.com/spiceai/gospice

### Install

```shell
go get github.com/spiceai/gospice/v6
```

### Connect to spice runtime

Import the package:

```go
import "github.com/spiceai/gospice/v6"
```

Create a `SpiceClient` using default configuration:

```go
spice := NewSpiceClient()
defer spice.Close()
```

Or pass custom flight address:

```go
if err := spice.Init(
    spice.WithFlightAddress("grpc://my_remote_spice_instance:50051")
); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```

Execute a query and get back an Apache Arrow Reader:

```go
reader, err := spice.Query(
  context.Background(),
  "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;"
)
if err != nil {
    panic(fmt.Errorf("error querying: %w", err))
}
defer reader.Release()
```
