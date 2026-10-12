---
title: 'Python SDK'
description: 'Connect to Spice using the Python SDK'
pagination_prev: null
pagination_next: null
tags:
  - sdk
  - python
---

## Python SDK for Spice.ai

[github.com/spiceai/spicepy](https://github.com/spiceai/spicepy)

:::note[Parameterized Queries]
Parameterized queries are supported with `sql_with_params()` or the `params=` argument of the `query_*` helpers. Install with `pip install "spicepy[params] @ git+https://github.com/spiceai/spicepy@v4.0.0"` for ADBC support. See [Parameterized Queries](../features/query-federation/parameterized-queries) and [ADBC](../api/adbc) for more information.
:::

### Install

Requires Python 3.11 or later and Git.

```shell
pip install git+https://github.com/spiceai/spicepy@v4.0.0
```

:::warning
`spicepy` is not published on PyPI. `pip install spicepy` installs an unrelated package; install from GitHub as shown above.
:::

### Connect to a local Spice Runtime

By default, the Python SDK will connect to a locally running Spice Runtime:

```python
from spicepy import Client

client = Client()

data = client.sql(
  'SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;',
  timeout=5*60
)
pd = data.read_pandas()
```

`client.sql()` returns a streaming Arrow Flight reader. For one-shot results, use `client.query_pandas()`, `query_arrow()`, `query_pylist()`, or `query_pydict()`. Since spicepy v4, `client.query()` submits an asynchronous query job and requires a runtime in distributed (scheduler) mode.

```python
pd = client.query_pandas('SELECT * FROM taxi_trips LIMIT 10')

# Parameterized query (requires spicepy[params])
pd = client.query_pandas('SELECT * FROM taxi_trips WHERE trip_distance > $1 LIMIT 10', params=[5.0])
```

### Connect to Spice Cloud

To connect to Spice Cloud, specify the required Flight and HTTP URLs to connect to Spice Cloud. `DEFAULT_FLIGHT_URL` and `DEFAULT_HTTP_URL` point at `us-east-1`. For another region, use `grpc+tls://<region>-prod-aws-flight.spiceai.io` and `https://<region>-prod-aws-data.spiceai.io`:

```python
from spicepy import Client
from spicepy.config import (
  DEFAULT_FLIGHT_URL,
  DEFAULT_HTTP_URL
)

client = Client(
  api_key="<YOUR SPICE CLOUD API KEY>",
  flight_url=DEFAULT_FLIGHT_URL,
  http_url=DEFAULT_HTTP_URL
)

data = client.sql(
  'SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;',
  timeout=5*60
)
pd = data.read_pandas()
```

### Connect to a remote Spice Runtime

By specifying a custom Flight and HTTP URL, the Python SDK can connect to a remote Spice Runtime - for example, a centralised Spice Runtime instance.

Example code:

```python
from spicepy import Client

client = Client(
  flight_url="grpc://your-remote-spice-runtime-host:50051",
  http_url="http://your-remote-spice-runtime-host:8090"
)

data = client.sql(
  'SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;',
  timeout=5*60
)
pd = data.read_pandas()
```

### Refresh an accelerated dataset

The SDK supports refreshing an accelerated dataset with the `Client.refresh_dataset()` method. Refresh a dataset by calling this method on an instance of an SDK client:

```python
from spicepy import Client, RefreshOpts

client = Client()

client.refresh_dataset("taxi_trips", None) # refresh with no refresh options
client.refresh_dataset("taxi_trips", RefreshOpts(refresh_sql="SELECT * FROM taxi_trips LIMIT 10")) # refresh with overridden refresh SQL

# RefreshOpts support all refresh parameters
RefreshOpts(
  refresh_sql="SELECT * FROM taxi_trips LIMIT 10",
  refresh_mode="full",
  refresh_jitter_max="1m"
)
```

## Cookbook

- A cookbook recipe to query Spice from Python with spicepy. [Spice with spicepy SDK](https://github.com/spiceai/cookbook/tree/trunk/client-sdk/spicepy-sdk-sample#readme)
