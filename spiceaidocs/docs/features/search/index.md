---
title: 'Search Functionality'
sidebar_label: 'Search'
description: 'Learn how Spice can search across datasets using database-native and vector-search methods.'
sidebar_position: 7
pagination_prev: null
pagination_next: null
---

Spice provides advanced search capabilities that go beyond standard SQL queries, offering both traditional SQL search patterns and vector-based search functionality.

## SQL Search

SQL-based search requires the integration of data connectors or data accelerators. Data connectors help integrate various data sources, enabling seamless access to diverse datasets. Data accelerators optimize query performance, ensuring efficient and fast search operations. For more information on setting up data connectors and accelerators, see [Data Connectors](../components/data-connectors) and [Data Accelerators](../components/data-accelerators).

For performing SQL-based search, see [SQL-Based Search](./sql-search).

## Vector Search

Vector-based search, requires configured data sources (connectors or accelerators) in addition to embeddings. These embeddings represent data in numerical representations that can be used by machine learning models, facilitating similarity comparisons for more advanced search capabilities.

Configuring embeddings is crucial for the effectiveness of vector-based search. For detailed instructions on setting up embeddings, refer to [Configured Embeddings](../components/embeddings).

For performing vector-based search, see [Vector-Based Search](./vector-search).

import DocCardList from '@theme/DocCardList';

<DocCardList />
