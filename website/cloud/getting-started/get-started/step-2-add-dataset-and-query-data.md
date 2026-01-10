---
description: Add a dataset and query it using SQL Query in the Playground
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




# Add a Dataset and query data

To add a dataset to the Spice app, navigate to the [**Code**](../../portal/app-spicepod/) tab.

Use the **Components sidebar** on the right to select from available **Data Connectors**, **Model Providers**, and ready-to-use **Datasets**.

### Adding a ready-to-use Dataset

1. Navigate to **Code** tab.
2. In **Components** sidebar, click the **Datasets** tab.

![Spice.ai app Code configuration](/img/cloud/CleanShot%202024-12-19%20at%2011.00.59@2x.png)

*Spice.ai app Code configuration*

3. Select and add the **NYC Taxi Trips** dataset
   1. Note the configuration has been added to the editor

![Add the NYC Taxi Trips dataset](/img/cloud/CleanShot%202024-12-19%20at%2011.00.38@2x.png)

*Add the NYC Taxi Trips dataset*

4. Click **Save** in the code toolbar and then **Deploy** on popup card that appears in the bottom right.

![image](/img/cloud/CleanShot 2024-12-19 at 11.04.22.gif)

5. Navigate to the [**Playground**](../../portal/playground/) tab, open the dataset reference, and click on the `spice.samples.taxi_trips` dataset to insert a sample query into the SQL editor. Then, click **Run Selection**.

![Exexuting the sample query for the NYC Taxi Trips dataset.](/img/cloud/CleanShot%202024-12-19%20at%2011.09.40.gif)

*Exexuting the sample query for the NYC Taxi Trips dataset.*

### \[Optional] Execute a SQL query using cURL

6. Go app **Settings** and copy one of the app API Keys.

![Getting an API Key from the app Settings.](/img/cloud/CleanShot%202024-12-19%20at%2012.25.51@2x.png)

*Getting an API Key from the app Settings.*

7. Replace `[API-KEY]` in the sample below with your API Key and execute from a terminal.


<Tabs>
<TabItem value="curl" label="cURL">

```sh
curl --request POST \
  --url 'https://data.spiceai.io/v1/sql' \
  --header 'Content-Type: text/plain' \
  --header 'X-API-KEY: [API-KEY]' \
  --data 'select * from spice.samples.taxi_trips limit 3'
```

</TabItem>
</Tabs>

![Showing results from executing a sample NYC Taxi Trips dataaset query using cURL.](/img/cloud/CleanShot%202024-12-19%20at%2012.34.32@2x.png)

*Showing results from executing a sample NYC Taxi Trips dataaset query using cURL.*

🎉 Congratulations, you've now added a dataset and queried it.

Continue to [Step 4 to add an AI Model and chat with the dataset](step-3-add-ai-model-and-chat-with-your-app.md).

:::info
Need help? Ask a question, raise issues, and provide feedback to the Spice AI team on [Slack](https://spiceai.org/slack).
:::
