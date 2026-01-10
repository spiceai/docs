---
description: SQL Query Apache Arrow Flight API
---

# Apache Arrow Flight API

SQL query results can be served via a high-performance [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) endpoint. Arrow Flight uses the [gRPC](https://grpc.io) protocol for efficient data transfer.

This setup enables high-speed access to your data in [Python](https://arrow.apache.org/docs/python/index.html), [Go](https://pkg.go.dev/github.com/apache/arrow/go/v8), [C++](https://arrow.apache.org/docs/cpp/index.html), [C#](https://github.com/apache/arrow/blob/master/csharp/README.md), [Rust](https://docs.rs/arrow-flight/latest/arrow_flight/), [Java](https://arrow.apache.org/docs/java/index.html), and [C#](https://github.com/apache/arrow/blob/main/csharp/README.md) and makes it easy to use libraries like [Pandas](https://arrow.apache.org/docs/python/pandas.html) and [NumPy](https://arrow.apache.org/docs/python/numpy.html?highlight=numpy).

### SDKs

It's recommended to use the Spice.ai SDKs to connect and query the Arrow Flight endpoint. SDKs are available for [Python](../../sdks/python-sdk/index.md), [Node.js](../../sdks/node.js-sdk/index.md), [Go](../../sdks/go.md), [Rust](../../sdks/rust-sdk/index.md), [Java](../../sdks/java-sdk.md), and [Dotnet](../../sdks/dotnet-sdk.md).

In Python, query results can be easily converted to Pandas or NumPy formats.

You may also use Apache's `pyarrow` library directly.

:::info
**Note on Apple Silicon Macs** - [How do I know if I have Apple Silicon?](https://support.apple.com/en-us/HT211814)

`The spicepy/pyarrow` installation requires [miniforge](https://github.com/conda-forge/miniforge).

See the [Python SDK page](../../sdks/python-sdk/index.md#m1-macs) for installation steps.
:::

### Connecting to the Endpoint

* Endpoint URL: `grpc+tls://flight.spiceai.io`
* Basic Authentication:
  * Username can be set to an empty string
  * Password should be set to the API key of your app

#### Requirements

* [Table](https://github.com/spicehq/cloud-docs/blob/trunk/api/sql-query-api/broken-reference/README.md) names must be fully-qualified. For example `spiceai.quickstart`

### Samples

Find code samples in Python in [Arrow Flight Samples](#).

### Troubleshooting

#### Mac/Windows Certificate issue

If you get this error:

`Could not get default pem root certs`

Install the [Let's Encrypt root certificates](https://letsencrypt.org/certificates/).

<details>

<summary>**Instructions for macOS**</summary>

First download the `roots.pem` file from the Let's Encrypt server:

```bash
curl -Lo isrgrootx1.pem https://letsencrypt.org/certs/isrgrootx1.pem 
```

Before running your code/jupyter notebook the environment variable `GRPC_DEFAULT_SSL_ROOTS_FILE_PATH` must be set to the pem file path. If you are using command from a terminal this can be done from the folder containing `isrgrootx1.pem` with:

```bash
export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$PWD/isrgrootx1.pem"
```

The `export` command will set this variable for this specific terminal and thus will need to be run every time you open a new terminal. Additionally you can add to your terminal profile.

Note that `$PWD` is a bash-specific variable that will be replaced by the current directory path. You can download the certificate file `isrgrootx1.pem` in a specific location and inform this path instead of `$PWD`.

</details>

<details>

<summary>Instructions for Windows</summary>

```powershell
@powershell -NoProfile -ExecutionPolicy unrestricted -Command ^
    (new-object System.Net.WebClient).Downloadfile( ^
        'https://letsencrypt.org/certs/isrgrootx1.pem', 'isrgrootx1.pem')
set GRPC_DEFAULT_SSL_ROOTS_FILE_PATH=%cd%\isrgrootx1.pem
```

</details>
