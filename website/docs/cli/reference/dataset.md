---

title: "dataset"
sidebar_label: "dataset"
pagination_prev: null
pagination_next: null

---

Configure a Spice dataset.

### Usage

```shell
spice dataset [command]
```

Available `command`s:

- `configure`: Create/configure a dataset directly from the command-line, including customizing components such as whether to add acceleration to the connector.

**Note**: In order to run `spice dataset configure`, there _must_ be a `spicepod.yaml` file in the root of your project directory. To create this file, see [`spice init`](../cli/reference/init.md).

#### Flags

- `-h`, `--help` Print this help message

### Example

When running `spice dataset configure`, Spice will prompt for four inputs:

1.  The name of the dataset, labelled by `(1)` below.
2.  The description of the dataset, labelled by `(2)` below.
3.  The source of the dataset, labelled by `(3)` below. Consult [Spice's supported data connectors](../../components/data-connectors/index.md) to see possible values for this field. Note: Spice may prompt for a file format if necessary, as shown in the example below.
4.  Whether or not to enable acceleration for this dataset, labelled by `(4)`. The default value for this input is `y`, enabling acceleration for this dataset. Learn more about acceleration in the [dataset acceleration reference](../../components/data-accelerators/index.md).

```shell
> spice dataset configure

dataset name: (spiceai) taxi-trips # (1)
description: Taxi Trips in S3 # (2)
from: s3://spiceai-demo-datasets/taxi_trips/2024/ # (3)
file_format (parquet/csv) (parquet) parquet
locally accelerate (y/n)? (y) y # (4)
2025/01/10 14:07:46 INFO Saved datasets/test/dataset.yaml
```

After execution, the directory structure looks like this for the above example:

```
├── datasets
│   ├── taxi-trips
│       ├── dataset.yaml
├── spicepod.yaml
└── ...
```

The datasets folder includes the datasets for your project configured by using `spice dataset configure` or added manually.

The `dataset.yaml` file in `./datasets/taxi-trips` is configured as defined by the inputs provided to `spice dataset configure`. For this example, the `dataset.yaml` file looks as follows:

```yaml
from: s3://spiceai-demo-datasets/taxi_trips/2024/
name: taxi-trips
description: Taxi trips in s3
acceleration:
  - enabled: false
```

The command additionally updates the root `spicepod.yaml` file to include the configured dataset as a reference (`ref`). For this example, `spicepod.yaml` would include the following:

```yaml
version: v1
kind: Spicepod
name: Taxi Trips with Spice
datasets:
  - ref: datasets/taxi-trips
```

To learn more about Spice datasets and Spicepods, visit the [Spice dataset reference](../../reference/spicepod/datasets.md) and [Spicepod reference](../../reference/spicepod/index.md).
