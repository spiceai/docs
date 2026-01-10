# Streaming

The `@spiceai/spice` SDK supports streaming partial results as they become available.

This can be used to enable more efficient pipelining scenarios where processing each row of the result set can happen independently.

The  [`Client.query`](api-reference.md#spiceclient-methods) function takes an optional `onData` callback that will be passed partial results as they become available.

```javascript
public async query(
    queryText: string,
    onData: ((data: Table) => void) | undefined = undefined
  ): Promise<Table>
```

In this example, we retrieve all 10,000 suppliers from the TPCH Suppliers table. This query retrieves all suppliers in a single call:

```sql
import { SpiceClient } from "@spiceai/spice";

const spiceClient = new SpiceClient(process.env.API_KEY);
const query = `
SELECT s_suppkey, s_name
FROM tpch.supplier
`
const allSuppliers = await spiceClient.query(query)
allSuppliers.toArray().forEach((row) => {
    processSupplier(row.toJSON())
});
```

This call will wait for the promise returned by `query()` to complete, returning all 10,000 suppliers.

Alternatively, data can be processed as it is streamed to the SDK. Provide a callback function to the `onData` parameter, which will be called with every partial set of data streamed to the SDK:

```javascript
import { SpiceClient } from "@spiceai/spice";

const spiceClient = new SpiceClient(process.env.API_KEY);
const query = `
SELECT s_suppkey, s_name
FROM tpch.supplier
`
await spiceClient.query(query, (partialData) => {
    partialData.toArray().forEach((row) => {
        processSupplier(row.toJSON())
    });
})
```
