---
type: docs
title: "Manifest syntax for Spice.ai Pods"
linkTitle: "Pod specification"
weight: 60
description: "Detailed documentation on the Spice.ai Pod manifest syntax"
---

## About YAML syntax for pod manifests

Pod manifests use YAML syntax, and must end in a `.yaml` file extension. If you're new to YAML and want to learn more, see "[Learn YAML in Y minutes](https://learnxinyminutes.com/docs/yaml/)."

You must store pod manifest files in the `spicepods` directory of your application code. It is not required for the `spicepods` directory to be located at the root of your code repository.

## `name`

The name of your pod. Spice.ai uses the name of your pod when rendering the dashboard and as the key for the API requests. If you omit `name`, Spice.ai sets it to the name of the YAML file excluding the `.yaml` extension.

## `params`

An optional `map` of parameters that you can specify to tune how Spice.ai interacts with your pod. The following parameters are available:

| Parameter                                   | Default          |
| ------------------------------------------- | ---------------- |
| [epoch_time]({{<ref "#paramsepoch_time">}}) | Now - `period`   |
| [period]({{<ref "#paramsperiod">}})         | 3 days (3d)      |
| [interval]({{<ref "#interval">}})           | 1 minute (1m)    |
| [granularity]({{<ref "#granularity">}})     | 10 seconds (10s) |
| [episodes]({{<ref "#episodes">}})           | 10               |

**Example**

```yaml
params:
  epoch_time: 1605312000
  period: 3d
  interval: 1m
  granularity: 10s
  episodes: 10
```

## `params.epoch_time`

An epoch defines the beginning, or start, of the data stream. If Spice.ai receives data from before the epoch time, it is not used during training.

If `epoch` is omitted, it defaults to `now` - [`period`]({{<ref "#paramsperiod">}}).

`epoch_time` is an integer [timestamp]({{<ref "reference/timestamp">}}).

**Example**

```yaml
params:
  epoch_time: 1605312000
```

## `params.period`

A period is the total span of time that is considered for a pod. The end of the data stream that Spice.ai will look at is the `epoch` + `period`.

If `period` is omitted, it defaults to 3 days (`3d`).

`period` is a [duration literal]({{<ref "reference/duration">}}).

**Example**

```yaml
params:
  period: 3d
```

## `params.interval`

The interval is the time span that Spice.ai uses as a single input to the neural networks that power Spice.ai. Attempting to get a recommendation without Spice.ai having at least one intervals worth of data will result in an error.

If `interval` is omitted, it defaults to 1 minute (`1m`).

`interval` is a [duration literal]({{<ref "reference/duration">}}).

**Example**

```yaml
params:
  interval: 1m
```

## `params.granularity`

The granularity is the smallest unit of time that specifies how many timesteps there are in an interval. The `granularity` cannot be larger than the `interval`. When streaming data in a continuous manner, the Spice.ai runtime can give a new recommendation for action after each new granularity's worth of data is collected.

If `granularity` is omitted, it defaults to 10 seconds (`10s`).

`granularity` is a [duration literal]({{<ref "reference/duration">}}). The smallest granularity Spice.ai supports is 1 second (`1s`).

**Example**

```yaml
params:
  granularity: 10s
```

## `params.episodes`

An episode is a sequence of simulated actions the Spice.ai pod will take over the dataset during training. After an episode has completed in a training run, the neural networks powering Spice.ai will update giving it a chance to learn from its experience. The more episodes specified, the more chances the Spice.ai pod will be able to learn how to maximize its rewards, at the expense of a longer training run. More episodes is not always better, as there is a risk the Spice.ai pod will "[overfit](https://en.wikipedia.org/wiki/Overfitting)" to the data available in the training run.

If `episodes` is omitted, it defaults to 10.

`episodes` is a positive integer.

**Example**

```yaml
params:
  episodes: 10
```

## `dataspaces`

A pod must contain at least one [dataspace]({{<ref "concepts#dataspace">}}).

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
    fields:
      - name: close
    data:
      connector:
        name: file
        params:
          path: data/btcusd.csv
      processor:
        name: csv
  - from: local
    name: portfolio
    fields:
      - name: usd_balance
        initializer: 0
      - name: btc_balance
        initializer: 0
    actions:
      small_buy: |
        usd_balance -= args.price
        btc_balance += 1
      large_buy: |
        usd_balance -= args.price
        btc_balance += 10
      sell: |
        usd_balance += args.price 
        btc_balance -= 1
    laws:
      - usd_balance >= 0
      - btc_balance >= 0
```

## `dataspaces[*].from`

**Required**. A label used to indicate where the data is from.

**Example**

```yaml
dataspaces:
  - from: coinbase
```

## `dataspaces[*].name`

**Required**. The name to use for this datasource.

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
```

## `dataspaces[*].fields`

**Required**. The fields to create in the dataspace. If these fields are not populated by either a data connector or through the API, they will use the default value of `0.0`. Each field must be a `float`.

## `dataspaces[*].fields[*].name`

**Required**. The name of the field to create.

**Example**

```yaml
fields:
  - name: balance
```

## `dataspaces[*].fields[*].initializer`

May be used to specify an initial value for the field.

`initializer` is a `float`.

**Example**

```yaml
fields:
  - name: balance
    initializer: 10.0
```

## `dataspaces[*].data`

Used to specify the external data source (configured with `connector` and `processor`) to use to populate the dataspace.

If this section is omitted, the data should be provided through the [observations API]({{<ref api>}}).

```yaml
data:
  connector:
    name: file
    params:
      path: data.csv
```

## `dataspaces[*].data.connector`

The connector used to fetch data from an external data source. The connector code should exist in the [data-components-contrib](https://github.com/spiceai/data-components-contrib/tree/trunk/dataconnectors) repository.

## `dataspaces[*].data.connector.name`

The name of the connector to use.

The following connectors are currently supported:

| Connector Name                                                                                                |
| ------------------------------------------------------------------------------------------------------------- |
| [file](https://github.com/spiceai/data-components-contrib/blob/trunk/dataconnectors/file/file.go)             |
| [influxdb](https://github.com/spiceai/data-components-contrib/blob/trunk/dataconnectors/influxdb/influxdb.go) |

## `dataspaces[*].data.connector.params`

A `map` of key-value pairs that are used to control the behavior of the connector.

**Example**
The `file` connector uses the `path` param to control which file to load.

```yaml
data:
  connector:
    name: file
    params:
      path: data.csv
```

## `dataspaces[*].data.processor`

Once the data has been fetched with the connector, it needs to be processed into a format that Spice.ai can understand. Processing logic has been de-coupled from the connector to allow for flexibility [TODO]
