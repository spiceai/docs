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
- `--set <PATH=VALUE>` Set any schema field by dotted path, e.g. `--set acceleration.enabled=true`. Repeatable. The value is typed by the field's type in the Spicepod schema, as described in [Typed `--set` values](#typed---set-values).
- `--depends-on <NAME>` Append an entry to `dependsOn:`. Repeatable.
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
>>> spice dataset configure taxi_trips --set acceleration.enabled=true
```

### Typed `--set` values

`--set` reads the Spicepod schema to decide how to write a value:

- A boolean, integer, or number field takes the YAML scalar: `--set acceleration.enabled=true` writes `enabled: true`.
- An object or array field takes YAML or JSON, such as `--set 'acceleration.indexes={id: unique}'`.
- A nullable field takes `null` or `~`.
- A string field keeps the text as written, so `--set acceleration.refresh_append_overlap=5` writes the string `"5"`.
- A field the schema does not describe, such as an entry in a free-form map, is read as a YAML scalar. A number that would not read back the same way, such as `1.10` or `007`, stays a string.

Quote the value (`--set 'description="true"'`) or prefix it with `string:` to force a string, and prefix it with `yaml:` to force YAML.

Before it writes, the CLI checks the fields that `--set` changed. A value of the wrong type for its field, or a field the schema does not have, is refused with the field's path, and the manifest is left unchanged:

```shell
>>> spice dataset configure taxi_trips --set acceleration.enabled=string:true
ERROR Invalid argument: datasets[0].acceleration.enabled: Invalid type string "true". Expected a boolean. Nothing was written; set a value of the type the field expects.
```

Datasets have no top-level `enabled` field, so `--enable` and `--disable` are refused for datasets:

```shell
>>> spice dataset configure taxi_trips --enable
ERROR Invalid argument: dataset entries have no `enabled` field, so --enable/--disable would write a Spicepod that does not load. To toggle acceleration, use `--set acceleration.enabled=true` (or `=false`).
```

In Spice v2.4.3 and earlier, `--set` wrote values as strings unless prefixed with `yaml:`, so `--set acceleration.enabled=true` wrote `enabled: "true"`, which `spice validate` and `spiced` reject.

### Interactive example

When running `spice dataset configure` with no name and no body flags, Spice will prompt for four inputs:

1.  The name of the dataset, labelled by `(1)` below.
2.  The description of the dataset, labelled by `(2)` below.
3.  The source of the dataset, labelled by `(3)` below. Consult [Spice's supported data connectors](../../components/data-connectors) to see possible values for this field. Note: Spice may prompt for a file format if necessary, as shown in the example below. When the source reads from a Spice Cloud app, such as `spice.ai/<org>/<app>/datasets/<dataset>`, Spice prompts for `spiceai_region` (default `us-east-1`) and writes it to the dataset's `params`. A region that is not lowercase letters, digits, and hyphens fails the command with `Invalid Spice Cloud region`. A `spiceai:` source that points at a self-hosted runtime, such as `spiceai:http://localhost:50051`, is not prompted for a region. In v2.4.0-rc.2 and earlier, the CLI does not prompt for the region, so add `spiceai_region` to the dataset's `params` before running it.
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
