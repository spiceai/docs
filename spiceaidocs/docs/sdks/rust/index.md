---
title: 'Rust SDK'
description: 'Connect to spice using spice rust SDK'
pagination_prev: null
pagination_next: null
---

# Rust SDK for Spice.ai

https://github.com/spiceai/spice-rs


### Install

```shell
cargo add spiceai
```

### Connect to spice runtime

Create a `SpiceClient` using default configuration:

```rust
use spiceai::ClientBuilder;

#[tokio::main]
async fn main() {
  let mut client = ClientBuilder::new()
    .build()
    .await
    .unwrap();

  let data = client.query(
    "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;"
  ).await;
}
```

Or pass custom flight address:

```rust
use spiceai::ClientBuilder;

#[tokio::main]
async fn main() {
  let mut client = ClientBuilder::new()
    .flight_url("http://my_remote_spice_instance:50051")
    .build()
    .await
    .unwrap();

  let data = client.query(
    "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;"
  ).await;
}
```