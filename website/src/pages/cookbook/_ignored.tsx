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
    description: 'Query data from S3, PostgreSQL, and Dremio in a single query.',
    path: '/federation/README.md',
    tags: ['core', 'federation', 'sql']
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
    description: 'Analyze real-time data access patterns with Spice.ai.',
    path: '/guides/security-analyzer/README.md',
    tags: ['guide', 'security', 'analyzer']
  },
  // Models & AI
  {
    title: 'Azure OpenAI Models',
    description: 'Connect and use Azure OpenAI models with Spice.',
    path: '/azure_openai/README.md',
    tags: ['ai', 'openai', 'azure']
  },
  {
    title: 'Running Llama3 Locally',
    description: 'Use the Llama family of models locally from HuggingFace using Spice.',
    path: '/llama/README.md',
    tags: ['ai', 'llama', 'huggingface'],
    videoUrl: 'https://youtu.be/I2i6uZKBbd4'
  },
  {
    title: 'OpenAI SDK',
    description: 'Use the OpenAI SDK to connect to models hosted on Spice.',
    path: '/openai_sdk/README.md',
    tags: ['ai', 'openai', 'sdk', 'core']
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
    title: 'Nvidia NIM',
    description: 'Deploy Nvidia NIM infrastructure, on Kubernetes, with GPUs connected to Spice.',
    path: '/nvidia-nim/README.md',
    tags: ['ai', 'nvidia', 'nim']
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
    title: 'Model-Context-Protocol (MCP)',
    description: 'Use Spice to connect to or host MCP servers.',
    path: '/mcp/README.md',
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
    tags: ['core', 'acceleration', 'duckdb', 'data'],
    videoUrl: 'https://youtu.be/hFvVz5NGpaw'
  },
  {
    title: 'PostgreSQL Data Accelerator',
    description: 'Accelerate data locally using PostgreSQL.',
    path: '/postgres/accelerator/README.md',
    tags: ['acceleration', 'postgresql', 'data']
  },
  {
    title: 'SQLite Data Accelerator',
    description: 'Accelerate data locally using SQLite.',
    path: '/sqlite/accelerator/README.md',
    tags: ['acceleration', 'sqlite', 'data']
  },
  {
    title: 'Apache Arrow Data Accelerator',
    description: 'Accelerate data using Apache Arrow.',
    path: '/arrow/README.md',
    tags: ['acceleration', 'apache', 'arrow']
  },
  {
    title: 'Hashed Partitioning with DuckDB',
    description: 'Use hashed partitioning for performance with DuckDB.',
    path: '/duckdb/hashed-partitioning/README.md',
    tags: ['acceleration', 'duckdb', 'partitioning']
  },
  {
    title: 'Accelerated Views',
    description: 'Use view materialization for improved performance.',
    path: '/views/README.md',
    tags: ['acceleration', 'views']
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
    title: 'Clickhouse Connector',
    description: 'Connect to and query Clickhouse databases.',
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
    title: 'Debezium CDC from Postgres',
    description: 'Stream changes from PostgreSQL using Debezium CDC.',
    path: '/cdc-debezium/README.md',
    tags: ['connector', 'debezium', 'cdc', 'postgresql']
  },
  {
    title: 'Debezium CDC with SASL/SCRAM',
    description: 'Stream MySQL changes using Debezium with SASL/SCRAM authentication.',
    path: '/cdc-debezium/sasl-scram/README.md',
    tags: ['connector', 'debezium', 'cdc', 'sasl', 'scram', 'mysql']
  },
  {
    title: 'Dremio Connector',
    description: 'Connect to and query Dremio.',
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
    title: 'File Connector',
    description: 'Query data from local files.',
    path: '/file/README.md',
    tags: ['connector', 'file', 'query']
  },
  {
    title: 'FTP Connector',
    description: 'Query data from FTP servers.',
    path: '/ftp/README.md',
    tags: ['connector', 'ftp', 'query']
  },
  {
    title: 'GitHub Connector',
    description: 'Connect to and query GitHub data.',
    path: '/github/README.md',
    tags: ['connector', 'github', 'query'],
    videoUrl: 'https://youtu.be/mxwt0HEF1VQ',
  },
  {
    title: 'GraphQL Connector',
    description: 'Query data from GraphQL endpoints.',
    path: '/graphql/README.md',
    tags: ['connector', 'graphql', 'query']
  },
  {
    title: 'MSSQL Connector',
    description: 'Connect to Microsoft SQL Server databases.',
    path: '/mssql/README.md',
    tags: ['connector', 'mssql', 'query']
  },
  {
    title: 'ODBC Connector',
    description: 'Connect to databases using ODBC.',
    path: '/odbc/README.md',
    tags: ['connector', 'odbc', 'query']
  },
  {
    title: 'Oracle Connector',
    description: 'Connect to and query Oracle databases.',
    path: '/oracle/README.md',
    tags: ['connector', 'oracle', 'query']
  },
  {
    title: 'Glue Connector',
    description: 'Connect to AWS Glue.',
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
    title: 'SharePoint Connector',
    description: 'Connect to SharePoint and OneDrive for Business.',
    path: '/sharepoint/README.md',
    tags: ['connector', 'sharepoint', 'onedrive']
  },
  {
    title: 'Snowflake Connector',
    description: 'Connect to and query Snowflake databases.',
    path: '/snowflake/README.md',
    tags: ['connector', 'snowflake', 'query']
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
    description: 'Connect to Unity catalog.',
    path: '/catalogs/unity_catalog/README.md',
    tags: ['catalog', 'unity']
  },
  {
    title: 'Iceberg Catalog',
    description: 'Connect to Iceberg catalog.',
    path: '/catalogs/iceberg/README.md',
    tags: ['catalog', 'iceberg']
  },
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
  {
    title: 'IMAP Emails',
    description: 'Federated SQL query of mail across IMAP email servers',
    path: '/imap/README.md',
    tags: ['connector', 'imap', 'datasource']
  },
  // Deployment
  {
    title: 'Deploying to Kubernetes',
    description: 'Deploy Spice.ai on Kubernetes.',
    path: '/kubernetes/README.md',
    tags: ['deployment', 'kubernetes']
  },
  {
    title: 'Running in Docker',
    description: 'Run Spice.ai in Docker containers.',
    path: '/docker/README.md',
    tags: ['deployment', 'docker']
  },

  // Performance
  {
    title: 'TPC-H Benchmarking',
    description: 'Benchmark performance using TPC-H.',
    path: '/tpc-h/README.md',
    tags: ['performance', 'benchmarking', 'tpc-h']
  },
  {
    title: 'Results Caching',
    description: 'Cache query results for improved performance.',
    path: '/caching/README.md',
    tags: ['performance', 'caching']
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
    description: 'Configure data retention policies.',
    path: '/retention/README.md',
    tags: ['configuration', 'retention']
  },
  {
    title: 'Refresh Data Window',
    description: 'Configure data refresh windows.',
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
    description: 'Add data quality constraints.',
    path: '/acceleration/constraints/README.md',
    tags: ['configuration', 'data', 'quality', 'constraints']
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
    title: 'JavaScript SDK',
    description: 'Query Spice.ai using the JavaScript SDK.',
    path: '/client-sdk/spice.js-sdk-sample/README.md',
    tags: ['sdk', 'javascript']
  },
  {
    title: 'Java SDK',
    description: 'Query Spice.ai using the Java SDK.',
    path: '/client-sdk/spice-java-sdk-sample/README.md',
    tags: ['sdk', 'java']
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
    path: '/clients/jdbc/java/README.md',
    tags: ['client', 'java', 'jdbc']
  },
  {
    title: 'Scala JDBC Client',
    description: 'Query Spice.ai using the Scala JDBC client.',
    path: '/clients/jdbc/scala/README.md',
    tags: ['client', 'scala', 'jdbc']
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

  // Advanced
  {
    title: 'Local Dataset Replication',
    description: 'Link datasets in a parent/child relationship within the current Spicepod.',
    path: '/localpod/README.md',
    tags: ['advanced', 'replication', 'dataset']
  },
  {
    title: 'Cron Dataset Schedules',
    description: 'Schedule dataset refreshes using cron syntax.',
    path: '/cron-schedules/README.md',
    tags: ['configuration', 'scheduling', 'refresh']
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
                description='Join S3, PostgreSQL, and Dremio data in one SQL query.'
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
                title='Data Acceleration with DuckDB'
                description='Speed up queries using DuckDB.'
                href={`${recipeBaseUrl}/duckdb/accelerator/README.md`}
                videoUrl='https://youtu.be/hFvVz5NGpaw'
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

        <RecipeGroup recipes={filterByTag('sample')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Core Features</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Discover core capabilities like data federation, acceleration, search, and LLM inference
          to enhance your applications.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('core')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Models, AI, and Agents</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Integrate with popular AI models, LLMs, and build intelligent agents using Spice.ai.
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
        <Title className='mb-4 text-center'>Search & Embeddings</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Implement advanced search capabilities and leverage embeddings for vector similarity
          search.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('search')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Data Connectors</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Connect to various data sources and systems to query, analyze, and manage your data
          efficiently.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('connector')} />
      </Container>

      <Container className='mt-6 mb-20'>
        <Title className='mb-4 text-center'>Catalog Connectors</Title>
        <Paragraph className='mb-14 md:text-center mx-auto px-6 md:max-w-[843px]'>
          Connect to data catalogs to discover, manage, and utilize your data assets effectively.
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
          Fine-tune your Spice.ai deployment with advanced configuration options for optimal
          performance.
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
          Secure your Spice.ai deployment and data access with robust security practices and
          configurations.
        </Paragraph>

        <RecipeGroup recipes={filterByTag('security')} />
      </Container>
    </div>
  )
}
