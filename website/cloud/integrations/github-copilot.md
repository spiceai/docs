---
description: How to use the Spice.ai for GitHub Copilot Extension
---

# GitHub Copilot

The [Spice AI GitHub Copilot Extension](https://github.com/marketplace/spice-ai-for-github-copilot) makes it easy to access and chat with external data in GitHub Copilot, enhancing AI-assisted research, Q\&A, code, and documentation suggestions for greater accuracy.

![The @spiceai extension in GitHub Copilot.](/img/cloud/Screenshot%202024-10-23%20at%2015.45.09.png)

*The @spiceai extension in GitHub Copilot.*

Access structured and unstructured data from any Spice data source like GitHub, PostgreSQL, MySQL, Snowflake, Databricks, GraphQL, data lakes (S3, Delta Lake, OneLake), HTTP(s), SharePoint, and even FTP.

Some example prompts:

* **`@spiceai`**` ``What documentation is relevant to this file?`
* **`@spiceai`**` ``Write documentation about the user authentication issue`
* **`@spiceai`**` ``Who are the top 5 committers to this repository?`
* **`@spiceai`**` ``What are the latest error logs from my web app?`

## Installing the Spice.ai for GitHub Copilot Extension

To install the extension, visit the [GitHub Marketplace](https://github.com/marketplace/spice-ai-for-github-copilot) and search for **Spice.ai**.

![The Spice.ai Extension in the GitHub Marketplace.](/img/cloud/image%20(38).png)

*The Spice.ai Extension in the GitHub Marketplace.*

Scroll down, and click **Install it for free**.

![Install the Community Edition of the Spice.ai Extension for free.](/img/cloud/image%20(39).png)

*Install the Community Edition of the Spice.ai Extension for free.*

## Configuring the extension

1. Once installed, open Copilot Chat and type `@spiceai`. Press enter.

![Starting a conversaton with @spiceai](/img/cloud/copilot_chat_again.png)

*Starting a conversaton with @spiceai*

2. A prompt will appear to connect to the Spice.ai Cloud Platform.

![Connection prompt](/img/cloud/copilot_connect.png)

*Connection prompt*

3. You will need to authorize the extension. Click **Authorize spiceai**.

![Permissions screen for the Spice AI Extension](/img/cloud/copilot_authorize.png)

*Permissions screen for the Spice AI Extension*

4. To create an account on the Spice.ai Cloud Platform, click **Authorize Spice AI Platform.**

![Authorizing the Spice.ai Cloud Platform](/img/cloud/copilot_authorize_platform.png)

*Authorizing the Spice.ai Cloud Platform*

5. Once your account is created, you can configure the extension. Select from a set of ready-to-use datasets to get started. You can configure other datasets after setup.

![GitHub Copilot Extension Setup page](/img/cloud/copilot_extension_setup.png)

*GitHub Copilot Extension Setup page*

![image](/img/cloud/copilot_select_datasets.png)

6. The extension will take up to 30 seconds to deploy and load the initial dataset.

![GitHub Copilot Extension Deployment page](/img/cloud/copilot_start_instance.png)

*GitHub Copilot Extension Deployment page*

7. When complete, proceed back to **GitHub Copilot Chat**.

## Chatting with Copilot Chat

### Start a new chat

To chat with the **Spice.ai for GitHub Copilot** extension, prefix the message with `@spiceai`

![image](/img/cloud/copilot_chat_again (1).png)

:::info
If `@spiceai` does not appear in the popup **(2)**, ensure that all the [installation](github-copilot.md) steps have been followed. 
:::

### Querying which datasets are available

To list the datasets available to Copilot, try `@spiceai What datasets do I have access to?`

![image](/img/cloud/copilot_what_datasets_again (1).png)

![image](/img/cloud/copilot_chat_results.png)

### Querying data using SQL



### Navigate to [Spice.ai](https://spice.ai) and click **Portal** 

<img src="/img/cloud/copilot_portal.png" alt="" />



### Click the `copilot` app

<img src="/img/cloud/copilot_portal_app.png" alt="" />

This will open the Spice.ai playground



### List the tables available

Run `show tables` to list the tables that are available to the Copilot extension

<img src="/img/cloud/copilot_show_tables.png" alt="" />



### Querying repository content

To query the GitHub content, query one of the tables above like so:

> `SELECT name, path, url, content_embedding FROM react.docs LIMIT 10;`

<img src="/img/cloud/copilot_select.png" alt="" />



## Reset the Copilot instance



### Navigate to [spice.ai](https://spice.ai) and click **Portal**

<img src="/img/cloud/copilot_portal.png" alt="" />



### Open the account menu in the top-right corner

<img src="/img/cloud/copilot_reset_user.png" alt="" />



### Click **Account Settings**

<img src="/img/cloud/copilot_reset_settings.png" alt="" />



### Click **GitHub Copilot**

<img src="/img/cloud/copilot_reset_copilot.png" alt="" />



### Click **Reset GitHub Copilot config**

<img src="/img/cloud/copilot_reset_config.png" alt="" />



