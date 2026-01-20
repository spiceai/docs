---
title: 'Go SDK'
description: 'Connect to Spice using the Go SDK'
pagination_prev: null
pagination_next: null
tags:
  - sdk
  - go
  - golang
---

## Go SDK for Spice.ai

[github.com/spiceai/gospice](https://github.com/spiceai/gospice)

### Install

```shell
go get github.com/spiceai/gospice/v8@latest
```

### Connect to Spice Runtime

Import the package:

```go
import "github.com/spiceai/gospice/v8"
```

Create a `SpiceClient` using default configuration:

```go
spice := gospice.NewSpiceClient()
defer spice.Close()

if err := spice.Init(); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```

Or pass a custom flight address:

```go
if err := spice.Init(
    gospice.WithFlightAddress("grpc://my_remote_spice_instance:50051"),
); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```

### Execute a Query

Execute a query and get back an Apache Arrow RecordReader:

```go
reader, err := spice.Sql(
    context.Background(),
    "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10",
)
if err != nil {
    panic(fmt.Errorf("error querying: %w", err))
}
defer reader.Release()

for reader.Next() {
    record := reader.RecordBatch()
    defer record.Release()
    fmt.Println(record)
}
```

### Parameterized Queries

Use `SqlWithParams()` for parameterized queries to prevent SQL injection and improve performance:

```go
reader, err := spice.SqlWithParams(
    context.Background(),
    "SELECT * FROM customers WHERE c_custkey > $1 LIMIT $2",
    100,  // $1: customer key threshold
    10,   // $2: limit
)
if err != nil {
    panic(fmt.Errorf("error querying: %w", err))
}
defer reader.Release()
```

Multiple parameter types are supported with automatic type inference:

```go
reader, err := spice.SqlWithParams(
    ctx,
    "SELECT * FROM orders WHERE customer_id = $1 AND order_date > $2 AND total > $3",
    42,           // int
    "2024-01-01", // string
    100.50,       // float64
)
```

For explicit type control, use typed parameter constructors:

```go
import "github.com/apache/arrow-go/v18/arrow"

reader, err := spice.SqlWithParams(
    ctx,
    "SELECT * FROM financial WHERE amount >= $1",
    gospice.Decimal128Param(amountBytes, 19, 4),
)
```

For more details, see [Parameterized Queries](../../features/query-federation/parameterized-queries.mdx).

### Health Checks

Check if the Spice instance is healthy:

```go
ctx := context.Background()

// Unauthenticated health check
if spice.IsSpiceHealthy(ctx) {
    fmt.Println("Spice is healthy")
}

// Authenticated readiness check (requires API key for Spice Cloud)
if spice.IsSpiceReady(ctx) {
    fmt.Println("Spice is ready")
}
```

### Connection to Spice Cloud

Connect to Spice Cloud with an API key:

```go
spice := gospice.NewSpiceClient()
defer spice.Close()

if err := spice.Init(
    gospice.WithApiKey(os.Getenv("SPICE_API_KEY")),
    gospice.WithSpiceCloudAddress(),
); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```
