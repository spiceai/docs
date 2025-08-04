---
title: 'Enterprise Search and Retrieval'
sidebar_label: 'Enterprise Search'
sidebar_position: 7
description: 'Spice.ai powers semantic and precise search for finserv knowledge bases with hybrid vector and keyword capabilities.'
pagination_prev: null
pagination_next: null
---

Spice.ai powers semantic and precise search for financial services (finserv) knowledge bases with hybrid vector and keyword capabilities, enabling rapid access to critical information for compliance and decision-making.

Unlike standalone search engines (e.g., Elasticsearch, OpenSearch) that lack seamless data and AI integration, Spice.ai combines hybrid search (vector + keyword + BM25), federated data access, and AI workflows to deliver enterprise-grade search experiences tailored for finserv’s regulatory and performance demands. This approach reduces data duplication costs and enhances contextual relevance, making it ideal for high-stakes financial applications.

## Why Spice.ai?

- **Hybrid Search**: Balances semantic (vector) and exact-match (keyword/BM25) search for optimal relevance, retrieving compliance documents or transaction records with precision, unlike single-mode search engines that compromise on flexibility.
- **Federated Data Access**: Searches across Databricks, on-premises databases, and cloud storage without data duplication, minimizing storage costs and compliance risks compared to centralized search platforms.
- **Performance**: Materializes datasets and uses query push-down optimizations for faster results than traditional enterprise search solutions, critical for finserv’s high-volume, time-sensitive queries.
- **AI Integration**: Enhances search results with the AI Gateway for intelligent ranking and summarization, improving usability in complex finserv environments over basic search tools.

## Example

A finserv firm enables traders to search a knowledge base combining structured transaction data from Databricks with unstructured compliance documents from cloud storage. Hybrid search retrieves relevant regulations semantically (via vector search) and precise contract terms (via BM25), streamlining compliance checks and reducing research time compared to siloed search tools. This improves operational efficiency and regulatory adherence. The [Searching GitHub Files recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README.md) and [Vector-Based Search documentation](/docs/features/search/index.md) provide implementation guidance for hybrid search workflows.

## Benefits

- **Precision**: Hybrid search delivers highly relevant results for regulatory and operational needs, enhancing decision-making accuracy.
- **Efficiency**: Federated access eliminates data duplication, reducing storage and management costs in finserv.
- **Productivity**: AI-enhanced search accelerates information retrieval, enabling faster responses in fast-paced financial markets.

### Learn More

- **Vector and Hybrid Search**: [Documentation](/features/search/index.md) and [Searching GitHub Files Recipe](https://github.com/spiceai/cookbook/blob/trunk/search_github_files/README.md).
- **Federated SQL Queries**: [Documentation](/features/query-federation/index.md) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md).
- **AI Gateway**: [Documentation](/features/large-language-models/index.md) and [Running Llama3 Locally Recipe](https://github.com/spiceai/cookbook/blob/trunk/llama/README.md).
