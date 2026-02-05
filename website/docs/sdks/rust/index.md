---
title: 'Rust SDK'
description: 'Connect to Spice using the Rust SDK'
pagination_prev: null
pagination_next: null
tags:
  - sdk
  - rust
---

## Rust SDK for Spice.ai

[github.com/spiceai/spice-rs](https://github.com/spiceai/spice-rs)

### Install

```shell
cargo add spiceai
```

### Connect to Spice Runtime

Create a `SpiceClient` using default configuration:

```rust
use spiceai::ClientBuilder;

#[tokio::main]
async fn main() {
    let client = ClientBuilder::new()
        .build()
        .await
        .unwrap();

    let data = client.query(
        "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10"
    ).await;
}
```

Or pass a custom flight address:

```rust
use spiceai::ClientBuilder;

#[tokio::main]
async fn main() {
    let client = ClientBuilder::new()
        .flight_url("http://my_remote_spice_instance:50051")
        .build()
        .await
        .unwrap();

    let data = client.query(
        "SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10"
    ).await;
}
```

### Parameterized Queries

Use `query_with_params()` for parameterized queries to prevent SQL injection and improve performance (v3.0.0+):

```rust
use spiceai::ClientBuilder;
use arrow::array::{Float64Array, StringArray};
use arrow::record_batch::RecordBatch;
use std::sync::Arc;

#[tokio::main]
async fn main() {
    let client = ClientBuilder::new()
        .build()
        .await
        .unwrap();

    // Create parameters as a RecordBatch
    let min_price = Float64Array::from(vec![10.0]);
    let category = StringArray::from(vec!["electronics"]);

    let params = RecordBatch::try_from_iter(vec![
        ("1", Arc::new(min_price) as _),
        ("2", Arc::new(category) as _),
    ]).unwrap();

    let data = client.query_with_params(
        "SELECT * FROM products WHERE price > $1 AND category = $2",
        Some(params)
    ).await;
}
```

For more details, see [Parameterized Queries](../features/query-federation/parameterized-queries).
