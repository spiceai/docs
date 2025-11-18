import '@docsearch/react/style'
import './styles.css'

import * as Dialog from '@radix-ui/react-dialog'
import clsx from 'clsx'
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className='spiceSearchOverlay' />
        <Dialog.Content className='spiceSearchContent' aria-modal='true'>
          <div className='spiceSearchHeader'>
            <Dialog.Title className='spiceSearchTitle'>Search</Dialog.Title>
            <Dialog.Close className='spiceSearchClose' aria-label='Close search'>
              Close
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className='spiceSearchForm'>
            <input
              autoFocus
              className='spiceSearchInput'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={docSearchTranslations.placeholder}
              type='search'
              aria-label='Search Spice documents'
            />
          </form>

          <div className='spiceSearchStatus'>
            {status === 'loading' && <span className='spiceSearchSpinner' aria-hidden='true' />}
            <span>{summaryText}</span>
          </div>

          {answer && (
            <section className='spiceSearchAnswer' aria-live='polite'>
              <header className='spiceSearchAnswerHeader'>
                <span className='spiceSearchAnswerLabel'>AI answer</span>
              </header>
              {answer.text && (
                <p className='spiceSearchAnswerText' data-testid='spice-search-answer'>
                  {answer.text}
                </p>
              )}
              {answer.sources.length > 0 && (
                <div className='spiceSearchAnswerSources'>
                  <span className='spiceSearchAnswerSourcesTitle'>Sources</span>
                  <ul>
                    {answer.sources.map((source, index) => {
                      const key = `${source.url ?? source.title ?? source.dataset ?? 'source'}-${index}`
                      const label =
                        source.title ?? source.url ?? source.dataset ?? `Result ${index + 1}`
                      const snippet = source.snippet?.trim()
                      const score =
                        typeof source.score === 'number' ? source.score.toFixed(2) : undefined

                      const body = (
                        <div className='spiceSearchAnswerSourceBody'>
                          <span className='spiceSearchAnswerSourceLabel'>{label}</span>
                          {snippet && (
                            <span className='spiceSearchAnswerSourceSnippet'>{snippet}</span>
                          )}
                          {(source.dataset || score) && (
                            <span className='spiceSearchAnswerSourceMeta'>
                              {source.dataset && <span>{source.dataset}</span>}
                              {score && <span>Score {score}</span>}
                            </span>
                          )}
                        </div>
                      )

                      return (
                        <li key={key} className='spiceSearchAnswerSource'>
                          {source.url ? (
                            <a href={source.url} target='_blank' rel='noreferrer'>
                              {body}
                            </a>
                          ) : (
                            body
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {answer.followUps.length > 0 && (
                <div className='spiceSearchAnswerFollowUps'>
                  <span className='spiceSearchAnswerSourcesTitle'>Suggested follow-ups</span>
                  <ul>
                    {answer.followUps.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <div className='spiceSearchResultList' role='list'>
            {status === 'success' && results.length === 0 && (
              <div className='spiceSearchEmpty'>No matches yet. Try refining your query.</div>
            )}

            {results.map((result) => {
              const href = resolveUrl(result, config)
              const description = resolveDescription(result, config)
              const title = resolveTitle(result, config)
              const content = (
                <div className='spiceSearchResultCard'>
                  <div className='spiceSearchResultHeading'>
                    <span className='spiceSearchResultTitle'>{title}</span>
                    <span className='spiceSearchResultDataset'>{result.dataset}</span>
                  </div>
                  {description && <p className='spiceSearchResultExcerpt'>{description}</p>}
                  <div className='spiceSearchResultMeta'>
                    <span>Score {result.score.toFixed(2)}</span>
                  </div>
                </div>
              )

              if (href) {
                const isExternal = /^https?:\/\//i.test(href)
                return isExternal ? (
                  <a
                    key={`${result.dataset}-${result.score}-${href}`}
                    href={href}
                    target='_blank'
                    rel='noreferrer'
                    className='spiceSearchResultLink'
                    role='listitem'
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={`${result.dataset}-${result.score}-${href}`}
                    to={href}
                    className='spiceSearchResultLink'
                    role='listitem'
                    onClick={onClose}
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <div
                  key={`${result.dataset}-${result.score}-static`}
                  className={clsx('spiceSearchResultLink', 'spiceSearchResultLink--disabled')}
                  role='listitem'
                >
                  {content}
                </div>
              )
            })}
          </div>

          <footer className='spiceSearchFooter'>
            Powered by <span>Spice Search</span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
