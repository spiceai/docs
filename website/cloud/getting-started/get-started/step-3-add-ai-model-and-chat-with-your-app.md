---
description: Add an OpenAI model and chat with the NYC Taxi Trips dataset
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';




# Add AI Model and chat with your data

:::info
An [OpenAI API Platform](https://platform.openai.com/) account and API key is required.
:::

### Adding a Model Provider

1. Navigate to **Code** tab.
2. In **Components** sidebar, click **Model Providers** tab, and select **OpenAI**.
3. Enter the **Model name.**
4. Enter the **Model ID**, (e.g. `gpt-4o`).
5. Set the **OpenAI API Key** secret
   1. API keys and other secrets are securely stored and encrypted.

![image](/img/cloud/CleanShot 2024-12-19 at 11.52.06 (1).gif)

6. Insert `tools: auto` in the `params` section of the `gpt-4o` Model to automatically connect datasets to the model.\
   \
   The final Spicepod configuration in the editor should be as follows:

```yaml
name: my-first-app
kind: Spicepod
version: v1beta1

datasets:
  - from: s3://spiceai-demo-datasets/taxi_trips/2024/
    name: samples.taxi_trips
    description: Taxi trips dataset from Spice.ai demo datasets.
    params:
      file_format: parquet

models:
  - from: openai:gpt-4o
    name: gpt-4o
    params:
      endpoint: https://api.openai.com/v1
      openai_api_key: ${secrets:OPENAI_API_KEY}
      tools: auto
```

7. Click **Save** in the code toolbar and then **Deploy** in the popup card that appears in the bottom right to deploy the changes.
8. Navigate to **Playground** and select **AI Chat** in the sidebar.
9. Ask a question about the NYC Taxi Trips dataset in the chat. For example:
   - "What datasets are available?"
   - "What is the average fare amount of a taxi trip?"

![Asking questions of the NYC Taxi Trips dataset in the AI Chat Playground.](/img/cloud/CleanShot%202024-12-19%20at%2012.22.38@2x.png)

*Asking questions of the NYC Taxi Trips dataset in the AI Chat Playground.*

### \[Optional] Call chat completions API using cURL

10. Replace `[API-KEY]` in the sample below with the app API Key and execute in a terminal.


<Tabs>
<TabItem value="curl" label="cURL">

```sh
curl --request POST \
      --url 'https://data.spiceai.io/v1/chat/completions' \
      --header 'Content-Type: application/json' \
      --header 'X-API-KEY: 31393037|8f2f6125e7b8487f80964041c123d3c3' \
      --data '{ "messages": [{ "role": "user", "content": "Hello!" }], "model": "gpt-4o" }'
```

</TabItem>
</Tabs>

![Calling the chat completions API to chat wit the NYC Taxi Trips dataset.](/img/cloud/CleanShot%202024-12-19%20at%2012.42.00@2x.png)

*Calling the chat completions API to chat wit the NYC Taxi Trips dataset.*

🎉 Congratulations, you've now added an OpenAI model and can use it to ask questions of the NYC Taxi Trips dataset.

Continue to [Next Steps](next-steps.md) to explore use-cases to do more with the Spice.ai Cloud Platform.

:::info
Need help? Ask a question, raise issues, and provide feedback to the Spice AI team on [Slack](https://spiceai.org/slack).
:::
