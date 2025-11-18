/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { DocSearchButton } from '@docsearch/react/button'
import { useDocSearchKeyboardEvents } from '@docsearch/react/useDocSearchKeyboardEvents'
import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import { useHistory } from '@docusaurus/router'
import { isRegexpStringMatch, useSearchLinkCreator } from '@docusaurus/theme-common'
import Translate from '@docusaurus/Translate'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import translations from '@theme/SearchTranslations'

import type {
  InternalDocSearchHit,
  DocSearchModal as DocSearchModalType,
  DocSearchModalProps,
  StoredDocSearchHit,
  DocSearchHit
} from '@docsearch/react'

import type { AutocompleteState } from '@algolia/autocomplete-core'
import type { SpiceSearchThemeConfig } from '@site/src/types/spice-search'

type DocSearchProps = Omit<DocSearchModalProps, 'onClose' | 'initialScrollY'> & {
  contextualSearch?: string
  externalUrlRegex?: string
  searchPagePath: boolean | string
}

// Spice Search specific types
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
}

let DocSearchModal: typeof DocSearchModalType | null = null

function importDocSearchModalIfNeeded() {
  if (DocSearchModal) {
    return Promise.resolve()
  }
  return Promise.all([
    import('@docsearch/react/modal'),
    import('@docsearch/react/style'),
    import('./styles.css')
  ]).then(([{ DocSearchModal: Modal }]) => {
    DocSearchModal = Modal
  })
}

function useNavigator({ externalUrlRegex }: Pick<DocSearchProps, 'externalUrlRegex'>) {
  const history = useHistory()
  const [navigator] = useState<DocSearchModalProps['navigator']>(() => {
    return {
      navigate(params) {
        if (isRegexpStringMatch(externalUrlRegex, params.itemUrl)) {
          window.location.href = params.itemUrl
        } else {
          history.push(params.itemUrl)
        }
      }
    }
  })
  return navigator
}

// Helper functions to extract data from Spice Search results
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

// Custom search client that calls Spice Search API instead of Algolia
function useSpiceSearchClient(config: SpiceSearchThemeConfig) {
  return useMemo(() => {
    return {
      search: async (requests: Array<{ params: { query: string } }>) => {
        if (!requests || requests.length === 0) {
          return {
            results: [
              {
                hits: [],
                nbHits: 0,
                nbPages: 0,
                page: 0,
                processingTimeMS: 0,
                hitsPerPage: 0,
                exhaustiveNbHits: false,
                query: '',
                params: ''
              }
            ]
          }
        }

        const query = requests[0]?.params?.query || ''

        if (!query || query.trim().length < 2) {
          return {
            results: [
              {
                hits: [],
                nbHits: 0,
                nbPages: 0,
                page: 0,
                processingTimeMS: 0,
                hitsPerPage: 0,
                exhaustiveNbHits: false,
                query,
                params: ''
              }
            ]
          }
        }

        try {
          const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {})
            },
            body: JSON.stringify({ text: query })
          })

          if (!response.ok) {
            throw new Error(`Search failed (${response.status})`)
          }

          const json = (await response.json()) as SpiceSearchResponse

          // Transform Spice Search results to Algolia format
          const hits = (json.results || []).map((result, index) => {
            const title = resolveTitle(result, config)
            const url = resolveUrl(result, config) || '#'
            const description = resolveDescription(result, config)

            return {
              objectID: `${result.dataset}-${result.score}-${index}`,
              url,
              hierarchy: {
                lvl0: result.dataset,
                lvl1: title,
                lvl2: description
              },
              content: description,
              _highlightResult: {
                hierarchy: {
                  lvl0: { value: result.dataset, matchLevel: 'none' as const, matchedWords: [] },
                  lvl1: { value: title, matchLevel: 'full' as const, matchedWords: [] },
                  lvl2: description
                    ? { value: description, matchLevel: 'partial' as const, matchedWords: [] }
                    : null
                }
              }
            }
          })

          return {
            results: [
              {
                hits,
                nbHits: hits.length,
                nbPages: 1,
                page: 0,
                processingTimeMS: json.duration_ms || 0,
                hitsPerPage: hits.length,
                exhaustiveNbHits: true,
                query,
                params: ''
              }
            ]
          }
        } catch (error) {
          console.error('Spice Search error:', error)
          return {
            results: [
              {
                hits: [],
                nbHits: 0,
                nbPages: 0,
                page: 0,
                processingTimeMS: 0,
                hitsPerPage: 0,
                exhaustiveNbHits: false,
                query,
                params: ''
              }
            ]
          }
        }
      }
    }
  }, [config])
}

function useTransformItems(props: Pick<DocSearchProps, 'transformItems'>) {
  const [transformItems] = useState<DocSearchModalProps['transformItems']>(() => {
    return (items: DocSearchHit[]) => (props.transformItems ? props.transformItems(items) : items)
  })
  return transformItems
}

function useResultsFooterComponent({
  closeModal
}: {
  closeModal: () => void
}): DocSearchProps['resultsFooterComponent'] {
  return useMemo(
    () =>
      ({ state }) => <ResultsFooter state={state} onClose={closeModal} />,
    [closeModal]
  )
}

function Hit({
  hit,
  children
}: {
  hit: InternalDocSearchHit | StoredDocSearchHit
  children: ReactNode
}) {
  return <Link to={hit.url}>{children}</Link>
}

type ResultsFooterProps = {
  state: AutocompleteState<InternalDocSearchHit>
  onClose: () => void
}

function ResultsFooter({ state, onClose }: ResultsFooterProps) {
  const createSearchLink = useSearchLinkCreator()

  return (
    <Link to={createSearchLink(state.query)} onClick={onClose}>
      <Translate id='theme.SearchBar.seeAll' values={{ count: state.context.nbHits }}>
        {'See all {count} results'}
      </Translate>
    </Link>
  )
}

function DocSearch({
  externalUrlRegex,
  searchPagePath,
  ...props
}: DocSearchProps & { spiceSearch: SpiceSearchThemeConfig }) {
  const navigator = useNavigator({ externalUrlRegex })
  const transformItems = useTransformItems({ transformItems: undefined })
  const searchClient = useSpiceSearchClient(props.spiceSearch)

  const searchContainer = useRef<HTMLDivElement | null>(null)
  const searchButtonRef = useRef<HTMLButtonElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState<string | undefined>(undefined)

  const prepareSearchContainer = useCallback(() => {
    if (!searchContainer.current) {
      const divElement = document.createElement('div')
      searchContainer.current = divElement
      document.body.insertBefore(divElement, document.body.firstChild)
    }
  }, [])

  const openModal = useCallback(() => {
    prepareSearchContainer()
    importDocSearchModalIfNeeded().then(() => setIsOpen(true))
  }, [prepareSearchContainer])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    searchButtonRef.current?.focus()
    setInitialQuery(undefined)
  }, [])

  const handleInput = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        return
      }
      event.preventDefault()
      setInitialQuery(event.key)
      openModal()
    },
    [openModal]
  )

  const resultsFooterComponent = useResultsFooterComponent({ closeModal })

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef,
    isAskAiActive: false,
    onAskAiToggle: () => {}
  })

  return (
    <>
      <Head>
        {props.spiceSearch.preconnectOrigin && (
          <link
            rel='preconnect'
            href={props.spiceSearch.preconnectOrigin}
            crossOrigin='anonymous'
          />
        )}
      </Head>

      <DocSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={openModal}
        ref={searchButtonRef}
        translations={translations.button}
      />

      {isOpen &&
        DocSearchModal &&
        searchContainer.current &&
        createPortal(
          <DocSearchModal
            onClose={closeModal}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            {...(searchPagePath && {
              resultsFooterComponent
            })}
            placeholder={translations.placeholder}
            translations={translations.modal}
            appId='spice'
            apiKey='dummy'
            onAskAiToggle={() => {}}
            // @ts-expect-error searchClient is valid but not typed in v4
            searchClient={searchClient}
          />,
          searchContainer.current
        )}
    </>
  )
}

export default function SearchBar(): ReactNode {
  const { siteConfig } = useDocusaurusContext()
  const themeConfig = siteConfig.themeConfig as typeof siteConfig.themeConfig & {
    spiceSearch?: SpiceSearchThemeConfig
  }

  if (!themeConfig.spiceSearch) {
    return null
  }

  return (
    <DocSearch
      spiceSearch={themeConfig.spiceSearch}
      searchPagePath={false}
      externalUrlRegex={undefined}
      appId='spice'
      apiKey='dummy'
      onAskAiToggle={() => {}}
      indexName='spice-search'
    />
  )
}
