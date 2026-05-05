---
title: 'JavaScript SDK'
description: 'Connect to Spice using the JavaScript SDK'
pagination_prev: null
pagination_next: null
tags:
  - sdk
  - javascript
  - nodejs
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## JavaScript SDK for Spice.ai

[github.com/spiceai/spice.js](https://github.com/spiceai/spice.js)

:::note[Parameterized Queries]
Parameterized query support is coming soon. See [Parameterized Queries](../features/query-federation/parameterized-queries) for more information.
:::

### Install

<Tabs>
  <TabItem value="npm" label="npm" default>
    ```shell
    npm i @spiceai/spice
    ```
  </TabItem>
  <TabItem value="yarn" label="yarn">
    ```shell
    yarn add @spiceai/spice
    ```
  </TabItem>
  <TabItem value="pnpm" label="pnpm">
    ```shell
    pnpm add @spiceai/spice
    ```
  </TabItem>
</Tabs>

### Connect to spice runtime

Create a `SpiceClient` using default configuration:

```js
import { SpiceClient } from '@spiceai/spice';

const main = async () => {
  const spiceClient = new SpiceClient();

  const table = await spiceClient.sql(
    'SELECT trip_distance, total_amount FROM taxi_trips ORDER BY trip_distance DESC LIMIT 10;'
  );

  console.table(table.toArray());
};

main();
```

Or pass custom flight address:

```js
const spiceClient = new SpiceClient({
  flightUrl: 'my_remote_spice_instance:50051'
});
```
