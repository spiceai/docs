import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/HTTP/runtime",
    },
    {
      type: "category",
      label: "Datasets",
      items: [
        {
          type: "doc",
          id: "api/HTTP/get-catalogs",
          label: "List Catalogs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/get-datasets",
          label: "List Datasets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/patch-dataset-acceleration",
          label: "Update Refresh SQL",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/HTTP/post-dataset-refresh",
          label: "Refresh Dataset",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "AI",
      items: [
        {
          type: "doc",
          id: "api/HTTP/post-chat-completions",
          label: "Create Chat Completion",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/HTTP/post-embeddings",
          label: "Create Embeddings",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/HTTP/get-models",
          label: "List Models",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/get-model-predict",
          label: "ML Prediction",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/post-batch-predict",
          label: "Batch ML Predictions",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Evaluations",
      items: [
        {
          type: "doc",
          id: "api/HTTP/list",
          label: "List Evals",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/post-eval",
          label: "Run Eval",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Iceberg",
      items: [
        {
          type: "doc",
          id: "api/HTTP/get-config",
          label: "Get Iceberg API config",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/get-iceberg-namespaces",
          label: "List Iceberg namespaces",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/head-namespace",
          label: "Check Namespace exists",
          className: "api-method head",
        },
      ],
    },
    {
      type: "category",
      label: "SQL",
      items: [
        {
          type: "doc",
          id: "api/HTTP/post-nsql",
          label: "Text to SQL",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/HTTP/post-search",
          label: "Search",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/HTTP/post-sql",
          label: "SQL Query",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "General",
      items: [
        {
          type: "doc",
          id: "api/HTTP/generate-package",
          label: "Generate Package",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/HTTP/get-spicepods",
          label: "List Spicepods",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/get-status",
          label: "Check Runtime Status",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Ready",
      items: [
        {
          type: "doc",
          id: "api/HTTP/ready",
          label: "Check Readiness",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Tools",
      items: [
        {
          type: "doc",
          id: "api/HTTP/list",
          label: "List Tools",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/HTTP/post",
          label: "Run Tool",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
