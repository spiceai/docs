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
| [period]({{<ref "#paramsperiod">}})         | 72 hours (72h)   |
| [interval]({{<ref "#interval">}})           | 1 minute (1m)    |
| [granularity]({{<ref "#granularity">}})     | 10 seconds (10s) |
| [episodes]({{<ref "#episodes">}})           | 10               |

**Example**

```yaml
params:
  epoch_time: 1605312000
  period: 72h
  interval: 1m
  granularity: 10s
  episodes: 10
```

### `params.epoch_time`

An epoch defines the beginning, or start, of the data stream. If Spice.ai receives data from before the epoch time, it is not used during training.

If `epoch` is omitted, it defaults to `now` - [`period`]({{<ref "#paramsperiod">}}).

`epoch_time` is an integer [timestamp]({{<ref "reference/timestamp">}}).

**Example**

```yaml
params:
  epoch_time: 1605312000
```

### `params.period`

A period is the total span of time that is considered for a pod. The end of the data stream that Spice.ai will look at is the `epoch` + `period`.

If `period` is omitted, it defaults to 72 hours (`72h`).

`period` is a [duration literal]({{<ref "reference/duration">}}).

**Example**

```yaml
params:
  period: 72h
```

### `params.interval`

The interval is the time span that Spice.ai uses as a single input to the neural networks that power Spice.ai. Attempting to get a recommendation without Spice.ai having at least one intervals worth of data will result in an error.

If `interval` is omitted, it defaults to 1 minute (`1m`).

`interval` is a [duration literal]({{<ref "reference/duration">}}).

**Example**

```yaml
params:
  interval: 1m
```

### `params.granularity`

The granularity is the smallest unit of time that specifies how many timesteps there are in an interval. The `granularity` cannot be larger than the `interval`. When streaming data in a continuous manner, the Spice.ai runtime can give a new recommendation for action after each new granularity's worth of data is collected.

If `granularity` is omitted, it defaults to 10 seconds (`10s`).

`granularity` is a [duration literal]({{<ref "reference/duration">}}). The smallest granularity Spice.ai supports is 1 second (`1s`).

**Example**

```yaml
params:
  granularity: 10s
```

### `params.episodes`

An episode is a sequence of simulated actions the Spice.ai pod will take over the dataset during training. After an episode has completed in a training run, the neural networks powering Spice.ai will update giving it a chance to learn from its experience. The more episodes specified, the more chances the Spice.ai pod will be able to learn how to maximize its rewards, at the expense of a longer training run. More episodes is not always better, as there is a risk the Spice.ai pod will "[overfit](https://en.wikipedia.org/wiki/Overfitting)" to the data available in the training run.

If `episodes` is omitted, it defaults to 10.

`episodes` is a positive integer.

**Example**

```yaml
params:
  episodes: 10
```

## `time`

Pod time, time-series and time-data related configuration is defined in the `time` section.

### `time.categories`

A list of time categories, such as `month` or `weekday` enabling the automatic creation of fields from the observation `time`. For example, by specifiying `month` the Spice.ai engine automatically creates a field in the data called `time_month_<month>` with a value calculated from the month of which that timestamp relates. This enables learning from cyclical patterns, such as monthly or daily cycles.

**_Example_**

```yaml
time:
  categories:
    - month
    - dayofweek
```

Supported category values are:

`month`
`dayofmonth`
`dayofweek`
`hour`

## `dataspaces`

A pod must contain at least one [dataspace]({{<ref "concepts#dataspace">}}).

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
    measurements:
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
    measurements:
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

### `dataspaces[*].from`

**Required**. A label used to indicate where the data is from.

**Example**

```yaml
dataspaces:
  - from: coinbase
```

### `dataspaces[*].name`

**Required**. The name to use for this datasource.

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
```

### `dataspaces[*].identifiers`

Defines the dataspace identifiers.

An identifier is a string that correlates a unique set of data. Examples are transaction ids, order ids, or correlation ids.

Identifiers may be ingested, visualized, and fetched through observation APIs, however are not yet made available to the AI engine for learning. If you have feedback on how you'd like to incorporate them, please let us know.

### `dataspaces[*].identifiers[*].name`

**Required**. The name of the identifier.

**Example**

```yaml
identifiers:
  - name: transaction_id
```

### `dataspaces[*].identifiers[*].selector`

Defines the field selector that maps a data field to the identifier name. Defaults to the identifier name if not provided.

**Example**

In the source data:

```csv
time,my_balance,my_transaction_id
100,10,1A3
200,20,1A4
```

Selects the `my_transaction_id` data field mapped to the `transaction_id` identifier.

```yaml
identifiers:
  - name: transaction_id
    selector: my_transaction_id
```

### `dataspaces[*].measurements`

Defines the dataspace measurements.

### `dataspaces[*].measurements[*].name`

**Required**. The name of the field to create.

**Example**

```yaml
measurements:
  - name: balance
```

### `dataspaces[*].measurements[*].initializer`

May be used to specify an initial value for the field.

`initializer` is a `float`.

**Example**

```yaml
measurements:
  - name: balance
    initializer: 10.0
```

### `dataspaces[*].measurements[*].selector`

Defines the field selector that maps a data field to the measurement name. Defaults to the measurement name if not provided.

**Example**

In the source data:

```csv
time,my_balance
100,10
200,20
```

This would "select" the `my_balance` column and place it into `balance` to be used by Spice.ai

```yaml
measurements:
  - name: balance
    selector: my_balance
```

### `dataspaces[*].measurements[*].fill`

Used to specify how to treat missing data. Possible values are `previous` or `none`. The default value is `previous`.

`previous` will take the last data point and "fill" it in. `none` will fill in the data with 0.

**Example**

In the source data:

```csv
time,balance
100,10
125,
150,15
175,
200,20
```

The following manifest:

```yaml
measurements:
  - name: balance
    fill: previous
```

would produce this data to the AI Engine:

```csv
time,balance
100,10
125,10
150,15
175,15
200,20
```

### `dataspaces[*].categories`

Process categorical data. Categorical data is a group or collection of discrete strings.

Some examples of categorical data include: colors, star ratings, brands, programming languages, age group, hair color, grades, etc.

Define categorical collections in the Spicepod manifest by the `categories` node. Specify each category with a `name` and a list of discrete `values.`

**Example**

```yaml
dataspaces:
  - from: rainbow
    name: attributes
    categories:
      - name: color
        values:
          - red
          - orange
          - yellow
          - green
          - blue
          - indigo
          - violet
```

### `dataspaces[*].categories[*].name`

Both the category name and the dataspace observation field name.

### `dataspaces[*].categories[*].selector`

Selects the source data field mapped to the data space field. Defaults to `name` if not provided.

**Example**

In the source data:

```csv
time,color_rainbow
100,red
200,blue
```

The data field `color_rainbow` is selected as the mapped source data for the data space observation field `color.`

```yaml
categories:
  - name: color
    selector: color_rainbow
```

### `dataspaces[*].categories[*].values`

Specifies the list of discrete category `name` values.

Unspecified values in source data are ignored and are not included in the dataspace observations.

### `dataspaces[*].tags`

Specifies the list of tag selectors and values.

The list of selectors is optional.

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
    tags:
      values:
        - buy
        - sell
```

### `dataspaces[*].tags.selectors`

Specifies the list of fields that should populate tags. The `_tags` field is always included by default.

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
    tags:
      selectors:
        - is_last
      values:
        - buy
        - sell
```

### `dataspaces[*].tags.values`

The list of possible tag values. Each item is a string value. Unspecified tags in source data are ignored and are not included in the dataspace observations.

Tag values are aggregated to a unique tag value list at the pod scope.

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
    tags:
      values:
        - buy
        - sell
```

### `dataspaces[*].tags.selectors`

Specifies the list of source data fields to include in the tags collection. The `_tags` field is always included by default.

**Example**

```yaml
dataspaces:
  - from: coinbase
    name: btcusd
    tags:
      selectors:
        - is_last
      values:
        - buy
        - sell
```

### `dataspaces[*].tags.values`

The list of possible tag values. Tag values are aggregated to a unique tag value list at the pod scope.

### `dataspaces[*].data`

Defines the data `connector` and data `processor` for the dataspace.

If this section is omitted, the data should be provided through the [observations API]({{<ref api>}}).

```yaml
data:
  connector:
    name: file
    params:
      path: data.csv
```

### `dataspaces[*].data.connector`

The connector used to fetch data from an external data source. The connector code should exist in the [data-components-contrib](https://github.com/spiceai/data-components-contrib/tree/trunk/dataconnectors) repository.

### `dataspaces[*].data.connector.name`

The name of the connector to use.

The following connectors are currently supported:

| Connector Name                                                                                                |
| ------------------------------------------------------------------------------------------------------------- |
| [file](https://github.com/spiceai/data-components-contrib/blob/trunk/dataconnectors/file/file.go)             |
| [influxdb](https://github.com/spiceai/data-components-contrib/blob/trunk/dataconnectors/influxdb/influxdb.go) |
| [twitter](https://github.com/spiceai/data-components-contrib/blob/trunk/dataconnectors/twitter/twitter.go)    |

### `dataspaces[*].data.connector.params`

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

### `dataspaces[*].data.processor`

Once the data has been fetched with the connector, it needs to be processed into a format that Spice.ai can understand. The processor specified here will take the raw data from the connector and transform it into the observations that the Spice.ai runtime expects.

**Example**
The `csv` processor will process the data coming from the `file` connector.

```yaml
data:
  connector:
    name: file
    params:
      path: data.csv
  processor:
    name: csv
```

### `dataspaces[*].data.processor.name`

The name of the processor to use.

The following processors are currently supported:

| Processor Name                                                                                           |
| -------------------------------------------------------------------------------------------------------- |
| [csv](https://github.com/spiceai/data-components-contrib/blob/trunk/dataprocessors/csv/csv.go)           |
| [flux-csv](https://github.com/spiceai/data-components-contrib/blob/trunk/dataprocessors/flux/fluxcsv.go) |
| [json](https://github.com/spiceai/data-components-contrib/blob/trunk/dataprocessors/json/README.md)      |

### `dataspaces[*].data.processor.params`

A `map` of key-value pairs that are used to control the behavior of the processor.

Where `time` is not native to the data-stream, specific data processors, including the JSON and CSV data processors, support selecting a custom field to populate time with the `time_selector` parameter.

**Time selector example**

```yaml
data:
  processor:
    name: json
    param:
      time_selector: created_at
```

### `dataspaces[*].seed_data`

Defines the seed data `connector` and `processor` for the dataspace.

Seed data is loaded before standard `data` and uses the same syntax as the `dataspaces[*].data` section.

This section is optional.

```yaml
seed_data:
  connector:
    name: file
    params:
      path: data.csv
```

### `dataspaces[*].actions`

A `map` of dataspace actions. The `key` is the name of the action to perform, the `value` is a python code block that will be executed whenever this action is taken during a training run.

This can be used to simulate effects of actions taken during a training run on the observation space. Arguments can be passed into this dataspace action and can be referenced within the python code by prefixing the argument with `args.`

**Example**

```yaml
dataspaces:
  - from: local
    name: portfolio
    measurements:
      - name: usd_balance
      - name: btc_balance
    actions:
      buy: |
        usd_balance -= args.price
        btc_balance += 1
```

### `dataspaces[*].laws`

A list of dataspace laws. Each item is a python expression that is evaluated during a training run to ensure that certain conditions aren't violated. If the Spice.ai runtime attempts to take an action that would violate a law, any dataspace actions that would have affected the observation space are not applied and a negative reward is applied to the timestep.

**Example**

In this example, if the `usd_balance` would go below 0, the dataspace action that would affect the `usd_balance` is not applied to the observation space.

```yaml
dataspaces:
  - from: local
  name: portfolio
  measurements:
    - name: usd_balance
    - name: btc_balance
  actions:
    buy: |
      usd_balance -= args.price
      btc_balance += 1
  laws:
    - usd_balance >= 0
    - btc_balance >= 0
```

## `actions`

**Required**. The set of actions that the Spice.ai runtime can choose from when giving recommendations.

**Example**

```yaml
actions:
  - name: jump
  - name: move_right
  - name: move_left
```

### `actions[*].name`

The name of the action that can be taken. The action name should not include any spaces.

### `actions[*].do`

An optional section that specifies which datasource action should be invoked whenever this action is selected during a training run.

**Example**

```yaml
actions:
  - name: buy
    do:
      name: local.portfolio.buy
      args:
        price: coinbase.btcusd.close
```

### `actions[*].do.name`

The fully-qualified name of the dataspace action to invoke. A fully qualified name takes the form of:

`dataspace.from`.`dataspace.name`.`dataspace.actions[*].name`

**Example**

A dataspace defined as:

```yaml
dataspaces:
  - from: local
    name: portfolio
    measurements:
      - name: btc_balance
    actions:
      buy: |
    btc_balance += 1
```

would have a fully-qualified action name of `local.portfolio.buy` and would be referenced as:

```yaml
actions:
  - name: buy
    do:
      name: local.portfolio.buy
```

### `actions[*].do.args`

A `map` of arguments to pass to the dataspace action. The `key` can be referenced by name in the defining dataspace action definition prefixed by `args.`. The `value` can be a constant or a fully qualified dataspace field.

A fully qualified dataspace field takes the form of:

`dataspace.from`.`dataspace.name`.`dataspace.field[*].name`

**Example**

A dataspace with the following definition:

```yaml
dataspaces:
  - from: game
    name: world
    measurements:
      - name: player_position
```

could be referenced in the `args` as `game.world.player_position`:

```yaml
actions:
  - name: pick_up_coin
    do:
      name: game.character.pick_up_coin
      args:
        position: game.world.player_position
```

and could be referenced in the dataspace action with `args.position`:

```yaml
dataspaces:
  - from: game
    name: character
    measurements:
      - name: coins
    actions:
      pick_up_coin: |
        if args.position > 10:
          game.character.coins += 1
```

## `training`

**Required**. Controls the training process for Spice.ai.

**Example**

```yaml
training:
  rewards:
    - reward: buy
      with: reward = 1
    - reward: sell
      with: reward = 1
    - reward: hold
      with: reward = 1
```

### `training.goal`

End the training early if Spice.ai reaches a training goal three times in a row.

After a single episode is completed from a training run, a `score` is kept of the cumulative rewards that the Spice.ai runtime received. Use the `goal` here to write a python expression to check if the training goal has been met.

**Example**

```yaml
training:
  goal: score >= 100
```

### `training.reward_init`

A python code block that will be run before an action specific reward code block runs. Use this to define common variables that will be useful to reference in the specific reward code blocks.

Access observation state variables by specifying their fully qualified names and prefixing with `current_state.` for the value at the previous state before the action was taken, and `next_state.` for the value of the state right after the action was taken.

**Example**

```yaml
training:
  reward_init: |
    # Compute price change between previous state and this one 
    # so it can be used in all three reward functions
    prev_price = current_state.coinbase.btcusd.close
    new_price = next_state.coinbase.btcusd.close
    change_in_price = new_price - prev_price
  rewards:
    - reward: buy
      with: reward = -change_in_price
    - reward: sell
      with: reward = change_in_price

    - reward: hold
      with: |
        if change_in_price > 0:
          reward = -0.1
        else:
          reward = 0.1
```

### `training.rewards`

**Required**. Defines how to reward the Spice.ai runtime during training so that it learns to take more intelligent actions.

This can be a list of reward definitions or the string "uniform" to indicate that all rewards should receive the same reward.

**Example**

```yaml
training:
  rewards: uniform
```

```yaml
training:
  rewards:
    - reward: buy
      with: reward = 1
    - reward: sell
      with: reward = 1
```

### `training.rewards[*].reward`

The name of the action to associate this reward function with. Should be the same name as an action defined in [actions](#actions)

```yaml
actions:
  - name: jump

training:
  rewards:
    - reward: jump
      with: reward = 1
```

### `training.rewards[*].with`

A python code block that needs to assign a variable to `reward` to specify which reward to give the Spice.ai agent for taking this action.

Access observation state variables by specifying their fully qualified names and prefixing with `current_state.` for the value at the previous state before the action was taken, and `next_state.` for the value of the state right after the action was taken.

```yaml
training:
  rewards:
    - reward: jump
      with: |
        # If we weren't able to jump, penalize trying to jump
        if next_state.game.character.height > current_state.game.character.height:
          reward = 1
        else:
          reward = -1
```
