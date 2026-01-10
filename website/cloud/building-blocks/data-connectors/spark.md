---
description: Apache Spark Connector Documentation
---
import Tabs from '@theme/Tabs'; import TabItem from '@theme/TabItem';




# Spark


Apache Spark as a connector for federated SQL query against a Spark Cluster using [Spark Connect](https://spark.apache.org/docs/latest/spark-connect-overview.html)

```yaml
datasets:
  - from: spark:spiceai.datasets.my_awesome_table
    name: my_table
    params:
      spark_remote: sc://my-spark-endpoint
```

## Configuration

* `spark_remote`: A [spark remote](https://spark.apache.org/docs/latest/spark-connect-overview.html#set-sparkremote-environment-variable) connection URI. Refer to [spark connect client connection string](https://github.com/apache/spark/blob/master/connector/connect/docs/client-connection-string.md) for parameters in URI.

## Limitations

* Correlated scalar subqueries are only supported in filters, aggregations, projections, and UPDATE/MERGE/DELETE commands. [Spark Docs](https://spark.apache.org/docs/latest/sql-error-conditions-unsupported-subquery-expression-category-error-class.html#unsupported_correlated_scalar_subquery)
* The Spark connector does not yet support streaming query results from Spark.
