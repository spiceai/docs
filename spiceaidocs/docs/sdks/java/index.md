---
title: "Java SDK"
description: "Connect to Spice using Spice Java SDK"
pagination_prev: null
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Java SDK for Spice.ai

https://github.com/spiceai/spice-java

### Installation

<Tabs>
  <TabItem value="maven" label="Maven" default>
    Add the following dependency:
    ```xml
    <dependency>
        <groupId>ai.spice</groupId>
        <artifactId>spiceai</artifactId>
        <version>0.1.0</version>
        <scope>compile</scope>
    </dependency>
    ```
  </TabItem>
  <TabItem value="gradle" label="Gradle">
    Add the following dependency:
    ```groovy
    implementation 'ai.spice:spiceai:0.1.0'
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