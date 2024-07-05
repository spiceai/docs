---
title: 'Machine Learning Predictions'
sidebar_label: 'Machine Learning Predictions'
description: ''
sidebar_position: 2
pagination_prev: 'machine-learning/model-deployment/index'
pagination_next: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### GET `/v1/models`

Returns all currently available models 

Parameters:
 - `format`: The return payload format `'json'` or `'csv'`. Default `'json'`. 


Response:
For each model, returns the spicepod component's `name`, `from` and `datasets`. For example
```json
[
  {
    "name": "rf_forecast",
    "from": "file://usr/me/model.onnx",
    "datasets": [
      "input_times"
    ]
  },
  {
    "name": "my_language_model",
    "from": "openai:gpt-3.5-turbo",
    "datasets": []
  }
]

```

## Machine Learning APIs
Spice includes dedicated predictions APIs.

### GET `/v1/models/:name/predict`

Make a prediction using a specific [deployed model](../model-deployment/index.md).

Example:

```shell
curl "http://localhost:3000/v1/models/my_model_name/predict"
```

Parameters:

- `name`: References the model name defined in the `spicepod.yaml`.

#### Response

<Tabs>
  <TabItem value="Success" label="Success" default>
    ```json
    {
        "status": "Success",
        "model_name": "my_model_name",
        "model_version": "1.0",
        "lookback": 30,
        "prediction": [0.45, 0.50, 0.55],
        "duration_ms": 123
    }
    ```
  </TabItem>
  <TabItem value="Bad Request" label="Bad Request">
    ```json
    {
        "status": "BadRequest",
        "error_message": "You have me a bad request :(",
        "model_name": "my_model_name",
        "lookback": 30,
        "duration_ms": 12
    }
    ```
  </TabItem>
  <TabItem value="Internal Error" label="Internal Error">
    ```json
    {
        "status": "InternalError",
        "error_message": "Oops, the server couldn't predict",
        "model_name": "my_model_name",
        "lookback": 30,
        "duration_ms": 12
    }
    ```
  </TabItem>
</Tabs>

### POST `/v1/predict`

Make predictions using all loaded forecasting models in parallel, useful for ensembling or A/B testing.

Example:

```shell
curl --request POST \
  --url http://localhost:3000/v1/predict \
  --data '{
    "predictions": [
        {
            "model_name": "drive_stats_a"
        },
        {
            "model_name": "drive_stats_b"
        }
    ]
}'
```

Parameters:

- `model_name`: References a model name defined in the `spicepod.yaml`.

```json
{
  "duration_ms": 81,
  "predictions": [
    {
      "status": "Success",
      "model_name": "drive_stats_a",
      "model_version": "1.0",
      "lookback": 30,
      "prediction": [0.45, 0.5, 0.55],
      "duration_ms": 42
    },
    {
      "status": "Success",
      "model_name": "drive_stats_b",
      "model_version": "1.0",
      "lookback": 30,
      "prediction": [0.43, 0.51, 0.53],
      "duration_ms": 42
    }
  ]
}
```

:::warning[Limitations]

- Univariate predictions only.
- Multiple covariates.
- Covariate and output variate must have a fixed time frequency.
- No support for discrete or exogenous variables.
- :::

## Language Models
Spice supports OpenAI compatible endpoints

### POST `/v1/chat/completions`
To specify the model, provide the component name in the `model` key. For example
```shell
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my_language_model",
    "messages": [
      {
        "role": "system",
        "content": "I am just like any other OpenAI server!"
      },
      {
        "role": "user",
        "content": "That's cool!"
      }
    ]
  }'
```

### POST `/v1/embeddings`
To specify the embedding model, provide the component name in the `model` key. For example
```shell
curl http://localhost:3000/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "input": "The food was delicious and the waiter...",
    "model": "text-embedding-ada-002",
    "encoding_format": "float"
  }'
```