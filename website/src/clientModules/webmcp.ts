// Registers WebMCP tools (https://webmachinelearning.github.io/webmcp/) that help AI agents in the
// browser search the documentation and read pages as Markdown. Browsers without WebMCP skip this.
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
import siteConfig from '@generated/docusaurus.config'

interface ToolExecuteOptions {
  signal?: AbortSignal
}

interface ModelContextTool {
  name: string
  title?: string
  description: string
  inputSchema?: object
  annotations?: { readOnlyHint?: boolean }
  execute: (input: Record<string, unknown>, options?: ToolExecuteOptions) => Promise<unknown>
}

interface ModelContext {
  registerTool(tool: ModelContextTool): unknown
}

declare global {
  interface Document {
    modelContext?: ModelContext
  }
  interface Navigator {
    modelContext?: ModelContext
  }
}

interface SearchHit {
  url: string
  hierarchy?: Record<string, string | null>
  _snippetResult?: { content?: { value?: string } }
}

const algolia = siteConfig.themeConfig.algolia as {
  appId: string
  apiKey: string
  indexName: string
}
const latestDocsVersion = String(siteConfig.customFields?.latestDocsVersion ?? 'current')
const HIERARCHY_LEVELS = ['lvl0', 'lvl1', 'lvl2', 'lvl3', 'lvl4', 'lvl5', 'lvl6']

async function searchDocs(query: string, limit: number, signal?: AbortSignal) {
  const credentials = new URLSearchParams({
    'x-algolia-application-id': algolia.appId,
    'x-algolia-api-key': algolia.apiKey
  })
  const response = await fetch(
    `https://${algolia.appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(algolia.indexName)}/query?${credentials}`,
    {
      method: 'POST',
      // A CORS-safelisted content type avoids a preflight request, as Algolia's own client does.
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: JSON.stringify({
        query,
        hitsPerPage: Math.min(Math.max(Math.trunc(limit) || 5, 1), 20),
        facetFilters: [
          ['language:en'],
          [`docusaurus_tag:docs-default-${latestDocsVersion}`, 'docusaurus_tag:default']
        ],
        attributesToRetrieve: ['url', 'hierarchy'],
        attributesToSnippet: ['content:40'],
        snippetEllipsisText: '…'
      }),
      signal
    }
  )
  if (!response.ok) {
    throw new Error(`Search failed with HTTP ${response.status}.`)
  }

  const { hits } = (await response.json()) as { hits: SearchHit[] }
  return {
    results: hits.map((hit) => {
      const levels = HIERARCHY_LEVELS.map((level) => toText(hit.hierarchy?.[level]))
      const snippet = hit._snippetResult?.content?.value
      return {
        title: levels
          .filter((level, index) => level && level !== levels[index - 1])
          .join(' › '),
        url: hit.url,
        excerpt: snippet ? toText(snippet) : undefined
      }
    })
  }
}

// The index stores HTML-escaped text, and snippets wrap matches in highlight tags.
function toText(html: string | null | undefined) {
  if (!html) {
    return ''
  }
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
  return text.replace(/​/g, '').trim()
}

async function getPageMarkdown(page: string, signal?: AbortSignal) {
  const url = new URL(page, window.location.origin)
  if (url.origin !== window.location.origin) {
    throw new Error(`Only pages on ${window.location.origin} are available.`)
  }

  const response = await fetch(url, { headers: { Accept: 'text/markdown' }, signal })
  const contentType = response.headers.get('Content-Type') ?? ''
  if (!response.ok || !/^text\/(markdown|plain)/.test(contentType)) {
    throw new Error(`No Markdown version is available for ${url.pathname}.`)
  }
  return { url: url.href, markdown: await response.text() }
}

const tools: ModelContextTool[] = [
  {
    name: 'search_docs',
    title: 'Search Spice.ai docs',
    description:
      'Search the Spice.ai OSS documentation for the latest release. Returns matching sections with their titles, URLs, and excerpts. Use get_page_markdown to read a result in full.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search terms, for example "cayenne refresh mode".'
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 20,
          default: 5,
          description: 'Maximum number of results.'
        }
      },
      required: ['query']
    },
    annotations: { readOnlyHint: true },
    execute: ({ query, limit }, options) =>
      searchDocs(String(query), Number(limit ?? 5), options?.signal)
  },
  {
    name: 'get_page_markdown',
    title: 'Read a Spice.ai docs page',
    description:
      'Get a page of this site as Markdown, for example /docs/getting-started. /llms.txt lists every documentation page.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path or URL of a page on this site.'
        }
      },
      required: ['path']
    },
    annotations: { readOnlyHint: true },
    execute: ({ path }, options) => getPageMarkdown(String(path), options?.signal)
  }
]

async function registerTool(modelContext: ModelContext, tool: ModelContextTool) {
  try {
    // registerTool() returns a promise in the current specification; earlier builds return nothing.
    await modelContext.registerTool(tool)
  } catch (error) {
    console.warn(`WebMCP: could not register the ${tool.name} tool.`, error)
  }
}

if (ExecutionEnvironment.canUseDOM) {
  // Chrome builds before the current specification expose the API on navigator.
  const modelContext = document.modelContext ?? navigator.modelContext
  if (modelContext) {
    for (const tool of tools) {
      void registerTool(modelContext, tool)
    }
  }
}
