export type UseCaseData = {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

export const dataUseCases: UseCaseData[] = [
  {
    title: 'Agent data serving',
    description:
      'Give each agent accelerated, isolated access to only the data it needs, with search and tools built in. Agents query a replica kept current through CDC, not production databases.',
    buttonText: 'Agent data serving',
    buttonLink: 'https://docs.spiceai.org/docs/use-cases/ai/agentic-apps'
  },
  {
    title: 'Query across sources without ETL',
    description:
      'Federated SQL across operational databases, warehouses, APIs, and more. Accelerate the hot path with fewer pipelines to build and maintain.',
    buttonText: 'Query without ETL',
    buttonLink: 'https://docs.spiceai.org/docs/use-cases/data/etl-free-workflows'
  },
  {
    title: 'Real-time analytics on operational data',
    description:
      'Replicate changes from operational databases to an isolated analytics replica via high-throughput CDC, so agents run large analytical queries against near real-time data.',
    buttonText: 'Real-time analytics',
    buttonLink: 'https://docs.spiceai.org/docs/use-cases/data/database-cdn'
  },
  {
    title: 'Per-tenant agent standardization',
    description:
      'Standardize deployments for every tenant, so adding a customer is a configuration change instead of new data infrastructure, with configurable isolation per tenant.',
    buttonText: 'Per-tenant standardization',
    buttonLink: 'https://docs.spiceai.org/docs/use-cases/ai/multi-tenant-agents'
  }
]
