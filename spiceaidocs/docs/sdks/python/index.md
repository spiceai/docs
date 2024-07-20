---
title: 'Python SDK'
description: 'Connect to spice using spice python SDK'
pagination_prev: null
pagination_next: null
---

## Python SDK for Spice.ai

https://github.com/spiceai/spicepy

### Install

```shell
pip install git+https://github.com/spiceai/spicepy@v2.0.0
```

### Connect to spice runtime

```python
from spicepy import Client

client = Client()

data = client.query(
  'SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;',
  timeout=5*60
)
pd = data.read_pandas()
```

Or pass custom flight address:

```python
from spicepy import Client

client = Client(
  flight_url="grpc://my_remote_spice_instance:50090"
)

data = client.query(
  'SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;',
  timeout=5*60
)
pd = data.read_pandas()
```