import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: 'doc',
      id: 'api/http/runtime',
    },
    {
      type: 'category',
      label: 'Datasets',
      items: [
        {
          type: 'doc',
          id: 'api/http/get-catalogs',
          label: 'List Catalogs',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/get-datasets',
          label: 'List Datasets',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/post-sample-dataset',
          label: 'Sample Dataset',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/http/patch-dataset-acceleration',
          label: 'Update Refresh SQL',
          className: 'api-method patch',
        },
        {
          type: 'doc',
          id: 'api/http/post-dataset-refresh',
          label: 'Refresh Dataset',
          className: 'api-method post',
        },
      ],
    },
    {
      type: 'category',
      label: 'AI',
      items: [
        {
          type: 'doc',
          id: 'api/http/post-chat-completions',
          label: 'Create Chat Completion',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/http/post-embeddings',
          label: 'Create Embeddings',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/http/get-models',
          label: 'List Models',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/get-model-predict',
          label: 'ML Prediction',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/post-batch-predict',
          label: 'Batch ML Predictions',
          className: 'api-method post',
        },
      ],
    },
    {
      type: 'category',
      label: 'Evaluations',
      items: [
        {
          type: 'doc',
          id: 'api/http/list',
          label: 'List Evals',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/post-eval',
          label: 'Run Eval',
          className: 'api-method post',
        },
      ],
    },
    {
      type: 'category',
      label: 'Iceberg',
      items: [
        {
          type: 'doc',
          id: 'api/http/get-config',
          label: 'Get Iceberg API config',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/get-iceberg-namespaces',
          label: 'List Iceberg namespaces',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/head-namespace',
          label: 'Check Namespace exists',
          className: 'api-method head',
        },
      ],
    },
    {
      type: 'category',
      label: 'SQL',
      items: [
        {
          type: 'doc',
          id: 'api/http/post-nsql',
          label: 'Text to SQL',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/http/post-search',
          label: 'Vector Search',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/http/post-sql',
          label: 'SQL Query',
          className: 'api-method post',
        },
      ],
    },
    {
      type: 'category',
      label: 'General',
      items: [
        {
          type: 'doc',
          id: 'api/http/generate-package',
          label: 'Zip Github source',
          className: 'api-method post',
        },
        {
          type: 'doc',
          id: 'api/http/get-spicepods',
          label: 'List Spicepods',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/get-status',
          label: 'Check Runtime Status',
          className: 'api-method get',
        },
      ],
    },
    {
      type: 'category',
      label: 'Ready',
      items: [
        {
          type: 'doc',
          id: 'api/http/ready',
          label: 'Check Readiness',
          className: 'api-method get',
        },
      ],
    },
    {
      type: 'category',
      label: 'Tools',
      items: [
        {
          type: 'doc',
          id: 'api/http/list',
          label: 'List Tools',
          className: 'api-method get',
        },
        {
          type: 'doc',
          id: 'api/http/post',
          label: 'Run Tool',
          className: 'api-method post',
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
