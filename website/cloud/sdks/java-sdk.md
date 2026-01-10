

# Java SDK

The [`Java SDK`](https://github.com/spiceai/spice-java) is the easiest way to query the Spice Cloud Platform from Java.

It uses [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) to efficiently stream data to the client and [Apache Arrow](https://arrow.apache.org/) Records as data frames.

### Supported Java Versions

This library supports the following Java implementations:

* OpenJDK 11
* OpenJDK 17
* OpenJDK 21
* OracleJDK 11
* OracleJDK 17
* OracleJDK 21
* OracleJDK 22

### Installation


<Tabs>
<TabItem value="maven" label="Maven">

```xml
<dependency>
    <groupId>ai.spice</groupId>
    <artifactId>spiceai</artifactId>
    <version>0.3.0</version>
    <scope>compile</scope>
</dependency>
```

</TabItem>
<TabItem value="gradle" label="Gradle">

```groovy
implementation 'ai.spice:spiceai:0.3.0'
```

</TabItem>
</Tabs>

### Usage

1\. Import the package.

```java
import ai.spice.SpiceClient;
```

2\. Create a `SpiceClient` by providing your API key. Get your free API key at [spice.ai](https://spice.ai/).

```java
SpiceClient spice = SpiceClient.builder()
    .withApiKey(ApiKey)
    .withSpiceCloud()
    .build()
```

3\. Execute a query and get back a [`FlightStream`](https://arrow.apache.org/docs/java/reference/org.apache.arrow.flight.core/org/apache/arrow/flight/FlightStream.html).

```java
FlightStream stream = spice.query("SELECT * FROM tpch.lineitem LIMIT 10");
```

5\. Iterate through the `FlightStream` to access the records.

```java
while (stream.next()) {
    try (VectorSchemaRoot batches = stream.getRoot()) {
        System.out.println(batches.contentToTSVString());
    }
}
```

Check [full example](https://github.com/spiceai/spice-java/blob/trunk/src/main/java/ai/spice/example/ExampleSpiceCloudPlatform.java) to learn more.

### Usage with local Spice.ai OSS runtime

Follow the [quickstart guide](https://github.com/spiceai/spiceai?tab=readme-ov-file#%EF%B8%8F-quickstart-local-machine) to install and run spice locally.

```java
SpiceClient spice = SpiceClient.builder()
    .build();

```

Or using custom flight address:

```go
SpiceClient spice = SpiceClient.builder()
    .withFlightAddress(new URI("grpc://my_remote_spice_instance:50051"))
    .build();
```

Check [Spice OSS documentation](https://docs.spiceai.org/sdks/java) or [Java SDK Sample](https://github.com/spiceai/samples/tree/trunk/client-sdk/spice-java-sdk-sample) to learn more

### Connection retry

The `SpiceClient` implements connection retry mechanism (3 attempts by default). The number of attempts can be configured with `withMaxRetries`:

```java
SpiceClient client = SpiceClient.builder()
    .withMaxRetries(5) // Setting to 0 will disable retries
    .build();
```

Retries are performed for connection and system internal errors. It is the SDK user's responsibility to properly handle other errors, for example `RESOURCE_EXHAUSTED (HTTP 429)`.

### Contributing

Contribute to or file an issue with the `spice-rs` library at: [https://github.com/spiceai/spice-java](https://github.com/spiceai/spice-java)
