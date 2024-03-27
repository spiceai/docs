---
title: 'Machine Learning Inference'
sidebar_label: 'Machine Learning Inference'
description: ''
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Spice ML runtime currently supports prediction via an API in the runtime. 
```shell
GET /v1/models/:name/predict
```
Where 
 - `name`: references the name provided in the `spicepod.yaml`.


### Examples
```shell
curl "http://localhost:3000/v1/models/my_model_name/predict"
```

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

### Limitations
- Univariate predictions only
- Multiple covariates 
- Covariate and output variate must have a fixed time frequency.
- No support for discrete or exogenous variables.