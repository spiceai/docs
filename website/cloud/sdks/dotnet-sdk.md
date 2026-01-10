---
description: Dotnet SDK for Spice.ai
---

# Dotnet SDK

The [Dotnet SDK](https://github.com/spiceai/spice-dotnet) `spiceai` is the easiest way to query [Spice.ai](https://spice.ai) from Dotnet.

It uses [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) to efficiently stream data to the client and [Apache Arrow](https://arrow.apache.org/) Records as data frames.

### Requirements

* .Net 6.0+ or .Net Standard 2.0+

### Installation

Add Spice SDK

```bash
dotnet add package spiceai
```

### Usage

1. Create a `SpiceClient` by providing your API key to `SpiceClientBuilder`.  Get your free API key at [Spice.ai](https://spice.ai/).

```csharp
using Spice;

var client = new SpiceClientBuilder()
    .WithApiKey("API_KEY")
    .WithSpiceCloud("http://my_remote_spice_instance:50051")
    .Build();
```

2. Execute a query and get back an Apache Arrow [Flight Client Record Batch Stream Reader](https://github.com/apache/arrow/blob/67bbf846d0d47075e1711b3fb4cf8fb05c74bd09/csharp/src/Apache.Arrow.Flight/Client/FlightClientRecordBatchStreamReader.cs#L22).

```csharp
var reader = await client.Query("SELECT * FROM tpch.lineitem LIMIT 10;");
```

3. Iterate through the reader to access the records.

```csharp
var enumerator = result.GetAsyncEnumerator();
while (await enumerator.MoveNextAsync())
{
    var batch = enumerator.Current;
    // Process batch
}
```

### Usage with local Spice runtime

Follow the [quickstart guide](https://github.com/spiceai/spiceai?tab=readme-ov-file#%EF%B8%8F-quickstart-local-machine) to install and run spice locally.

```csharp
using Spice;

var client = new SpiceClientBuilder()
    .Build();
    
var data = await client.Query("SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;");
```

### Contributing

Contribute to or file an issue with the `spice-dotnet` library at: [https://github.com/spiceai/spice-dotnet](https://github.com/spiceai/spice-dotnet)
