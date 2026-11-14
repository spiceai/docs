import { Title } from '../../atoms/title/title'
import { Feature } from '../../molecules/feature/feature'

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#F37721',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

const FederationIcon = () => (
  <svg {...iconProps}>
    <path d='M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z' />
  </svg>
)

const AnalyticsIcon = () => (
  <svg {...iconProps}>
    <path d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' />
  </svg>
)

const SearchIcon = () => (
  <svg {...iconProps}>
    <path d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z' />
  </svg>
)

const InferenceIcon = () => (
  <svg {...iconProps}>
    <path d='M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z' />
  </svg>
)

export const Features = () => {
  return (
    <section className='mx-auto mt-20 px-6 md:max-w-[843px] md:px-0'>
      <Title className='mb-14'>
        Spice simplifies building high-throughput, data-intensive apps and agents that are simple to
        operate, from one deployment to thousands.
      </Title>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Feature
          icon={<FederationIcon />}
          title='SQL federation and acceleration'
          description='One SQL endpoint federates across databases, warehouses, data lakes, and APIs, with materialized, auto-refreshed datasets that accelerate the hot path.'
          docsLink='https://docs.spiceai.org/docs/features/query-federation'
        />
        <Feature
          icon={<SearchIcon />}
          title='Hybrid search'
          description='Vector, keyword, and full-text search in SQL with vector_search and text_search, fused into ranked results that ground agents in data.'
          docsLink='https://docs.spiceai.org/docs/features/search'
        />
        <Feature
          icon={<AnalyticsIcon />}
          title='Analytical query on operational data'
          description='Maintain an isolated replica of operational databases, kept current through high-throughput CDC, so agents run large analytical queries on near real-time data.'
          docsLink='https://docs.spiceai.org/docs/use-cases/data/database-cdn'
        />
        <Feature
          icon={<InferenceIcon />}
          title='AI gateway and SQL functions'
          description='An OpenAI-compatible gateway to local and hosted models, with AI SQL functions, MCP tools, memory, evals, and observability built into the runtime.'
          docsLink='https://docs.spiceai.org/docs/features/large-language-models'
        />
      </div>
    </section>
  )
}
