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

 **Note**: In order to run `spice dataset configure`, there *must* be a `spicepod.yaml` file in the root of your project directory. To create this file, see [`spice init`](/cli/reference/init).

 #### Flags

 - `-h`, `--help` Print this help message

 ### Example

 When running `spice dataset configure`, Spice will prompt for four inputs:
 1. The name of the dataset, labelled by `(1)` below.
 2. The description of the dataset, labelled by `(2)` below.
 3. The source of the dataset, labelled by `(3)` below. Consult [Spice's supported data connectors](/components/data-connectors) to see possible values for this field. 
 4. Whether or not to enable acceleration for this dataset, labelled by `(4)`. The default value for this input is `y`, enabling acceleration for this dataset. Learn more about acceleration in the [dataset acceleration reference](/components/data-accelerators).

 ```shell
> spice dataset configure

 2024/12/18 01:06:32 INFO dataset name: sample-project
 taxi-trips # (1)
 2024/12/18 01:06:59 WARN Dataset names with hyphens should be quoted in queries:
 i.e. SELECT * FROM "remote-source"
 description: Taxi trips in s3 # (2)
 from: s3://spiceai-demo-datasets/taxi_trips/2024/  # (3)
 2024/12/18 01:075 INFO locally accelerate (y/n)? (y)
 n # (4)
 2024/12/18 01:07:32 INFO Saved datasets/remote-source/dataset.yaml
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

The `dataset.yaml` file in `./datasets/taxi-trips` is configured as defined by the inputs provided to `spice dataset configure`. For this example, the `datatset.yaml` file looks as follows:

```yaml
from: s3://spiceai-demo-datasets/taxi_trips/2024/
name: taxi-trips
description: Taxi trips in s3
acceleration:
    enabled: false
```

The command additionally updates the root `spicepod.yaml` file to include the configured dataset as a reference (`ref`). For this example, `spicepod.yaml` would include the following:
```yaml
version: v1
kind: Spicepod
name: Taxi Trips with Spice
datasets:
    - ref: datasets/taxi-trips
```

To learn more about Spice datasets and Spicepods, visit the [Spice dataset reference](/reference/spicepod/datasets) and [Spicepod reference](/reference/spicepod).