---
title: "Dotnet SDK"
description: "Connect to Spice using Spice Dotnet SDK"
pagination_prev: null
pagination_next: null
---

# Dotnet SDK for Spice.ai

https://github.com/spiceai/spice-dotnet

### Install

```shell
dotnet add package spiceai
```

### Connect to spice runtime

Create a `SpiceClient` using default configuration:

```csharp
using Spice;

var client = new SpiceClientBuilder().Build();

var data = await client.query("SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;");
```

Or pass custom flight address:

```csharp
using Spice;

var client = new SpiceClientBuilder()
    .WithFlightAddress("http://my_remote_spice_instance:50051")
    .Build();

var data = await client.query("SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;");
```
