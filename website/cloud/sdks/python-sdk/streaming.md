# Streaming

The `spicepy` SDK supports streaming partial results as they become available.

This can be used to enable more efficient pipelining scenarios where processing each row of the result set can happen independently.

 `spicepy` enables streaming through the use of the [pyarrow Flight API](https://arrow.apache.org/docs/dev/python/api/flight.html).

The object returned from `spicepy.Client.query()` is a [`pyarrow.flight.FlightStreamReader`](https://arrow.apache.org/docs/dev/python/generated/pyarrow.flight.FlightStreamReader.html#pyarrow.flight.FlightStreamReader).

```python
>>> from spicepy import Client
>>> import os
>>> client = Client(os.environ["API_KEY"])
>>> rdr = client.query("SELECT * FROM eth.recent_blocks")
<pyarrow._flight.FlightStreamReader object at 0x1059c9980>
```

Calling `to_pandas()` on the `FlightStreamReader` will wait for the stream to return all of the data before returning a pandas DataFrame.

To operate on partial results while the data is streaming, we will take advantage of the [`read_chunk()`](https://arrow.apache.org/docs/dev/python/generated/pyarrow.flight.FlightStreamReader.html#pyarrow.flight.FlightStreamReader.read_chunk) method on `FlightStreamReader`. This returns a `FlightStreamChunk`, which has a `data` attribute that is a [`RecordBatch`](https://arrow.apache.org/docs/dev/python/generated/pyarrow.RecordBatch.html#pyarrow.RecordBatch). Once we have the RecordBatch, we can call `to_pandas()` on it to return the partial data as a pandas DataFrame. When the stream has ended, calling `read_chunk()` will raise a `StopIteration` exception that we can catch.

In this example, we retrieve all 10,000 suppliers from the TPCH Suppliers table. This query retrieves all suppliers in a single call:

```python
from spicepy import Client

client = Client(os.environ["API_KEY"])
query = """
    SELECT s_suppkey, s_name
    FROM tpch.supplier
"""

reader = client.query(query)
suppliers = reader.read_pandas()
```

This call will return a pandas [`DataFrame`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html) with all 10,000 suppliers, and is a synchronous call that waits for all data to arrive before returning.

Alternatively, to process chunks of data as they arrive instead of waiting for all data to arrive, `FlightStreamReader` supports reading chunks of data as they become available with `read_chunk()`. Using the same query example above, but processing data chunk by chunk:

```python
reader = client.query(query)

has_more = True
while has_more:
    try:
        flight_batch = reader.read_chunk()
        record_batch = flight_batch.data
        processChunk(record_batch.to_pandas())
    except StopIteration:
        has_more = False
```
