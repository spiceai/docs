

# Python SDK

The [Python SDK](https://github.com/spiceai/spicepy) `spicepy` is the easiest way to use and query [Spice.ai](https://spice.ai) in Python.

The Python SDK uses [Apache Apache Flight](https://arrow.apache.org/docs/format/Flight.html) to efficiently stream data to the client and [Apache Arrow](https://arrow.apache.org/) Records as data frames which are then easily converted to Pandas data frames.

### Requirements

* Python 3.11+

The following packages are required and will be automatically installed by pip:

* `pyarrow`
* `pandas`
* `certify`
* `requests`

<details>

<summary>Apple M1 Mac Requirements - <a href="https://support.apple.com/en-us/HT211814">How do I know if I have an M1?</a></summary>

Apple M1 Macs require an arm64 compatible version of `pyarrow` which can be installed using [miniforge](https://github.com/conda-forge/miniforge). We recommend the following procedure:

* Install [Homebrew](https://brew.sh)
* Install [miniforge](https://github.com/conda-forge/miniforge) with:

```
brew install --cask miniforge
```

* Initialize conda in your terminal with:

```
conda init "$(basename "${SHELL}")"
```

* Install `pyarrow` and `pandas` with:

```
conda install pyarrow pandas
```

While [Anaconda](https://www.anaconda.com/) can be used to install pyarrow, the installed version is old (4.0.0) so we recommend using the [miniforge](https://github.com/conda-forge/miniforge) distribution.

</details>

### Installation

Install the `spicepy` package directly from the Spice Github Repository at [https://github.com/spiceai/spicepy](https://github.com/spiceai/spicepy):

```
pip install git+https://github.com/spiceai/spicepy@v2.0.0
```

### Usage

Import `spicepy` and create a `Client` by providing your API Key.

You can then submit queries using the query function.

```python
from spicepy import Client

client = Client('API_KEY')
data = client.query('SELECT * FROM eth.recent_blocks LIMIT 10;', timeout=5*60)
pd = data.read_pandas()
```

Querying data is done through a `Client` object that initializes the connection with the Spice.ai endpoint. `Client` has the following arguments:

* **api\_key** (string, optional): Spice.ai API key to authenticate with the endpoint.
* **url** (string, optional): URL of the endpoint to use (default: grpc+tls://flight.spiceai.io)
* **tls\_root\_cert** (Path or string, optional): Path to the tls certificate to use for the secure connection (ommit for automatic detection)

Once a `Client` is obtained queries can be made using the `query()` function. The `query()` function has the following arguments:

* **query** (string, required): The SQL query.
* **timeout** (int, optional): The timeout in seconds.

A custom timeout can be set by passing the `timeout` parameter in the `query` function call. If no timeout is specified, it will default to a 10 min timeout then cancel the query, and a TimeoutError exception will be raised.

### Usage with local Spice runtime

Follow the [quickstart guide](https://github.com/spiceai/spiceai?tab=readme-ov-file#%EF%B8%8F-quickstart-local-machine) to install and run spice locally.

```python
from spicepy import Client

client = Client()
data = client.query('SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;', timeout=5*60)
pd = data.read_pandas()
```

### Contributing

Contribute to or file an issue with the `spicepy` library at: [https://github.com/spiceai/spicepy](https://github.com/spiceai/spicepy)
