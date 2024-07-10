---
title: 'HTTP API'
sidebar_label: 'HTTP'
sidebar_position: 1
description: 'Spice runtime HTTP API'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The Spice runtime supports SQL queries directly from HTTP requests.

An example CuRL

```shell
curl -XPOST "127.0.0.1:3000/v1/sql" \
     --data "SELECT avg(total_amount), \
                    avg(tip_amount), \
                    count(1), \
                    passenger_count \
              FROM my_table \
              GROUP BY passenger_count \
              ORDER BY passenger_count ASC \
              LIMIT 3"
```

And response

```json
[
  {
    "AVG(my_table.tip_amount)": 3.072259971396793,
    "AVG(my_table.total_amount)": 25.327816939456525,
    "COUNT(Int64(1))": 31465,
    "passenger_count": 0
  },
  {
    "AVG(my_table.tip_amount)": 3.3712622884680057,
    "AVG(my_table.total_amount)": 26.205230445474996,
    "COUNT(Int64(1))": 2188739,
    "passenger_count": 1
  },
  {
    "AVG(my_table.tip_amount)": 3.7171302113290854,
    "AVG(my_table.total_amount)": 29.520659930930304,
    "COUNT(Int64(1))": 405103,
    "passenger_count": 2
  }
]
```

This allows for simple integration into any language or framework
<Tabs>
<TabItem value="python" label="Python" default>

```python
from typing import Optional
import requests
import pandas as pd

    def query_runtime(query: str, url: str =  "http://127.0.0.1:3000") -> Optional[pd.DataFrame]:
        response = requests.post(url, data=query)

        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return None

        return pd.DataFrame(response.json())
    ```

  </TabItem>
  <TabItem value="javascript" label="Javascript">
    ```javascript
    async function queryRuntime(query, url = "http://127.0.0.1:3000") {
        try {
            const response = await fetch(url, {method: 'POST', body: query});
            if (!response.ok) {
            console.error(`Error: Received status code ${response.status}`);
            return null;
            }

            return await response.json();
        } catch (error) {
            return error;
        }
    }
    ```

  </TabItem>
  </Tabs>
