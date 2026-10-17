// Markdown content negotiation for agents, as described in
// https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/. A request whose
// Accept header prefers text/markdown receives the Markdown file that
// @signalwire/docusaurus-plugin-llms-txt generates next to each page at build time
// (/docs/foo -> /docs/foo.md, / -> /index.md). Browsers keep receiving HTML.
//
// This middleware also sets the homepage Link headers (RFC 8288). They are not in static/_headers
// because a _headers Link rule replaces the preconnect Link headers that Pages generates for Early
// Hints. static/_routes.json keeps static assets from invoking this middleware.

const HOMEPAGE_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
  '</docs/api>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</index.md>; rel="alternate"; type="text/markdown"'
]

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url)

  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    prefersMarkdown(request.headers.get('Accept'))
  ) {
    const markdown = await fetchMarkdown(env, url)
    if (markdown) {
      return markdownResponse(request, url, markdown)
    }
  }

  const response = await next()
  if (!(response.headers.get('Content-Type') || '').startsWith('text/html')) {
    return response
  }

  // The same URL serves HTML or Markdown, so caches must keep the two apart.
  const html = new Response(response.body, response)
  html.headers.append('Vary', 'Accept')
  if (url.pathname === '/') {
    appendHomepageLinks(html.headers)
  }
  return html
}

// Returns true when the Accept header lists text/markdown at a quality at least as high as HTML.
function prefersMarkdown(accept) {
  if (!accept) {
    return false
  }

  const quality = new Map()
  for (const part of accept.toLowerCase().split(',')) {
    const [range, ...params] = part.split(';').map((value) => value.trim())
    const q = params.find((param) => param.startsWith('q='))
    const value = q ? Number.parseFloat(q.slice(2)) : 1
    quality.set(range, Math.max(quality.get(range) ?? 0, Number.isFinite(value) ? value : 0))
  }

  const markdown = quality.get('text/markdown') ?? 0
  const html = quality.get('text/html') ?? quality.get('text/*') ?? quality.get('*/*') ?? 0
  return markdown > 0 && markdown >= html
}

// Returns the Markdown version of a page, or null when the page has none.
async function fetchMarkdown(env, url) {
  const path = url.pathname === '/' ? '/index.md' : `${url.pathname.replace(/\/+$/, '')}.md`
  try {
    const response = await env.ASSETS.fetch(new URL(path, url))
    const contentType = response.headers.get('Content-Type') || ''
    return response.ok && contentType.startsWith('text/markdown') ? response : null
  } catch {
    return null
  }
}

async function markdownResponse(request, url, asset) {
  const body = await asset.text()
  const headers = new Headers(asset.headers)
  headers.delete('Content-Encoding')
  headers.delete('Content-Length')
  headers.set('Content-Type', 'text/markdown; charset=utf-8')
  headers.append('Vary', 'Accept')
  // An estimate of four characters per token.
  headers.set('x-markdown-tokens', String(Math.ceil(body.length / 4)))
  if (url.pathname === '/') {
    appendHomepageLinks(headers)
  }
  return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers })
}

function appendHomepageLinks(headers) {
  for (const link of HOMEPAGE_LINKS) {
    headers.append('Link', link)
  }
}
