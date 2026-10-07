import React from 'react'
import { Title } from '@site/src/components/atoms/title/title'
import { Paragraph } from '@site/src/components/atoms/paragraph/paragraph'
import { Container } from '@site/src/components/atoms/container/container'
import { Recipe } from '@site/src/components/molecules/recipe/recipe'
import { Link } from '@site/src/components/atoms/link/link'
import { Icon } from '@site/src/components/atoms/icon/icon'

interface RecipeData {
  title: string
  description: string
  path: string
  tags: string[]
  videoUrl?: string
}

const recipeBaseUrl = 'https://github.com/spiceai/cookbook/blob/trunk'

const recipes: RecipeData[] = [
  // Core scenarios
  {
    title: 'Federated SQL Query',
    description:
      'Join data from S3 and PostgreSQL in a single SQL query, then accelerate both locally.',
    path: '/federation/README.md',
    tags: ['core', 'federation', 'sql']
  },
  {
    title: 'Cayenne Data Accelerator',
    description: 'Accelerate a local copy of a dataset stored in S3 using Cayenne.',
    path: '/cayenne/README.md',
    tags: ['core', 'acceleration', 'cayenne']
  },
  {
    title: 'Async Queries',
    description: 'Submit long-running SQL queries and retrieve the results asynchronously.',
    path: '/async-queries/README.md',
    tags: ['core', 'sql', 'async']
  },
  {
    title: 'Hybrid-Search with RRF',
    description:
      'Combine full-text and vector search using Reciprocal Rank Fusion (RRF) for improved search results.',
    path: '/search/README.md',
    tags: ['core', 'search', 'rrf']
  },
  {
    title: 'AI SQL Function',
    description: 'Invoke LLMs directly within SQL queries using the AI SQL function.',
    path: '/ai/README.md',
    tags: ['core', 'ai', 'sql', 'llm']
  },
  // Sample Applications and guides
  {
    title: 'Command Query Responsibility Segregation (CQRS)',
    description: 'Sample application implementing the CQRS pattern with Spice.',
    path: '/cqrs/README.md',
    tags: ['sample', 'cqrs', 'application']
  },
  {
    title: 'Intelligent Security Copilot',
    description:
      'Use AI to analyze real-time data access patterns and detect potential security risks.',
    path: '/guides/security-analyzer/README.md',
    tags: ['guide', 'analyzer']
  },
  // Models & AI
  {
    title: 'Azure OpenAI Models',
    description:
      'Use Azure OpenAI models for vector search and chat over structured and unstructured data.',
    path: '/azure_openai/README.md',
    tags: ['ai', 'openai', 'azure']
  },
  {
    title: 'OpenAI Models',
    description: 'Use OpenAI language and embedding models with Spice.',
    path: '/models/openai/README.md',
    tags: ['ai', 'openai', 'models']
  },
  {
    title: 'Running Llama3 Locally',
    description: 'Use the Llama family of models locally from HuggingFace using Spice.',
    path: '/llama/README.md',
    tags: ['ai', 'llama', 'huggingface'],
    videoUrl: 'https://youtu.be/I2i6uZKBbd4'
  },
  {
    title: 'Filesystem Hosted Model',
    description: 'Serve a model stored on the local filesystem.',
    path: '/models/filesystem/README.md',
    tags: ['ai', 'models', 'local']
  },
  {
    title: 'OpenAI SDK',
    description: 'Use the OpenAI SDK to connect to models hosted on Spice.',
    path: '/openai_sdk/README.md',
    tags: ['ai', 'openai', 'sdk']
  },
  {
    title: 'OpenAI Responses API',
    description: 'Use the OpenAI Responses API with Spice.',
    path: '/openai-responses-api/README.md',
    tags: ['ai', 'openai']
  },
  {
    title: 'LLM Memory',
    description: 'Persistent memory for language models.',
    path: '/llm-memory/README.md',
    tags: ['ai', 'llm', 'memory'],
    videoUrl: 'https://youtu.be/uc8TCAPu1IM'
  },
  {
    title: 'Text to SQL (NSQL)',
    description:
      'Ask natural language (NLP) questions of your datasets using the built-in text-to-SQL tool.',
    path: '/text-to-sql/README.md',
    tags: ['ai', 'text-to-sql', 'nsql', 'tools']
  },
  {
    title: 'Generative Visualizations',
    description: 'Generate SQL queries and interactive charts from natural language questions.',
    path: '/generative-visualisations/README.md',
    tags: ['ai', 'visualization', 'charts']
  },
  {
    title: 'Nvidia NIM on Kubernetes',
    description: 'Deploy Nvidia NIM infrastructure on Kubernetes with GPUs, connected to Spice.',
    path: '/nvidia-nim/kubernetes/README.md',
    tags: ['ai', 'nvidia', 'nim', 'kubernetes']
  },
  {
    title: 'Nvidia NIM on AWS EC2',
    description: 'Deploy Nvidia NIM on a GPU-optimized AWS EC2 instance, connected to Spice.',
    path: '/nvidia-nim/ec2/README.md',
    tags: ['ai', 'nvidia', 'nim', 'aws']
  },
  {
    title: 'Searching GitHub Files',
    description: 'Search GitHub files with embeddings and vector similarity search.',
    path: '/search_github_files/README.md',
    tags: ['ai', 'github', 'search'],
    videoUrl: 'https://youtu.be/5y26MveEJ8c'
  },
  {
    title: 'xAI Models',
    description: 'Use xAI models such as Grok.',
    path: '/models/xai/README.md',
    tags: ['ai', 'xai', 'models'],
    videoUrl: 'https://youtu.be/-7RkAsqQLdk'
  },
  {
    title: 'DeepSeek Model',
    description: 'Use DeepSeek model through Spice.',
    path: '/deepseek/README.md',
    tags: ['ai', 'deepseek', 'models']
  },
  {
    title: 'Model Context Protocol (MCP)',
    description: 'Connect to MCP servers and use MCP tools with Spice.',
    path: '/mcp/README.md',
    tags: ['ai', 'mcp', 'tools']
  },
  {
    title: 'Spice as an MCP Server',
    description:
      'Run Spice as an MCP server and connect AI assistants such as Claude Desktop, Cursor, or VS Code.',
    path: '/mcp-server/README.md',
    tags: ['ai', 'mcp', 'tools']
  },
  {
    title: 'Amazon S3 Vectors',
    description: 'Use Amazon S3 Vectors to store embeddings and perform efficient vector search.',
    path: '/vectors/s3/README.md',
    tags: ['ai', 'search', 'AWS'],
    videoUrl: 'https://www.youtube.com/watch?v=QPbqPf5W36g'
  },
  // Data Acceleration
  {
    title: 'DuckDB Data Accelerator',
    description: 'Accelerate data locally using DuckDB.',
    path: '/duckdb/accelerator/README.md',
    tags: ['acceleration', 'duckdb', 'data'],
    videoUrl: 'https://youtu.be/hFvVz5NGpaw'
  },
  {
    title: 'PostgreSQL Data Accelerator',
    description:
      'Materialize data into an attached PostgreSQL instance. Available in Spice.ai Enterprise.',
    path: '/postgres/accelerator/README.md',
    tags: ['acceleration', 'postgresql', 'data', 'enterprise']
  },
  {
    title: 'SQLite Data Accelerator',
    description: 'Accelerate data locally using SQLite.',
    path: '/sqlite/accelerator/README.md',
    tags: ['acceleration', 'sqlite', 'data']
  },
  {
    title: 'Apache Arrow Data Accelerator',
    description: 'Accelerate data in memory using Apache Arrow.',
    path: '/arrow/README.md',
    tags: ['acceleration', 'apache', 'arrow']
  },
  {
    title: 'Hashed Partitioning with Cayenne',
    description: 'Prune data on categorical columns, such as IDs, using hashed partitioning.',
    path: '/hashed_partitioning/README.md',
    tags: ['acceleration', 'cayenne', 'partitioning']
  },
  {
    title: 'Dataset Partitioning',
    description: 'Partition accelerated datasets so queries skip partitions they do not need.',
    path: '/acceleration/partitioning/README.md',
    tags: ['acceleration', 'partitioning']
  },
  {
    title: 'Accelerated Views',
    description: 'Pre-calculate and materialize derived data for faster queries.',
    path: '/views/README.md',
    tags: ['acceleration', 'views']
  },
  {
    title: 'Acceleration Snapshots',
    description:
      'Bootstrap accelerations from snapshots in object storage to skip cold starts. Available in Spice.ai Enterprise.',
    path: '/acceleration/snapshots/README.md',
    tags: ['acceleration', 'snapshots', 'enterprise']
  },
  {
    title: 'Dual-Dataset Registration',
    description: 'Serve queries immediately while a large table accelerates in the background.',
    path: '/acceleration/dual-dataset-registration/README.md',
    tags: ['acceleration', 'federation']
  },
  {
    title: 'Serializable Transactions',
    description:
      'Commit gated, serializable transactions on Cayenne tables and write the results back to PostgreSQL.',
    path: '/serializable-transactions/README.md',
    tags: ['acceleration', 'cayenne', 'transactions']
  },
  // Change Data Capture
  {
    title: 'PostgreSQL CDC',
    description:
      'Stream changes from PostgreSQL using logical replication, without Debezium or Kafka.',
    path: '/postgres/cdc/README.md',
    tags: ['cdc', 'postgresql']
  },
  {
    title: 'PostgreSQL Catalog CDC',
    description:
      'Discover every table in a PostgreSQL database and keep a local copy of each current with CDC.',
    path: '/catalogs/postgres-cdc/README.md',
    tags: ['cdc', 'catalog', 'postgresql']
  },
  {
    title: 'MySQL CDC',
    description: 'Stream changes from MySQL using the binary log, without Debezium or Kafka.',
    path: '/mysql/cdc/README.md',
    tags: ['cdc', 'mysql']
  },
  {
    title: 'AWS Aurora MySQL CDC',
    description: 'Stream changes from an AWS Aurora MySQL cluster using the binary log.',
    path: '/mysql/rds-aurora-cdc/README.md',
    tags: ['cdc', 'aws', 'aurora', 'mysql']
  },
  {
    title: 'MongoDB Change Streams',
    description: 'Stream changes from a MongoDB collection using Change Streams.',
    path: '/mongodb/change-streams/README.md',
    tags: ['cdc', 'mongodb']
  },
  {
    title: 'DynamoDB Streams',
    description:
      'Stream inserts, updates, and deletes from a DynamoDB table using DynamoDB Streams.',
    path: '/dynamodb/streams/README.md',
    tags: ['cdc', 'aws', 'dynamodb']
  },
  {
    title: 'Debezium CDC from Postgres',
    description: 'Stream changes from PostgreSQL using Debezium CDC.',
    path: '/cdc-debezium/README.md',
    tags: ['cdc', 'debezium', 'postgresql']
  },
  {
    title: 'Debezium CDC with SASL/SCRAM',
    description: 'Stream MySQL changes using Debezium with SASL/SCRAM authentication.',
    path: '/cdc-debezium/sasl-scram/README.md',
    tags: ['cdc', 'debezium', 'sasl', 'scram', 'mysql']
  },
  // Search
  {
    title: 'Full-Text Search',
    description: 'Retrieve records matching keywords using BM25 scoring.',
    path: '/full-text-search/README.md',
    tags: ['search', 'bm25']
  },
  {
    title: 'Elasticsearch Full-Text and Vector Search',
    description:
      'Use Elasticsearch for both full-text and vector search. Available in Spice.ai Enterprise.',
    path: '/search/elasticsearch/README.md',
    tags: ['search', 'elasticsearch', 'enterprise']
  },
  // Data Connectors
  {
    title: 'PostgreSQL Connector',
    description: 'Connect to and query PostgreSQL databases.',
    path: '/postgres/connector/README.md',
    tags: ['connector', 'postgresql', 'query']
  },
  {
    title: 'AWS RDS PostgreSQL',
    description: 'Connect to AWS RDS PostgreSQL instances.',
    path: '/postgres/rds/README.md',
    tags: ['connector', 'aws', 'rds', 'postgresql']
  },
  {
    title: 'Supabase PostgreSQL',
    description: 'Connect to Supabase PostgreSQL databases.',
    path: '/postgres/supabase/README.md',
    tags: ['connector', 'supabase', 'postgresql']
  },
  {
    title: 'MySQL Connector',
    description: 'Connect to and query MySQL databases.',
    path: '/mysql/connector/README.md',
    tags: ['connector', 'mysql', 'query']
  },
  {
    title: 'AWS RDS Aurora MySQL',
    description: 'Connect to AWS RDS Aurora with MySQL compatibility.',
    path: '/mysql/rds-aurora/README.md',
    tags: ['connector', 'aws', 'rds', 'aurora', 'mysql']
  },
  {
    title: 'PlanetScale MySQL',
    description: 'Connect to PlanetScale MySQL databases.',
    path: '/mysql/planetscale/README.md',
    tags: ['connector', 'planetscale', 'mysql']
  },
  {
    title: 'ClickHouse Connector',
    description: 'Connect to and query ClickHouse databases.',
    path: '/clickhouse/README.md',
    tags: ['connector', 'clickhouse', 'query']
  },
  {
    title: 'Databricks Connector',
    description: 'Connect to and query Databricks instances using Delta Lake or Spark Connect.',
    path: '/databricks/README.md',
    tags: ['connector', 'databricks', 'delta', 'lake', 'spark', 'connect']
  },
  {
    title: 'Delta Lake Connector',
    description: 'Query data from Delta Lake tables.',
    path: '/delta-lake/README.md',
    tags: ['connector', 'delta', 'lake']
  },
  {
    title: 'Dremio Connector',
    description: 'Connect to and query a self-hosted Dremio instance running in Docker.',
    path: '/dremio/README.md',
    tags: ['connector', 'dremio', 'query']
  },
  {
    title: 'DuckDB Connector',
    description: 'Query DuckDB databases with sample TPCH data.',
    path: '/duckdb/connector/README.md',
    tags: ['connector', 'duckdb', 'query']
  },
  {
    title: 'DynamoDB Connector',
    description: 'Query data from an AWS-hosted DynamoDB table.',
    path: '/dynamodb/README.md',
    tags: ['connector', 'aws', 'dynamodb']
  },
  {
    title: 'Elasticsearch Connector',
    description:
      'Query Elasticsearch indices using federated SQL. Available in Spice.ai Enterprise.',
    path: '/elasticsearch/connector/README.md',
    tags: ['connector', 'elasticsearch', 'enterprise']
  },
  {
    title: 'File Connector',
    description: 'Query data from local files.',
    path: '/file/README.md',
    tags: ['connector', 'file', 'query']
  },
  {
    title: 'FTP Connector',
    description: 'Query data from FTP and SFTP servers.',
    path: '/ftp/README.md',
    tags: ['connector', 'ftp', 'query']
  },
  {
    title: 'GitHub Connector',
    description: 'Connect to and query GitHub data.',
    path: '/github/README.md',
    tags: ['connector', 'github', 'query'],
    videoUrl: 'https://youtu.be/mxwt0HEF1VQ'
  },
  {
    title: 'GraphQL Connector',
    description: 'Query data from GraphQL endpoints.',
    path: '/graphql/README.md',
    tags: ['connector', 'graphql', 'query']
  },
  {
    title: 'HTTP Connector',
    description: 'Query data from HTTP(S) endpoints, such as REST APIs.',
    path: '/http/README.md',
    tags: ['connector', 'http', 'api']
  },
  {
    title: 'MSSQL Connector',
    description: 'Connect to and query across multiple Microsoft SQL Server instances.',
    path: '/mssql/README.md',
    tags: ['connector', 'mssql', 'query']
  },
  {
    title: 'ODBC Connector',
    description: 'Connect to databases using ODBC. Available in Spice.ai Enterprise.',
    path: '/odbc/README.md',
    tags: ['connector', 'odbc', 'query', 'enterprise']
  },
  {
    title: 'Oracle Connector',
    description: 'Connect to and accelerate data from Oracle databases.',
    path: '/oracle/README.md',
    tags: ['connector', 'oracle', 'query']
  },
  {
    title: 'Amazon Redshift',
    description: 'Read and write TPC-H data with Amazon Redshift.',
    path: '/redshift/README.md',
    tags: ['connector', 'aws', 'redshift']
  },
  {
    title: 'Glue Connector',
    description: 'Query tables in an AWS Glue Data Catalog.',
    path: '/glue/README.md',
    tags: ['connector', 'aws', 'glue']
  },
  {
    title: 'S3 Connector',
    description: 'Query data from S3 compatible storage.',
    path: '/s3/README.md',
    tags: ['connector', 's3', 'query']
  },
  {
    title: 'ScyllaDB Connector',
    description: 'Query ScyllaDB clusters using federated SQL. Available in Spice.ai Enterprise.',
    path: '/scylladb/README.md',
    tags: ['connector', 'scylladb', 'enterprise']
  },
  {
    title: 'SharePoint Connector',
    description: 'Connect to SharePoint and OneDrive for Business.',
    path: '/sharepoint/README.md',
    tags: ['connector', 'sharepoint', 'onedrive']
  },
  {
    title: 'SMB Connector',
    description: 'Query data files on SMB network shares.',
    path: '/smb/README.md',
    tags: ['connector', 'smb', 'query']
  },
  {
    title: 'Snowflake Connector',
    description: 'Connect to and query Snowflake databases.',
    path: '/snowflake/README.md',
    tags: ['connector', 'snowflake', 'query']
  },
  {
    title: 'Snowflake DML',
    description: 'Ingest data from an HTTP API and write it to a Snowflake table with INSERT.',
    path: '/snowflake/dml/README.md',
    tags: ['connector', 'snowflake', 'dml']
  },
  {
    title: 'Spice.ai Cloud Connector',
    description: 'Connect to the Spice.ai Cloud Platform.',
    path: '/spiceai/README.md',
    tags: ['connector', 'spiceai', 'cloud']
  },
  {
    title: 'Apache Spark Connector',
    description: 'Connect to and query Apache Spark.',
    path: '/spark/README.md',
    tags: ['connector', 'apache', 'spark', 'query']
  },
  {
    title: 'IMAP Emails',
    description: 'Federated SQL query of mail across IMAP email servers.',
    path: '/imap/README.md',
    tags: ['connector', 'imap', 'datasource']
  },
  {
    title: 'MongoDB Connector',
    description: 'Connect to and query MongoDB databases.',
    path: '/mongodb/connector/README.md',
    tags: ['connector', 'mongodb', 'datasource']
  },
  {
    title: 'Live Orders Analytics with Apache Kafka Data Connector',
    description: 'Combine real-time data streaming from Kafka with other datasets using Spice.',
    path: '/kafka/README.md',
    tags: ['connector', 'apache', 'kafka', 'datasource']
  },
  // Catalog Connectors
  {
    title: 'Spice.ai Cloud Platform Catalog',
    description: 'Connect to the Spice.ai Cloud Platform catalog.',
    path: '/catalogs/spiceai/README.md',
    tags: ['catalog', 'spiceai', 'cloud']
  },
  {
    title: 'Databricks Unity Catalog',
    description: 'Connect to Databricks Unity catalog.',
    path: '/catalogs/databricks/README.md',
    tags: ['catalog', 'databricks', 'unity']
  },
  {
    title: 'Unity Catalog',
    description: 'Connect to an open-source Unity Catalog instance.',
    path: '/catalogs/unity_catalog/README.md',
    tags: ['catalog', 'unity']
  },
  {
    title: 'Iceberg Catalog Connector',
    description: 'Connect to Iceberg catalog with support for reading and writing Iceberg tables.',
    path: '/catalogs/iceberg/README.md',
    tags: ['catalog', 'iceberg']
  },
  {
    title: 'Iceberg Hadoop Catalog',
    description: 'Connect to Iceberg Hadoop catalogs, locally or on S3-compatible object storage.',
    path: '/catalogs/iceberg-hadoop/README.md',
    tags: ['catalog', 'iceberg', 'hadoop']
  },
  {
    title: 'AWS Glue Catalog',
    description: 'Query tables registered in an AWS Glue Data Catalog.',
    path: '/catalogs/glue/README.md',
    tags: ['catalog', 'aws', 'glue']
  },
  {
    title: 'DuckLake Catalog',
    description: 'Discover and query all schemas and tables in a DuckLake catalog.',
    path: '/catalogs/ducklake/README.md',
    tags: ['catalog', 'ducklake']
  },
  {
    title: 'PostgreSQL Catalog',
    description: 'Discover and query all schemas and tables in a PostgreSQL database.',
    path: '/catalogs/postgres/README.md',
    tags: ['catalog', 'postgresql']
  },
  {
    title: 'MySQL Catalog',
    description: 'Discover and query all databases and tables in a MySQL server.',
    path: '/catalogs/mysql/README.md',
    tags: ['catalog', 'mysql']
  },
  {
    title: 'Microsoft SQL Server Catalog',
    description: 'Discover and query all schemas and tables in a SQL Server database.',
    path: '/catalogs/mssql/README.md',
    tags: ['catalog', 'mssql']
  },
  // Visualization
  {
    title: 'Sales BI with Apache Superset',
    description: 'Visualize data in Spice with Apache Superset.',
    path: '/sales-bi/README.md',
    tags: ['visualization', 'bi', 'superset']
  },
  {
    title: 'Grafana Datasource',
    description: 'Add Spice as a Grafana datasource.',
    path: '/grafana-datasource/README.md',
    tags: ['visualization', 'grafana', 'datasource']
  },

  // Deployment
  {
    title: 'Deploying to Kubernetes',
    description: 'Deploy Spice.ai on Kubernetes using the Helm chart.',
    path: '/kubernetes/README.md',
    tags: ['deployment', 'kubernetes']
  },
  {
    title: 'Running in Docker',
    description: 'Run Spice.ai in Docker containers.',
    path: '/docker/README.md',
    tags: ['deployment', 'docker']
  },
  {
    title: 'Sidecar Deployment Architecture',
    description: 'Run Spice alongside the application on the same host for low-latency access.',
    path: '/architectures/sidecar/README.md',
    tags: ['deployment', 'architecture']
  },
  {
    title: 'Microservice Deployment Architecture',
    description:
      'Run Spice as an independent service, optionally with replicas behind a load balancer.',
    path: '/architectures/microservice/README.md',
    tags: ['deployment', 'architecture']
  },
  {
    title: 'Cloud Connect on a Development Machine',
    description:
      'Connect a local Spice instance to Spice Cloud, deploy changes without restarting, and deliver secrets.',
    path: '/cloud-connect-dev/README.md',
    tags: ['deployment', 'cloud']
  },

  // Performance
  {
    title: 'TPC-H Benchmarking',
    description: 'Load TPC-H benchmark data and run the benchmark queries.',
    path: '/tpc-h/README.md',
    tags: ['performance', 'benchmarking', 'tpc-h']
  },
  {
    title: 'SQL Results Caching',
    description: 'Cache query results in memory for faster repeated queries.',
    path: '/caching/sql_results/README.md',
    tags: ['performance', 'caching']
  },
  {
    title: 'Caching Accelerator',
    description: 'Cache HTTP-based datasets with stale-while-revalidate (SWR) support.',
    path: '/caching/accelerator/README.md',
    tags: ['performance', 'caching', 'http']
  },
  {
    title: 'Indexes on Accelerated Data',
    description: 'Create and manage indexes on accelerated data.',
    path: '/acceleration/indexes/README.md',
    tags: ['performance', 'indexes', 'acceleration']
  },

  // Configuration
  {
    title: 'Data Retention Policy',
    description: 'Evict accelerated data older than a specified duration.',
    path: '/retention/README.md',
    tags: ['configuration', 'retention']
  },
  {
    title: 'Refresh Data Window',
    description: 'Refresh only recent data into accelerated datasets.',
    path: '/refresh-data-window/README.md',
    tags: ['configuration', 'refresh']
  },
  {
    title: 'Advanced Data Refresh',
    description: 'Advanced configuration for data refresh.',
    path: '/acceleration/data-refresh/README.md',
    tags: ['configuration', 'data', 'refresh']
  },
  {
    title: 'Data Quality with Constraints',
    description: 'Enforce data quality constraints on accelerated datasets.',
    path: '/acceleration/constraints/README.md',
    tags: ['configuration', 'data', 'quality', 'constraints']
  },
  {
    title: 'Cron Dataset Schedules',
    description: 'Schedule dataset refreshes using cron syntax.',
    path: '/acceleration/cron/README.md',
    tags: ['configuration', 'scheduling', 'refresh']
  },

  // Client SDKs
  {
    title: 'Rust SDK',
    description: 'Query Spice.ai using the Rust SDK.',
    path: '/client-sdk/spice-rs-sdk-sample/README.md',
    tags: ['sdk', 'rust']
  },
  {
    title: 'Python SDK',
    description: 'Query Spice.ai using the Python SDK.',
    path: '/client-sdk/spicepy-sdk-sample/README.md',
    tags: ['sdk', 'python']
  },
  {
    title: 'Go SDK',
    description: 'Query Spice.ai using the Go SDK.',
    path: '/client-sdk/gospice-sdk-sample/README.md',
    tags: ['sdk', 'go']
  },
  {
    title: 'Spice.js JavaScript (Node.js) SDK',
    description: 'Query Spice.ai using the JavaScript (Node.js) SDK with examples.',
    path: '/client-sdk/spice.js-sdk-sample/README.md',
    tags: ['sdk', 'javascript']
  },
  {
    title: 'Java SDK',
    description: 'Query Spice.ai using the Java SDK.',
    path: '/client-sdk/spice-java-sdk-sample/README.md',
    tags: ['sdk', 'java']
  },
  {
    title: '.NET SDK',
    description: 'Query Spice.ai from C# using the .NET SDK.',
    path: '/client-sdk/spice-dotnet-sdk-sample/README.md',
    tags: ['sdk', 'dotnet', 'csharp']
  },
  // Clients
  {
    title: 'Python ADBC Client',
    description: 'Query Spice using ADBC and Parameterized Queries with Python.',
    path: '/clients/adbc/README.md',
    tags: ['client', 'python', 'adbc', 'parameterized queries']
  },
  {
    title: 'Java JDBC Client',
    description: 'Query Spice.ai using the Java JDBC client.',
    path: '/clients/java/README.md',
    tags: ['client', 'java', 'jdbc']
  },
  {
    title: 'Scala JDBC Client',
    description: 'Query Spice.ai using the Scala JDBC client.',
    path: '/clients/scala/README.md',
    tags: ['client', 'scala', 'jdbc']
  },
  {
    title: 'cURL with Spice.ai Cloud',
    description: 'Run SQL against Spice.ai Cloud over HTTP using cURL.',
    path: '/client-sdk/curl-sample/README.md',
    tags: ['client', 'curl', 'cloud']
  },
  {
    title: 'Spice CLI with Spice.ai Cloud',
    description: 'Run SQL against Spice.ai Cloud using the Spice CLI.',
    path: '/client-sdk/spice-cli-sample/README.md',
    tags: ['client', 'cli', 'cloud']
  },
  // Security
  {
    title: 'TLS Encryption',
    description: 'Enable encryption in transit using TLS.',
    path: '/tls/README.md',
    tags: ['security', 'tls']
  },
  {
    title: 'API Key Authentication',
    description: 'Secure access with API key authentication.',
    path: '/api_key/README.md',
    tags: ['security', 'api', 'key']
  },
  {
    title: 'Mutual TLS (mTLS)',
    description:
      'Authenticate clients with certificates using mutual TLS. Available in Spice.ai Enterprise.',
    path: '/mtls/README.md',
    tags: ['security', 'mtls', 'enterprise']
  },
  {
    title: 'Authorization',
    description:
      'Add multi-tenancy, row-level security, PII masking, and RBAC with Cedar policies. Available in Spice.ai Enterprise.',
    path: '/authorization/README.md',
    tags: ['security', 'authorization', 'enterprise']
  },

  // Advanced
  {
    title: 'Local Dataset Replication',
    description: 'Link datasets in a parent/child relationship within the current Spicepod.',
    path: '/localpod/README.md',
    tags: ['advanced', 'replication', 'dataset']
  },
  {
    title: 'Distributed Query',
    description: 'Run queries across multiple nodes using schedulers and executors.',
    path: '/distributed/README.md',
    tags: ['advanced', 'distributed', 'cluster']
  },
  {
    title: 'JSON Strings',
    description: 'Work with JSON strings using JSON functions.',
    path: '/json_strings/README.md',
    tags: ['advanced', 'json', 'sql']
  }
]

const RecipeGroup: React.FC<{ recipes: RecipeData[] }> = ({ recipes }) => {
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-sm mx-auto'
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto'
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

  return (
    <section className='mx-auto px-6 md:max-w-[1020px] md:px-0'>
      <div className={`grid gap-4 ${getGridClass(recipes.length)}`}>
        {recipes.map((recipe, index) => (
          <div key={index} className='h-full'>
            <Recipe
              title={recipe.title}
              description={recipe.description}
              href={recipeBaseUrl + recipe.path}
              videoUrl={recipe.videoUrl}
              className='h-full px-4 py-4 text-xs gap-4 md:gap-8 md:px-8 md:py-8'
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export function CookbookPage() {
  const filterByTag = (...tags: string[]) =>
    recipes.filter((r) => r.tags.some((t) => tags.includes(t)))

  const description = `${recipes.length} guides and samples to help you build data-grounded AI apps and agents with Spice.ai Open-Source. Find ready-to-use examples for data acceleration, AI agents, LLM memory, and more.`

  return (
    <div className='tailwind font-sans'>
      <Title as='h1' variant='large' className='mx-auto mb-7 mt-8 md:text-center xl:max-w-[1020px]'>
        🧑‍🍳 Spice.ai OSS <span className='text-primary'>Cookbook</span>
      </Title>

      <Paragraph className='mb-6 md:text-center mx-auto px-6 md:max-w-[843px]'>
        {description}
      </Paragraph>

      <Paragraph className='mb-6 md:text-center mx-auto px-6 md:max-w-[843px] hover:underline'>
        <Link
          className='inline-flex gap-1.5'
          target='_blank'
          href='https://github.com/spiceai/cookbook/blob/trunk/README.md'
        >
          <Icon iconName='github' /> Contribute to the Cookbook on GitHub!
        </Link>
      </Paragraph>

      <Container className='mt-6 mb-20'>
        <Title className='mb-14 text-center'>Featured Recipes</Title>

        <section className='mx-auto px-6 md:max-w-[843px] md:px-0'>
          <div className='flex flex-col gap-6 md:flex-row'>
            <div className='flex w-full flex-col gap-6 md:w-1/2'>
              <Recipe
                title='Federated SQL Query'
                description='Join S3 and PostgreSQL data in one SQL query.'
                href={`${recipeBaseUrl}/federation/README.md`}
              />
              <Recipe
                title='Run Llama3 Locally'
                description='Use Llama models from HuggingFace with Spice.'
                href={`${recipeBaseUrl}/llama/README.md`}
                videoUrl='https://youtu.be/I2i6uZKBbd4'
              />
            </div>
            <div className='flex w-full flex-col gap-6 md:w-1/2 md:pt-20'>
              <Recipe
                title='Data Acceleration with Cayenne'
                description='Speed up queries using Cayenne.'
                href={`${recipeBaseUrl}/cayenne/README.md`}
              />
              <Recipe
                title='LLM Memory'
                description='Persistent memory for language models'
                href={`${recipeBaseUrl}/llm-memory/README.md`}
                videoUrl='https://youtu.be/uc8TCAPu1IM'
              />
            </div>
          </div>
        </section>
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Sample Applications and Guides</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Example apps and guides for real-world Spice.ai usage and best practices.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('sample', 'guide')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Core Features</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Start with the core capabilities: federated SQL query, data acceleration, async queries,
          hybrid search, and AI inference in SQL.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('core')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Models, AI, and Agents</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Connect to hosted and local AI models, and build intelligent agents using Spice.ai.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('ai')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>
          Data Acceleration, Materialization, and Federation
        </Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Optimize query performance with local acceleration, data materialization, and federation
          techniques.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('acceleration')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Change Data Capture (CDC)</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Stream inserts, updates, and deletes from source databases to keep accelerated datasets
          current.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('cdc')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Search & Embeddings</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Search data with full-text, vector, and hybrid search, using embeddings and vector
          engines.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('search')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Data Connectors</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Connect to databases, data warehouses, data lakes, and APIs, and query them with SQL.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('connector')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Catalog Connectors</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Connect to data catalogs to discover and query their tables.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('catalog')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Visualization</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Visualize data with BI and analytics tools.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('visualization')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>API Clients</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Use API clients for data access and integration.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('client')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Deployment</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Deploy Spice.ai in different environments.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('deployment')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Performance and Benchmarking</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Measure and optimize performance with benchmarks and best practices for your Spice.ai
          deployment.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('performance')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Configuration</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Configure data refresh, retention, scheduling, and data quality for accelerated
          datasets.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('configuration')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>SDKs</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Use SDKs for different programming languages.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('sdk')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Security</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Secure your Spice.ai deployment and data access with encryption, authentication, and
          authorization.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('security')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Advanced Topics</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Replicate datasets locally, distribute queries across nodes, and work with JSON data.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('advanced')} />
      </Container>
    </div>
  )
}
