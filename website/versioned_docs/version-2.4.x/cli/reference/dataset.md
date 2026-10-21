---

title: "dataset"
sidebar_label: "dataset"
pagination_prev: null
pagination_next: null

---

Add or configure dataset entries in `spicepod.yaml`.

### Usage

```shell
spice dataset [command] [name] [flags]
```

Available `command`s:

- `add`: Add a new dataset entry. Fails if a dataset with that name already exists.
- `configure`: Add or update a dataset entry in place. Run with no name and no body flags to configure a dataset through interactive prompts instead.

**Note**: In order to run `spice dataset configure`, there _must_ be a `spicepod.yaml` file in the root of your project directory. To create this file, see [`spice init`](./init).

#### Flags

Both `add` and `configure` accept the same body flags, shared with the other Spicepod manifest editors (`spice model`, `spice catalog`, `spice view`, and so on):

- `--from <SOURCE>` Provider or URI for the dataset, e.g. `s3://bucket/key` or `databricks:catalog.schema.table`
- `--ref <PATH>` Add a dataset reference (`ref:`) instead of an inline definition
- `--description <TEXT>` Human-readable description
- `--param <KEY=VALUE>` Add a `params:` entry. Repeatable. Values are stored as strings unless prefixed with `yaml:` (parsed as typed YAML) or `string:` (stored as a literal string after the prefix).
- `--env <KEY=VALUE>` Add an `env:` entry. Repeatable. Values are always stored as strings — the `yaml:` and `string:` prefixes do not apply.
- `--set <PATH=VALUE>` Set any schema field by dotted path, e.g. `--set acceleration.enabled=yaml:true`. Repeatable, with the same value-prefix rules as `--param`.
- `--depends-on <NAME>` Append an entry to `dependsOn:`. Repeatable.
- `--enable` Set `enabled: true`
- `--disable` Set `enabled: false`
- `--file <PATH>` Read the dataset body from a YAML or JSON file
- `--stdin` Read the dataset body from stdin
- `--manifest <PATH>` Edit a non-default Spicepod file
- `-h`, `--help` Print this help message

### Examples

Add a Parquet dataset on S3:

```shell
>>> spice dataset add taxi_trips --from s3://my-bucket/trips.parquet --param file_format=parquet
```

Enable acceleration on an existing dataset:

```shell
>>> spice dataset configure taxi_trips --set acceleration.enabled=yaml:true
```

### Interactive example

When running `spice dataset configure` with no name and no body flags, Spice will prompt for four inputs:

1.  The name of the dataset, labelled by `(1)` below.
2.  The description of the dataset, labelled by `(2)` below.
3.  The source of the dataset, labelled by `(3)` below. Consult [Spice's supported data connectors](../../components/data-connectors) to see possible values for this field. Note: Spice may prompt for a file format if necessary, as shown in the example below.
4.  Whether or not to enable acceleration for this dataset, labelled by `(4)`. The default value for this input is `y`, enabling acceleration for this dataset. Learn more about acceleration in the [dataset acceleration reference](../../components/data-accelerators).

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
  enabled: true
```

The command additionally updates the root `spicepod.yaml` file to include the configured dataset as a reference (`ref`). For this example, `spicepod.yaml` would include the following:

```yaml
version: v1
kind: Spicepod
name: Taxi Trips with Spice
datasets:
  - ref: datasets/taxi-trips
```

To learn more about Spice datasets and Spicepods, visit the [Spice dataset reference](../../reference/spicepod/datasets) and [Spicepod reference](../../reference/spicepod).
