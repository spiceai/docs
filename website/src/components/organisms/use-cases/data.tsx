export type UseCaseData = {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

export const dataUseCases: UseCaseData[] = [
  {
    title: 'Agentic AI Applications',
    description:
      'Build data-grounded AI apps and agents with local or hosted models, LLM memory, evals, and observability.',
    buttonText: 'Try using the OpenAI SDK',
    buttonLink: 'https://github.com/spiceai/cookbook/blob/trunk/openai_sdk/README.md'
  },
  {
    title: 'Retrieval-Augmented Generation (RAG)',
    description:
      'Ensure AI is grounded in data with high-performance search and text-to-SQL, across a semantic knowledge layer.',
    buttonText: 'Try Text-to-SQL',
    buttonLink: 'https://github.com/spiceai/cookbook/blob/trunk/text-to-sql/README.md'
  },
  {
    title: 'Database CDN',
    description:
      'Co-locate working sets of data in Arrow, SQLite, and DuckDB with applications for fast, sub-second query.',
    buttonText: 'Try accelerating data with DuckDB',
    buttonLink: 'https://github.com/spiceai/cookbook/blob/trunk/duckdb/accelerator/README.md'
  },
  {
    title: 'Distributed Data Mesh',
    description:
      'Use SQL to query across databases, data warehouses, and data lakes with advanced federation.',
    buttonText: 'Try federated SQL Query',
    buttonLink: 'https://github.com/spiceai/cookbook/blob/trunk/federation/README.md'
  }
]
