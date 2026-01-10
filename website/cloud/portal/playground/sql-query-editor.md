---
description: Use the Playground's SQL editor to easily explore data
---

# SQL Query

![Spice.ai Query Editor](/img/cloud/CleanShot%202024-12-20%20at%2002.11.49@2x.png)

*Spice.ai Query Editor*

Open the SQL editor by navigating to an App **Playground** and clicking **SQL Query** in the sidebar.

### SQL table, column, and keyword suggestions

The Spice.ai Query Editor will suggest table and column names along with keywords as you type. You can manually prompt for a suggestion by pressing **ctrl+space**.

1. Start typing a SQL command, such as `SELECT * FROM`
2. As you type, the Query Editor will suggest possible completions based on the query context. You can use the arrow keys or mouse to select a completion, and then press **Enter** or **Tab** to insert it into the editor.

Examples of using the SQL suggestions:

* Select the `spice.runtime.metrics` table:
  * Type `SELECT * FROM` and press Tab. The editor will suggest `spice.runtime.metrics` as a possible table. Press Enter to insert it into the query.

![A list of datasets available in Spice](/img/cloud/CleanShot%202024-12-20%20at%2002.18.11@2x.png)

*A list of datasets available in Spice*

* Show the fields in the `spice.runtime.metrics` table:
  * Type `SELECT * FROM spice.runtime.metrics WHERE "`. The editor will list the fields in the table.

![The available fields for spice.runtime.metrics along with their type.](/img/cloud/CleanShot%202024-12-20%20at%2002.18.57@2x.png)

*The available fields for spice.runtime.metrics along with their type.*

### Datasets Reference

The datasets reference displays all available datasets from the current app and allows you to search through them. Clicking on the dataset will insert a sample query into the SQL editor, which will be automatically selected for execution.

![Search for dataset in reference](/img/cloud/CleanShot%202024-12-20%20at%2002.25.32@2x.png)

*Search for dataset in reference*





