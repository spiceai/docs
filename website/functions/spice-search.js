const TARGET_URL = 'https://data.spiceai.io/v1/search'

async function readJson(request) {
  try {
    return await request.json()
  } catch (error) {
    throw new Response('Invalid JSON body', { status: 400 })
  }
}

function buildErrorResponse(error) {
  if (error instanceof Response) {
    return error
  }
  return new Response('Unexpected server error', { status: 500 })
}

function resolveApiKey(env) {
  return env?.SPICEAI_API_KEY ?? process.env.SPICEAI_API_KEY
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' }
    })
  }

  const apiKey = resolveApiKey(env)
  if (!apiKey) {
    return new Response('Server misconfiguration: missing SPICEAI_API_KEY', {
      status: 500
    })
  }

  let payload
  try {
    payload = await readJson(request)
  } catch (error) {
    return error
  }

  try {
    const upstreamResponse = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    const responseBody = await upstreamResponse.text()
    const responseHeaders = new Headers()
    responseHeaders.set(
      'content-type',
      upstreamResponse.headers.get('content-type') ?? 'application/json'
    )
    responseHeaders.set('cache-control', 'no-store')

    return new Response(responseBody, {
      status: upstreamResponse.status,
      headers: responseHeaders
    })
  } catch (error) {
    return buildErrorResponse(error)
  }
}
