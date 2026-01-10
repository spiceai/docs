---
description: Rust SDK for Spice.ai
---

# Rust SDK

The [Rust SDK](https://github.com/spiceai/spice-rs) `spice-rs` is the easiest way to query [Spice.ai](https://spice.ai) from Rust.

It uses [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) to efficiently stream data to the client and [Apache Arrow](https://arrow.apache.org/) Records as data frames.

### Requirements

* [Rust 1.77.0](https://blog.rust-lang.org/2024/03/21/Rust-1.77.0.html)

### Installation

Add Spice SDK

```bash
cargo add spiceai
```

### Usage

1\. Create a `SpiceClient` by providing your API key to `ClientBuilder`. Get your free API key at [spice.ai](https://spice.ai/).

```rust
use spiceai::ClientBuilder;

#[tokio::main]
async fn main() {
  let client = ClientBuilder::new()
    .api_key("API_KEY")
    .use_spiceai_cloud()
    .build()
    .await
    .unwrap();
}
```

2\. Execute a query and get back an Apache Arrow [Flight Record Batch Stream](https://arrow.apache.org/rust/arrow_flight/decode/struct.FlightRecordBatchStream.html).

```rust
let flight_data_stream = client.query("SELECT * FROM tpch.lineitem LIMIT 10;").await.expect("Error executing query");
```

3\. Iterate through the reader to access the records.

```rust
while let Some(batch) = flight_data_stream.next().await {
    match batch {
        Ok(batch) => {
            /* process batch */
            println!("{:?}", batch)
        },
        Err(e) => {
            /* handle error */
        },
    };
}
```

### Usage with local Spice runtime

Follow the [quickstart guide](https://github.com/spiceai/spiceai?tab=readme-ov-file#%EF%B8%8F-quickstart-local-machine) to install and run spice locally.

```rust
use spiceai::ClientBuilder;

#[tokio::main]
async fn main() {
  let client = ClientBuilder::new()
    .build()
    .await
    .unwrap();

  let data = client.query("SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;").await;
}
```

### Contributing

Contribute to or file an issue with the `spice-rs` library at: [https://github.com/spiceai/spice-rs](https://github.com/spiceai/spice-rs)
