---
title: 'Tool-Augmented AI with Model Context Protocol Server'
sidebar_label: 'MCP Server'
sidebar_position: 10
description: 'Spice.ai extends AI with custom tools via MCP server in finserv, integrating domain-specific APIs for enhanced functionality.'
pagination_prev: null
pagination_next: null
---

Spice.ai extends AI with custom tools via Model Context Protocol (MCP) server in financial services (finserv), integrating domain-specific APIs for enhanced functionality and precise decision-making in high-stakes financial applications.

Unlike generic tool-calling frameworks (e.g., OpenAI Functions) that rely on external APIs and lack robust data integration, Spice.ai’s stdio-based MCP servers provide low-latency, secure tool interactions with federated data access. This makes it ideal for finserv applications requiring compliance, real-time performance, and tailored AI capabilities, outperforming platforms with limited domain-specific tool integration.

## Why Spice.ai?

- **Internal MCP Hosting**: Runs stdio-based MCP servers within the Spice runtime, reducing latency and external dependencies compared to API-only frameworks, critical for finserv’s high-speed transaction and risk assessment needs.
- **Tool Integration**: Extends large language models (LLMs) with custom tools (e.g., risk assessment APIs, portfolio optimization engines), offering flexibility for domain-specific tasks like fraud detection or trading analysis.
- **Data Synergy**: Combines MCP tool outputs with federated SQL queries (e.g., transaction data from Databricks, PostgreSQL) for richer, context-aware AI responses, surpassing standalone tool frameworks that lack data integration.
- **Security**: Internal execution ensures data privacy, aligning with finserv’s stringent compliance requirements for handling sensitive financial data.

## Example

A finserv platform uses Spice.ai as an MCP server to integrate a risk assessment tool, enabling an LLM to generate real-time fraud alerts by combining transaction data (via federated queries from Databricks) with the tool's risk scoring outputs. This delivers faster, more accurate fraud detection than generic AI agents reliant on external APIs, reducing financial losses and improving regulatory compliance. The [Spice.ai MCP documentation](../../../features/large-language-models/mcp) provides detailed setup guidance for implementing MCP server workflows.

## Benefits

- **Customization**: Tailors AI capabilities to finserv-specific needs with custom tools, enhancing decision-making accuracy.
- **Performance**: Internal tool execution minimizes latency, enabling real-time fraud detection and risk analysis.
- **Compliance**: Protects sensitive financial data with secure, internal processing, meeting regulatory standards.

### Learn More

- **MCP Documentation**: [Documentation](../../../features/large-language-models/mcp).
- **Federated SQL Queries**: [Documentation](../../../features/query-federation/index.md) and [Federated SQL Query Recipe](https://github.com/spiceai/cookbook/blob/trunk/federation/README.md).
- **AI Gateway**: [Documentation](../../../features/large-language-models/index.md) and [Running Llama3 Locally Recipe](https://github.com/spiceai/cookbook/blob/trunk/llama/README.md).
