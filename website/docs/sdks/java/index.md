---
title: 'Java SDK'
description: 'Connect to Spice using the Java SDK'
pagination_prev: null
pagination_next: null
tags:
  - sdk
  - java
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Java SDK for Spice.ai

[github.com/spiceai/spice-java](https://github.com/spiceai/spice-java)

### Installation

<Tabs>
  <TabItem value="maven" label="Maven" default>
    Add the following dependency:
    ```xml
    <dependency>
        <groupId>ai.spice</groupId>
        <artifactId>spiceai</artifactId>
        <version>0.5.0</version>
        <scope>compile</scope>
    </dependency>
    ```
  </TabItem>
  <TabItem value="gradle" label="Gradle">
    Add the following dependency:
    ```groovy
    implementation 'ai.spice:spiceai:0.5.0'
    ```
  </TabItem>
</Tabs>

### Connect to Spice runtime

Create a `SpiceClient` using default configuration.
Requires local Spice OSS running: [follow the quickstart]( https://github.com/spiceai/spiceai?tab=readme-ov-file#%EF%B8%8F-quickstart-local-machine)

```java
import org.apache.arrow.flight.FlightStream;
import ai.spice.SpiceClient;

public class App 
{
    public static void main( String[] args )
    {
        try {
            SpiceClient client = SpiceClient.builder()
                    .build();

            FlightStream res = client.query("SELECT \"VendorID\", \"tpep_pickup_datetime\", \"fare_amount\" FROM taxi_trips LIMIT 10");

            while (res.next()) {
                System.out.println(res.getRoot().contentToTSVString());
            }
        } catch (Exception e) {
            System.err.println("An unexpected error occurred: " + e.getMessage());
        }
    }
}
```

Or pass custom flight address:

```java
SpiceClient client = SpiceClient.builder()
    .withFlightAddress(new URI("grpc://my_remote_spice_instance:50051"))
    .build();
```

### Connection retry

The `SpiceClient` implements connection retry mechanism (3 attempts by default).
The number of attempts can be configured with `withMaxRetries`:

```java
SpiceClient client = SpiceClient.builder()
    .withMaxRetries(5) // Setting to 0 will disable retries
    .build();

```

Retries are performed for connection and system internal errors. It is the SDK user's responsibility to properly
handle other errors, for example RESOURCE_EXHAUSTED (HTTP 429).

### Parameterized Queries

The SDK supports parameterized queries using ADBC (v0.5.0+). Use `queryWithParams()` for queries with user input to prevent SQL injection:

```java
import org.apache.arrow.vector.VectorSchemaRoot;
import org.apache.arrow.vector.ipc.ArrowReader;
import ai.spice.SpiceClient;

public class Example {
    public static void main(String[] args) {
        try (SpiceClient client = SpiceClient.builder().build()) {

            // Query with automatic type inference
            ArrowReader reader = client.queryWithParams(
                "SELECT * FROM taxi_trips WHERE trip_distance > $1 LIMIT 10",
                5.0); // Double is inferred as Float64

            while (reader.loadNextBatch()) {
                VectorSchemaRoot root = reader.getVectorSchemaRoot();
                System.out.println(root.contentToTSVString());
            }
            reader.close();

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

For explicit type control, use the `Param` class:

```java
import ai.spice.Param;

ArrowReader reader = client.queryWithParams(
    "SELECT * FROM orders WHERE order_id = $1 AND amount >= $2",
    Param.int64(12345),
    Param.decimal128(new BigDecimal("99.99"), 10, 2));
```

For more details, see [Parameterized Queries](../../features/query-federation/parameterized-queries.mdx).

### Memory Configuration

The `SpiceClient` uses an Arrow `RootAllocator` for managing off-heap memory. By default, it uses all available memory. You can configure the memory limit using megabytes:

```java
SpiceClient client = SpiceClient.builder()
    .withArrowMemoryLimitMB(1024) // 1GB limit
    .build();
```

### Spice.ai Runtime commands

#### Accelerated dataset refresh

Use `refresh` method to perform [Accelerated Dataset](../../components/data-accelerators/) refresh. See full [dataset refresh example](https://github.com/spiceai/spice-java/blob/release/0.4/src/main/java/ai/spice/example/ExampleDatasetRefreshSpiceOSS.java).

```java
SpiceClient client = SpiceClient.builder()
    ..
    .build();

client.refresh("taxi_trips")

```
