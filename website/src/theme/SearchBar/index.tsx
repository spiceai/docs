import '@docsearch/react/style'
import './styles.css'

import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DocSearchButton, useDocSearchKeyboardEvents } from '@docsearch/react'

import type { SpiceSearchThemeConfig } from '@site/src/types/spice-search'

type SearchStatus = 'idle' | 'loading' | 'success' | 'error'

type SpiceSearchMatch = {
  dataset: string
  score: number
  matches?: Record<string, unknown>
  metadata?: Record<string, unknown>
  data?: Record<string, unknown>
  primary_key?: Record<string, unknown>
}

type SpiceSearchResponse = {
  results: SpiceSearchMatch[]
  duration_ms: number
  answer?: SpiceSearchAnswerPayload | string | null
}

type SpiceSearchAnswerSource = {
  dataset?: string
  title?: string
  url?: string
  snippet?: string
  score?: number
}

type SpiceSearchAnswerPayload = {
  text?: string
  markdown?: string
  summary?: string
  answer?: string
  content?: string
  follow_ups?: string[]
  followUps?: string[]
  suggestions?: string[]
  sources?: SpiceSearchAnswerSource[]
  references?: SpiceSearchAnswerSource[]
  citations?: SpiceSearchAnswerSource[]
  [key: string]: unknown
}

type NormalizedAnswer = {
  text?: string
  sources: SpiceSearchAnswerSource[]
  followUps: string[]
}

const docSearchTranslations = {
  placeholder: 'Search docs',
  button: {
    buttonText: 'Search',
    buttonAriaLabel: 'Search'
  }
} as const

const MIN_QUERY_LENGTH = 2
const MAX_DISPLAY_RESULTS = 6

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function getFirstTextValue(map?: Record<string, unknown>): string | undefined {
  if (!map) {
    return undefined
  }
  for (const value of Object.values(map)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
    if (Array.isArray(value)) {
      const text = value.find((item) => typeof item === 'string' && item.trim())
      if (text) {
        return text.trim()
      }
    }
  }
  return undefined
}

function readField(result: SpiceSearchMatch, field?: string): string | undefined {
  if (!field) {
    return undefined
  }
  const sources: Array<Record<string, unknown> | undefined> = [
    result.matches,
    result.data,
    result.metadata
  ]
  for (const source of sources) {
    const value = source?.[field]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return undefined
}

function resolveUrl(result: SpiceSearchMatch, config?: SpiceSearchThemeConfig): string | undefined {
  const candidates = [
    readField(result, config?.resultUrlField),
    result.data?.url,
    result.metadata?.url,
    result.matches?.url
  ]
  return candidates.find(
    (candidate): candidate is string => isString(candidate) && candidate.length > 0
  )
}

function resolveTitle(result: SpiceSearchMatch, config?: SpiceSearchThemeConfig): string {
  return (
    readField(result, config?.resultTitleField) ??
    (result.metadata?.title as string | undefined) ??
    (result.data?.title as string | undefined) ??
    getFirstTextValue(result.matches) ??
    result.dataset
  )
}

function resolveDescription(
  result: SpiceSearchMatch,
  config?: SpiceSearchThemeConfig
): string | undefined {
  return (
    readField(result, config?.resultDescriptionField) ??
    (result.metadata?.description as string | undefined) ??
    (result.data?.description as string | undefined) ??
    getFirstTextValue(result.matches)
  )
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(handle)
  }, [value, delay])

  return debouncedValue
}

function normalizeAnswer(
  answer?: SpiceSearchAnswerPayload | string | null
): NormalizedAnswer | null {
  if (!answer) {
    return null
  }

  if (typeof answer === 'string') {
    const text = answer.trim()
    return text ? { text, sources: [], followUps: [] } : null
  }

  const textFieldCandidates = [
    answer.markdown,
    answer.text,
    answer.summary,
    answer.answer,
    answer.content
  ]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  const text = textFieldCandidates[0]

  const rawSourceList = (answer.sources ?? answer.references ?? answer.citations ?? []).filter(
    (source): source is SpiceSearchAnswerSource => !!source
  )

  const sources = rawSourceList
    .map((source) => ({
      dataset: isString(source.dataset) ? source.dataset : undefined,
      title: isString(source.title) ? source.title : undefined,
      url: isString(source.url) ? source.url : undefined,
      snippet: isString(source.snippet) ? source.snippet : undefined,
      score:
        typeof source.score === 'number'
          ? source.score
          : typeof source.score === 'string' && !Number.isNaN(Number(source.score))
            ? Number(source.score)
            : undefined
    }))
    .filter((source) => source.dataset || source.title || source.url || source.snippet)

  const followUps = (answer.follow_ups ?? answer.followUps ?? answer.suggestions ?? [])
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())

  if (!text && sources.length === 0 && followUps.length === 0) {
    return null
  }

  return {
    text,
    sources,
    followUps
  }
}

function SearchModal({
  config,
  isOpen,
  onClose,
  initialQuery,
  onInitialQueryConsumed
}: {
  config: SpiceSearchThemeConfig
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  onInitialQueryConsumed?: () => void
}): ReactNode {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<SpiceSearchMatch[]>([])
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [answer, setAnswer] = useState<NormalizedAnswer | null>(null)

  const debouncedQuery = useDebouncedValue(query, 150)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
      setStatus('idle')
      setDurationMs(null)
      setErrorMessage(null)
      setAnswer(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (initialQuery && !query) {
      setQuery(initialQuery)
      onInitialQueryConsumed?.()
    }
  }, [initialQuery, isOpen, onInitialQueryConsumed, query])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const trimmedQuery = debouncedQuery?.trim() ?? ''
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setStatus(trimmedQuery.length === 0 ? 'idle' : 'error')
      if (trimmedQuery.length === 0) {
        setErrorMessage(null)
      } else {
        setErrorMessage(`Enter at least ${MIN_QUERY_LENGTH} characters`)
      }
      setResults([])
      setDurationMs(null)
      setAnswer(null)
      return
    }

    if (!config.endpoint) {
      setStatus('error')
      setErrorMessage('Spice Search endpoint is not configured.')
      setResults([])
      setDurationMs(null)
      setAnswer(null)
      return
    }

    const controller = new AbortController()
    const fetchSearch = async () => {
      try {
        setStatus('loading')
        setErrorMessage(null)
        setAnswer(null)

        const payload: Record<string, unknown> = {
          text: trimmedQuery
        }

        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`Search failed (${response.status})`)
        }

        const json = (await response.json()) as SpiceSearchResponse
        const trimmedResults = (json.results ?? []).slice(0, MAX_DISPLAY_RESULTS)
        setResults(trimmedResults)
        setDurationMs(json.duration_ms ?? null)
        setAnswer(normalizeAnswer(json.answer))
        setStatus('success')
      } catch (error) {
        if (isAbortError(error)) {
          return
        }
        setResults([])
        setDurationMs(null)
        setStatus('error')
        setAnswer(null)
        setErrorMessage(error instanceof Error ? error.message : 'Unexpected search error')
      }
    }

    fetchSearch()
    return () => controller.abort()
  }, [config, debouncedQuery, isOpen, query])

  const summaryText = useMemo(() => {
    const trimmed = debouncedQuery?.trim() ?? ''
    if (!trimmed) {
      return 'Start typing to search Spice docs and blogs.'
    }
    if (status === 'loading') {
      return 'Searching Spice datasets...'
    }
    if (status === 'success') {
      const count = results.length
      const duration = durationMs ? `${durationMs} ms` : ''
      return `${count} result${count === 1 ? '' : 's'}${duration ? ` in ${duration}` : ''}`
    }
    if (status === 'error' && errorMessage) {
      return errorMessage
    }
    return undefined
  }, [debouncedQuery, durationMs, errorMessage, results.length, status])

  const firstResultUrl = useMemo(
    () => (results.length ? resolveUrl(results[0], config) : undefined),
    [config, results]
  )

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (firstResultUrl) {
        window.location.href = firstResultUrl
        onClose()
      }
    },
    [firstResultUrl, onClose]
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className='DocSearch DocSearch-Container' role='button' tabIndex={0} onClick={onClose}>
      <div className='DocSearch-Modal' onClick={(e) => e.stopPropagation()}>
        <header className='DocSearch-SearchBar'>
          <form className='DocSearch-Form' onSubmit={handleSubmit}>
            <label className='DocSearch-MagnifierLabel' htmlFor='docsearch-input' id='docsearch-label'>
              <svg width='20' height='20' className='DocSearch-Search-Icon' viewBox='0 0 20 20'>
                <path
                  d='M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z'
                  stroke='currentColor'
                  fill='none'
                  fillRule='evenodd'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </label>

            <input
              id='docsearch-input'
              className='DocSearch-Input'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
              placeholder={docSearchTranslations.placeholder}
              maxLength={64}
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />

            <button
              type='reset'
              title='Clear the query'
              className='DocSearch-Reset'
              hidden={!query}
              onClick={() => setQuery('')}
            >
              <svg width='20' height='20' viewBox='0 0 20 20'>
                <path
                  d='M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z'
                  stroke='currentColor'
                  fill='none'
                  fillRule='evenodd'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </form>

          <button className='DocSearch-Close' onClick={onClose}>
            <svg width='20' height='20' viewBox='0 0 20 20'>
              <path
                d='M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z'
                stroke='currentColor'
                fill='none'
                fillRule='evenodd'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </header>

        <div className='DocSearch-Dropdown'>
          {!query.trim() && (
            <div className='DocSearch-StartScreen'>
              <p className='DocSearch-Help'>Start typing to search Spice docs and blogs.</p>
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className='DocSearch-ErrorScreen'>
              <p className='DocSearch-Title'>Unable to search</p>
              <p className='DocSearch-Help'>{errorMessage}</p>
            </div>
          )}

          {answer && query.trim() && (
            <section className='DocSearch-Dropdown-Container' style={{ marginBottom: '1rem' }}>
              <div className='DocSearch-Hit'>
                <div className='DocSearch-Hit-Container' style={{ display: 'block', height: 'auto', padding: '1rem' }}>
                  <div className='DocSearch-Hit-content-wrapper' style={{ width: '100%' }}>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--docsearch-muted-color)', fontWeight: 600 }}>AI Answer</div>
                    {answer.text && (
                      <div className='DocSearch-Hit-title' style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', marginBottom: answer.sources.length > 0 ? '1rem' : 0 }}>
                        {answer.text}
                      </div>
                    )}
                    {answer.sources.length > 0 && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--docsearch-muted-color)', marginBottom: '0.5rem', fontWeight: 500 }}>Sources</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {answer.sources.map((source, index) => {
                            const key = `${source.url ?? source.title ?? source.dataset ?? 'source'}-${index}`
                            const label = source.title ?? source.url ?? source.dataset ?? `Result ${index + 1}`
                            const snippet = source.snippet?.trim()

                            return (
                              <div key={key} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--docsearch-footer-background)', borderRadius: '4px' }}>
                                {source.url ? (
                                  <a href={source.url} target='_blank' rel='noreferrer' style={{ color: 'var(--docsearch-highlight-color)', textDecoration: 'none', fontWeight: 500 }}>
                                    {label}
                                  </a>
                                ) : (
                                  <span style={{ fontWeight: 500, color: 'var(--docsearch-text-color)' }}>{label}</span>
                                )}
                                {snippet && (
                                  <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--docsearch-muted-color)' }}>{snippet}</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {status === 'success' && results.length === 0 && query.trim() && (
            <div className='DocSearch-NoResults'>
              <div className='DocSearch-Screen-Icon'>
                <svg width='40' height='40' viewBox='0 0 20 20' fill='none' fillRule='evenodd' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round'>
                  <path d='M15.5 4.8c2 3 1.7 7-1 9.7h0l4.3 4.3-4.3-4.3a7.8 7.8 0 01-9.8 1m-2.2-2.2A7.8 7.8 0 0113.2 2.4M2 18L18 2' />
                </svg>
              </div>
              <p className='DocSearch-Title'>No results for <q>{query}</q></p>
              <p className='DocSearch-Help'>Try refining your query or use different keywords.</p>
            </div>
          )}

          {status === 'success' && results.length > 0 && (
            <div className='DocSearch-Dropdown-Container'>
              <section className='DocSearch-Hits'>
                <div className='DocSearch-Hit-source'>Search Results</div>
                <ul role='listbox'>
                  {results.map((result, index) => {
                    const href = resolveUrl(result, config)
                    const description = resolveDescription(result, config)
                    const title = resolveTitle(result, config)

                    const hitContent = (
                      <>
                        <div className='DocSearch-Hit-icon'>
                          <svg width='20' height='20' viewBox='0 0 20 20'>
                            <path
                              d='M17 5H3h14zm0 5H3h14zm0 5H3h14z'
                              stroke='currentColor'
                              fill='none'
                              fillRule='evenodd'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                        <div className='DocSearch-Hit-content-wrapper'>
                          <span className='DocSearch-Hit-title'>{title}</span>
                          {description && (
                            <span className='DocSearch-Hit-path'>{description}</span>
                          )}
                        </div>
                        <div className='DocSearch-Hit-action'>
                          <svg className='DocSearch-Hit-Select-Icon' width='20' height='20' viewBox='0 0 20 20'>
                            <g stroke='currentColor' fill='none' fillRule='evenodd' strokeLinecap='round' strokeLinejoin='round'>
                              <path d='M18 3v4c0 2-2 4-4 4H2' />
                              <path d='M8 17l-6-6 6-6' />
                            </g>
                          </svg>
                        </div>
                      </>
                    )

                    const key = `${result.dataset}-${result.score}-${index}`

                    if (href) {
                      const isExternal = /^https?:\/\//i.test(href)
                      return (
                        <li key={key} className='DocSearch-Hit' role='option'>
                          {isExternal ? (
                            <a href={href} target='_blank' rel='noreferrer' onClick={onClose}>
                              <div className='DocSearch-Hit-Container'>{hitContent}</div>
                            </a>
                          ) : (
                            <Link to={href} onClick={onClose}>
                              <div className='DocSearch-Hit-Container'>{hitContent}</div>
                            </Link>
                          )}
                        </li>
                      )
                    }

                    return (
                      <li key={key} className='DocSearch-Hit' role='option'>
                        <div style={{ opacity: 0.6, cursor: 'default' }}>
                          <div className='DocSearch-Hit-Container'>{hitContent}</div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>
          )}
        </div>

        <footer className='DocSearch-Footer'>
          <div className='DocSearch-Logo'>
            <span style={{ fontSize: '0.85rem', color: 'var(--docsearch-muted-color)' }}>Powered by Spice Search</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default function SearchBar(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  const themeConfig = siteConfig.themeConfig as typeof siteConfig.themeConfig & {
    spiceSearch?: SpiceSearchThemeConfig
  }

  const config = themeConfig.spiceSearch
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [queuedKey, setQueuedKey] = useState<string | undefined>(undefined)
  const preconnectOrigin = config?.preconnectOrigin

  const openModal = useCallback(() => {
    if (config?.endpoint) {
      setIsOpen(true)
    }
  }, [config?.endpoint])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    searchButtonRef.current?.focus()
    setQueuedKey(undefined)
  }, [])

  const handleInput = useCallback(
    (event: KeyboardEvent) => {
      if (!config?.endpoint) {
        return
      }
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        return
      }
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        setQueuedKey(event.key)
        openModal()
      }
    },
    [config?.endpoint, openModal]
  )

  useDocSearchKeyboardEvents({
    isOpen,
    isAskAiActive: false,
    onAskAiToggle: () => undefined,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef
  })

  if (!config?.endpoint) {
    return null
  }

  return (
    <>
      {preconnectOrigin && (
        <Head>
          <link rel='preconnect' href={preconnectOrigin} crossOrigin='anonymous' />
        </Head>
      )}
      <DocSearchButton
        onClick={openModal}
        ref={searchButtonRef}
        translations={docSearchTranslations.button}
        aria-label='Search Spice docs'
      />

      <SearchModal
        config={config}
        isOpen={isOpen}
        onClose={closeModal}
        initialQuery={queuedKey}
        onInitialQueryConsumed={() => setQueuedKey(undefined)}
      />
    </>
  )
}
