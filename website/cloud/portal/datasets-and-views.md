---
description: Custom Datasets and Views documentation.
hidden: true
---

# Datasets

The Spice.ai platform comes pre-loaded with a variety of community datasets.

In addition, you can define and create your own custom and private Datasets and Views, which can then be queried with SQL, cached in Spice Firecache, and published publicly to be shared with others.

![image](/img/cloud/screenshot 4 - GitHub.png)

### Defining a Dataset

To define a dataset, first ensure your Spice app is connected to a [GitHub repository](apps/connect-github.md), then add a dataset manifest file to the GitHub repository in the `.spice/datasets` path.

For example:

```yaml
# .spice/datasets/recent_blocks.yml
name: eth.recent_blocks
type: append
firecache:
  enabled: true
  trigger: number
  time_column: timestamp
```

Once the manifest file is committed to the GitHub repository, navigate to the **Datasets** section. The newly defined dataset will appear in the datasets list.

![List of synced Datasets.](/img/cloud/Screenshot%202023-10-24%20at%205.03.22%20PM.png)

*List of synced Datasets.*

### Deploy the Dataset

Click the dataset **Deploy** button. Because this dataset was Firecache enabled, the firecache status will now turn to **Ready.**

![Deployed dataset eth.recent_blocks is now firecache Ready.](/img/cloud/Screenshot%202023-10-24%20at%205.48.15%20PM.png)

*Deployed dataset eth.recent_blocks is now firecache Ready.*

### View Dataset details

Clicking the dataset will show its details along with it's deployments.

![Dataset details page.](/img/cloud/Screenshot%202023-10-24%20at%205.48.49%20PM.png)

*Dataset details page.*
