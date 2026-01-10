import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebarsCloud: SidebarsConfig = {
  cloud: [
    {
      type: 'doc',
      id: 'index',
      label: 'Welcome to Spice.ai Cloud'
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'getting-started/get-started/index',
          label: 'Getting Started'
        },
        'getting-started/get-started/portal-login',
        'getting-started/getting-started/portal-login-1',
        'getting-started/get-started/step-2-add-dataset-and-query-data',
        'getting-started/get-started/step-3-add-ai-model-and-chat-with-your-app',
        'getting-started/get-started/next-steps',
        'getting-started/faq'
      ]
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: true,
      items: [
        'features/federated-sql-query',
        {
          type: 'category',
          label: 'Data Acceleration',
          items: [
            'features/data-acceleration/index',
            'features/data-acceleration/in-memory-arrow-data-accelerator',
            'features/data-acceleration/duckdb-data-accelerator',
            'features/data-acceleration/postgresql-data-accelerator',
            'features/data-acceleration/sqlite-data-accelerator'
          ]
        },
        'features/search-and-retrieval',
        'features/ai-gateway',
        'features/semantic-models',
        'building-blocks/spice-models',
        {
          type: 'category',
          label: 'Observability',
          items: [
            'features/observability/index',
            'features/observability/task-history',
            'features/observability/zipkin'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Building Blocks',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Data Connectors',
          items: [
            'building-blocks/data-connectors/index',
            'building-blocks/data-connectors/abfs',
            'building-blocks/data-connectors/clickhouse',
            'building-blocks/data-connectors/databricks',
            'building-blocks/data-connectors/debezium',
            'building-blocks/data-connectors/delta-lake',
            'building-blocks/data-connectors/dremio',
            'building-blocks/data-connectors/duckdb',
            'building-blocks/data-connectors/dynamodb',
            'building-blocks/data-connectors/flightsql',
            'building-blocks/data-connectors/ftp',
            'building-blocks/data-connectors/github',
            'building-blocks/data-connectors/graphql',
            'building-blocks/data-connectors/https',
            'building-blocks/data-connectors/localpod',
            'building-blocks/data-connectors/memory',
            'building-blocks/data-connectors/mssql',
            'building-blocks/data-connectors/mysql',
            'building-blocks/data-connectors/odbc',
            'building-blocks/data-connectors/postgres',
            'building-blocks/data-connectors/s3',
            'building-blocks/data-connectors/sharepoint',
            'building-blocks/data-connectors/snowflake',
            'building-blocks/data-connectors/spark',
            'building-blocks/data-connectors/spiceai'
          ]
        },
        {
          type: 'category',
          label: 'Model Providers',
          items: [
            'building-blocks/model-providers/index',
            'building-blocks/model-providers/anthropic',
            'building-blocks/model-providers/azure',
            'building-blocks/model-providers/huggingface',
            'building-blocks/model-providers/openai',
            'building-blocks/model-providers/perplexity',
            'building-blocks/model-providers/spiceai',
            'building-blocks/model-providers/xai'
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'API',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'SQL Query API',
          items: [
            'api/sql-query/index',
            'api/sql-query/http-api',
            'api/sql-query/apache-arrow-flight-api'
          ]
        },
        'api/search',
        'api/openai-api',
        'api/health'
      ]
    },
    {
      type: 'category',
      label: 'Portal',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Playground',
          items: [
            'portal/playground/index',
            'portal/playground/sql-query-editor',
            'portal/playground/nsql-query',
            'portal/playground/ai-chat',
            'portal/playground/search'
          ]
        },
        'portal/organizations',
        {
          type: 'category',
          label: 'Apps',
          items: [
            'portal/apps/index',
            'portal/apps/api-keys',
            'portal/apps/secrets',
            'portal/apps/connect-github',
            'portal/apps/transfer',
            'portal/apps/runtime'
          ]
        },
        'portal/public-apps',
        {
          type: 'category',
          label: 'App Spicepod',
          items: [
            'portal/app-spicepod/index',
            'portal/app-spicepod/spicepod-configuration',
            'portal/app-spicepod/deployments',
            'portal/app-spicepod/spice-runtime-versions'
          ]
        },
        'portal/datasets-and-views',
        'portal/models',
        'portal/monitoring-and-request-logs',
        'portal/observability',
        {
          type: 'category',
          label: 'Profile',
          items: ['portal/profile/index', 'portal/profile/personal-access-tokens']
        },
        'portal/external-data-sources'
      ]
    },
    {
      type: 'category',
      label: 'Use-Cases',
      collapsed: true,
      items: [
        'use-cases/agentic-ai-apps',
        'use-cases/database-cdn',
        'use-cases/data-lakehouse',
        'use-cases/enterprise-search',
        'use-cases/enterprise-rag'
      ]
    },
    {
      type: 'category',
      label: 'SDKs',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Python SDK',
          items: ['sdks/python-sdk/index', 'sdks/python-sdk/streaming']
        },
        {
          type: 'category',
          label: 'Node.js SDK',
          items: [
            'sdks/node.js-sdk/index',
            'sdks/node.js-sdk/streaming',
            'sdks/node.js-sdk/api-reference'
          ]
        },
        'sdks/go',
        'sdks/rust-sdk/index',
        'sdks/dotnet-sdk',
        'sdks/java-sdk'
      ]
    },
    {
      type: 'category',
      label: 'Integrations',
      collapsed: true,
      items: ['integrations/github-copilot', 'integrations/grafana', 'integrations/databricks']
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Core Concepts',
          items: ['reference/core-concepts/index', 'reference/core-concepts/duration-literals']
        },
        {
          type: 'link',
          label: 'SQL Reference',
          href: '/docs/reference/sql'
        },
        'reference/release-notes'
      ]
    },
    'limitations',
    {
      type: 'category',
      label: 'Pricing',
      collapsed: true,
      items: ['pricing/plans', 'pricing/community']
    },
    {
      type: 'category',
      label: 'Support',
      collapsed: true,
      items: ['support/support']
    },
    {
      type: 'category',
      label: 'Security',
      collapsed: true,
      items: ['security/security', 'security/report']
    },
    {
      type: 'category',
      label: 'Legal',
      collapsed: true,
      items: ['legal/privacy', 'legal/terms', 'legal/terms-of-service', 'legal/eula']
    }
  ]
}

export default sidebarsCloud
