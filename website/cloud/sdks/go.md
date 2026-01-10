---
description: Golang SDK for Spice.ai
---

# Go SDK

The [Go SDK](https://github.com/spiceai/gospice) `gospice` is the easiest way to query [Spice.ai](https://spice.ai) from Go.

It uses [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) to efficiently stream data to the client and [Apache Arrow](https://arrow.apache.org/) Records as data frames.

GoDocs are available at: [pkg.go.dev/github.com/spiceai/gospice](https://pkg.go.dev/github.com/spiceai/gospice/v5)[.](https://pkg.go.dev/github.com/spiceai/gospice/v5)

### Requirements

* [Go 1.22](https://go.dev/doc/go1.22) (or later)

### Installation

Get the **gospice** package.

```bash
go get github.com/spiceai/gospice/v7
```

### Usage

1\. Import the package.

```go
import "github.com/spiceai/gospice/v7"
```

2\. Create a `SpiceClient` by providing your API key. Get your free API key at [spice.ai](https://spice.ai/).

```go
spice := gospice.NewSpiceClient()
defer spice.Close()
```

3\. Initialize the `SpiceClient`.

```go
if err := spice.Init(
    spice.WithApiKey(ApiKey),
    spice.WithSpiceCloudAddress()
); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```

4\. Execute a query and get back an [Apache Arrow Record Reader](https://pkg.go.dev/github.com/apache/arrow/go/v17@v17.0.0/arrow#example-package-RecordReader).

```go
reader, err := spice.Query(context.Background(), "SELECT * FROM tpch.lineitem LIMIT 10")
if err != nil {
    panic(fmt.Errorf("error querying: %w", err))
}
defer reader.Release()
```

5\. Iterate through the reader to access the records.

```go
for reader.Next() {
    record := reader.Record()
    defer record.Release()
    fmt.Println(record)
}
```

### Usage with local Spice runtime

Follow the [quickstart guide](https://github.com/spiceai/spiceai?tab=readme-ov-file#%EF%B8%8F-quickstart-local-machine) to install and run spice locally.

```go
spice := gospice.NewSpiceClient()
defer spice.Close()

if err := spice.Init(); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```

Or using custom flight address:

```go
spice := gospice.NewSpiceClient()
defer spice.Close()

if err := spice.Init(
    spice.WithFlightAddress("grpc://localhost:50052")
); err != nil {
    panic(fmt.Errorf("error initializing SpiceClient: %w", err))
}
```

Check [Spice OSS documentation](https://docs.spiceai.org/clients) to learn more.

### Example

Run `go run .` to execute a sample query and print the results to the console.

### Connection retry

The `SpiceClient` implements connection retry mechanism (3 attempts by default). The number of attempts can be configured via `SetMaxRetries`:

```go
spice := NewSpiceClient()
spice.SetMaxRetries(5) // Setting to 0 will disable retries
```

Retries are performed for connection and system internal errors. It is the SDK user's responsibility to properly handle other errors, for example `RESOURCE_EXHAUSTED (HTTP 429)`.

### Contributing

Contribute to or file an issue with the `gospice` library at: [https://github.com/spiceai/gospice](https://github.com/spiceai/gospice)
