import { Title } from '../../atoms/title/title'
import { Feature } from '../../molecules/feature/feature'

export const Features = () => {
  return (
    <section className='mx-auto mt-20 px-6 md:max-w-[843px] md:px-0'>
      <Title className='mb-14'>
        Spice simplifies building AI apps and agents that work, by making it fast and easy to ground
        AI in data.
      </Title>

      <div className='flex flex-col gap-6 md:flex-row'>
        <div className='flex w-full flex-col gap-6 md:w-1/2'>
          <Feature
            title='Federated Data Access'
            description='SQL API to query structured and unstructed data across databases, data warehouses, and data lakes.'
            docsLink='https://docs.spiceai.org/features/query-federation'
          />
          <Feature
            title='AI Compute Engine'
            description='OpenAI-compatible API for local and hosted inference, search, memory, evals, and observability.'
            docsLink='https://docs.spiceai.org/features/large-language-models'
          />
        </div>
        <div className='flex w-full flex-col gap-6 md:w-1/2 md:pt-20'>
          <Feature
            title='Data Acceleration'
            description='Materialize data and content in DuckDB, SQLite, and PostgreSQL; in-memory or on disk. Results caching included.'
            docsLink='https://docs.spiceai.org/features/data-acceleration'
          />
          <Feature
            title='Self-Hostable and Open-Source'
            description='Self-hostable binary or Docker image, platform-agnostic, and Apache 2.0 licensed. Built on industry standard technologies including Apache DataFusion and Apache Arrow.'
            docsLink='https://github.com/spiceai/spiceai'
          />
        </div>
      </div>
    </section>
  )
}
