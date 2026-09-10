---
title: 'Dotnet SDK'
description: 'Connect to Spice using the Dotnet SDK'
pagination_prev: null
pagination_next: null
tags:
  - sdk
  - dotnet
  - csharp
---

## Dotnet SDK for Spice.ai

[github.com/spiceai/spice-dotnet](https://github.com/spiceai/spice-dotnet)

### Install

```shell
dotnet add package spiceai
```

### Connect to Spice Runtime

Create a `SpiceClient` using default configuration:

```csharp
using Spice;

var client = new SpiceClientBuilder().Build();

var data = await client.Query(
    "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10"
);
```

Or pass a custom flight address:

```csharp
using Spice;

var client = new SpiceClientBuilder()
    .WithFlightAddress("http://my_remote_spice_instance:50051")
    .Build();

var data = await client.Query(
    "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10"
);
```

### Parameterized Queries

Use `Query()` with a `Dictionary<string, object>` for parameterized queries to prevent SQL injection and improve performance (v1.1.0+):

```csharp
using Spice;

var client = new SpiceClientBuilder().Build();

var parameters = new Dictionary<string, object>
{
    { "min_price", 10.0 },
    { "category", "electronics" }
};

var data = await client.Query(
    "SELECT * FROM products WHERE price > :min_price AND category = :category",
    parameters
);
```

For more details, see [Parameterized Queries](../features/query-federation/parameterized-queries).
