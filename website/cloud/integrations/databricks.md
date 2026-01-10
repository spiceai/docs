

# Databricks

:::info
Databricks OAuth connections require Spice.ai v1.4.0 or higher.
:::

### Create Databricks App Connection

To connect Spice Cloud to your Databricks workspace, create a new App connection in your workspace settings with the following configuration:

* **Application Name**: `Spice Cloud Platform`
* **Redirect URLs**: `https://spice.ai/api/integrations/databricks/callback` 
* **Access scopes**: `All Apis`
* **Client secret generation:** `disabled`

![Add new Databricks OAuth connection](/img/cloud/databricks-add-connection.png)

*Add new Databricks OAuth connection*

After creating the connection, copy the generated OAuth client ID:

![Copy Databricks Client ID](/img/cloud/databricks-connection-client-id.png)

*Copy Databricks Client ID*

### Configure Databricks Connection in Spice Cloud

Navigate to the code editor and select the Databricks connector. Choose either SQL Warehouse or Delta Lake mode, then select the OAuth authorization option. Click **Connect Databricks Workspace** to proceed.

![Databricks connector in code editor](/img/cloud/spicepod-editor%20(1).png)

*Databricks connector in code editor*

Enter the workspace URL and OAuth Client ID generated from the Databricks OAuth app, then click **Connect**.

![Set Databricks workspace URL and Client ID](/img/cloud/new-databricks-connection%20(1).png)

*Set Databricks workspace URL and Client ID*

After successful authentication in Databricks, you will be redirected back to the Spice app:

:::info
Note: Databricks authentication credentials are only stored client-side in your browser and never in Spice Cloud.
:::

![Successful connection](/img/cloud/connection-success.png)

*Successful connection*

Once connected, Databricks datasets, catalogs, and models can use the connection:

![Code editor with Databricks catalog, dataset and model](/img/cloud/spicepod-editor-dataset%20(1).png)

*Code editor with Databricks catalog, dataset and model*
