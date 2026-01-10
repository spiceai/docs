

# App Spicepod

Every Spice app is powered by a managed instance of the [Spice OSS Runtime](https://www.spiceai.org/) deployed to the platform.

A **Spicepod** is a package that encapsulates application-centric datasets and machine learning (ML) models.

Spicepods are analogous to code packaging systems, like NPM, however differ by expanding the concepts to data and ML models.

### Structure[​](https://docs.spiceai.org/getting-started/spicepods#structure) <a href="#structure" id="structure"></a>

A Spicepod is described by a YAML manifest file, typically named `spicepod.yaml`, which includes the following key sections:

* **Metadata:** Basic information about the Spicepod, such as its name and version.
* **Datasets:** Definitions of datasets that are used or produced within the Spicepod.
* **Catalogs:** Definitions of catalogs that are used within the Spicepod.
* **Models:** Definitions of ML models that the Spicepod manages, including their sources and associated datasets.

### Example Manifest[​](https://docs.spiceai.org/getting-started/spicepods#example-manifest) <a href="#example-manifest" id="example-manifest"></a>

```yaml
version: v1beta1
kind: Spicepod
name: my_spicepod

datasets:
  - from: spice.ai/spiceai/quickstart
    name: qs
    acceleration:
      enabled: true
      refresh_mode: append

models:
  - from: openai/gpt-4o
    name: gpt-4o
```

### Key Components[​](https://docs.spiceai.org/getting-started/spicepods#key-components) <a href="#key-components" id="key-components"></a>

#### Datasets[​](https://docs.spiceai.org/getting-started/spicepods#datasets) <a href="#datasets" id="datasets"></a>

Datasets in a Spicepod can be sourced from various locations, including local files or remote databases. They can be materialized and accelerated using different engines such as DuckDB, SQLite, or PostgreSQL to optimize performance ([learn more](../../features/data-acceleration/)).

#### Catalogs[​](https://docs.spiceai.org/getting-started/spicepods#catalogs) <a href="#catalogs" id="catalogs"></a>

Catalogs in a Spicepod can contain multiple schemas. Each schema, in turn, contains multiple tables where the actual data is stored.

#### Models[​](https://docs.spiceai.org/getting-started/spicepods#models) <a href="#models" id="models"></a>

ML models are integrated into the Spicepod similarly to datasets. The models can be specified using paths to local files or remote locations. ML inference can be performed using the models and datasets defined within the Spicepod.

To learn more, please refer to the full [Spicepod specification](https://docs.spiceai.org/reference/spicepod).
