import '@docsearch/react/style';
import './styles.css';

import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {DocSearchButton, useDocSearchKeyboardEvents} from '@docsearch/react';
import translations from '@theme-original/SearchTranslations';

import type {SpiceSearchThemeConfig} from '@site/src/types/spice-search';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

type SpiceSearchMatch = {
  dataset: string;
  score: number;
  matches?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  primary_key?: Record<string, unknown>;
};

type SpiceSearchResponse = {
  results: SpiceSearchMatch[];
  duration_ms: number;
};

const MIN_QUERY_LENGTH = 2;
const MAX_DISPLAY_RESULTS = 6;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function getFirstTextValue(map?: Record<string, unknown>): string | undefined {
  if (!map) {
    return undefined;
  }
  for (const value of Object.values(map)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
    if (Array.isArray(value)) {
      const text = value.find((item) => typeof item === 'string' && item.trim());
      if (text) {
        return text.trim();
      }
    }
  }
  return undefined;
}

function readField(result: SpiceSearchMatch, field?: string): string | undefined {
  if (!field) {
    return undefined;
  }
  const sources: Array<Record<string, unknown> | undefined> = [
    result.matches,
    result.data,
    result.metadata,
  ];
  for (const source of sources) {
    const value = source?.[field];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function resolveUrl(result: SpiceSearchMatch, config?: SpiceSearchThemeConfig): string | undefined {
  const candidates = [
    readField(result, config?.resultUrlField),
    result.data?.url,
    result.metadata?.url,
    result.matches?.url,
  ];
  return candidates.find((candidate): candidate is string => isString(candidate) && candidate.length > 0);
}

function resolveTitle(result: SpiceSearchMatch, config?: SpiceSearchThemeConfig): string {
  return (
    readField(result, config?.resultTitleField) ??
    (result.metadata?.title as string | undefined) ??
    (result.data?.title as string | undefined) ??
    getFirstTextValue(result.matches) ??
    result.dataset
  );
}

function resolveDescription(result: SpiceSearchMatch, config?: SpiceSearchThemeConfig): string | undefined {
  return (
    readField(result, config?.resultDescriptionField) ??
    (result.metadata?.description as string | undefined) ??
    (result.data?.description as string | undefined) ??
    getFirstTextValue(result.matches)
  );
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);

  return debouncedValue;
}

function SearchModal({
  config,
  isOpen,
  onClose,
  initialQuery,
  onInitialQueryConsumed,
}: {
  config: SpiceSearchThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onInitialQueryConsumed?: () => void;
}): ReactNode {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [results, setResults] = useState<SpiceSearchMatch[]>([]);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 150);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setStatus('idle');
      setDurationMs(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (initialQuery && !query) {
      setQuery(initialQuery);
      onInitialQueryConsumed?.();
    }
  }, [initialQuery, isOpen, onInitialQueryConsumed, query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const trimmedQuery = debouncedQuery?.trim() ?? '';
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setStatus(trimmedQuery.length === 0 ? 'idle' : 'error');
      if (trimmedQuery.length === 0) {
        setErrorMessage(null);
      } else {
        setErrorMessage(`Enter at least ${MIN_QUERY_LENGTH} characters`);
      }
      setResults([]);
      setDurationMs(null);
      return;
    }

    if (!config.endpoint) {
      setStatus('error');
      setErrorMessage('Spice Search endpoint is not configured.');
      setResults([]);
      setDurationMs(null);
      return;
    }

    const controller = new AbortController();
    const fetchSearch = async () => {
      try {
        setStatus('loading');
        setErrorMessage(null);

        const payload: Record<string, unknown> = {
          text: trimmedQuery,
        };

        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? {Authorization: `Bearer ${config.apiKey}`} : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search failed (${response.status})`);
        }

        const json = (await response.json()) as SpiceSearchResponse;
        const trimmedResults = (json.results ?? []).slice(0, MAX_DISPLAY_RESULTS);
        setResults(trimmedResults);
        setDurationMs(json.duration_ms ?? null);
        setStatus('success');
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        setResults([]);
        setDurationMs(null);
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Unexpected search error',
        );
      }
    };

    fetchSearch();
    return () => controller.abort();
  }, [config, debouncedQuery, isOpen, query]);

  const summaryText = useMemo(() => {
    const trimmed = debouncedQuery?.trim() ?? '';
    if (!trimmed) {
      return 'Start typing to search Spice docs and blogs.';
    }
    if (status === 'loading') {
      return 'Searching Spice datasets...';
    }
    if (status === 'success') {
      const count = results.length;
      const duration = durationMs ? `${durationMs} ms` : '';
      return `${count} result${count === 1 ? '' : 's'}${duration ? ` in ${duration}` : ''}`;
    }
    if (status === 'error' && errorMessage) {
      return errorMessage;
    }
    return undefined;
  }, [debouncedQuery, durationMs, errorMessage, results.length, status]);

  const firstResultUrl = useMemo(
    () => (results.length ? resolveUrl(results[0], config) : undefined),
    [config, results],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (firstResultUrl) {
        window.location.href = firstResultUrl;
        onClose();
      }
    },
    [firstResultUrl, onClose],
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="spiceSearchOverlay" />
        <Dialog.Content className="spiceSearchContent" aria-modal="true">
          <div className="spiceSearchHeader">
            <Dialog.Title className="spiceSearchTitle">Search</Dialog.Title>
            <Dialog.Close className="spiceSearchClose" aria-label="Close search">
              Close
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="spiceSearchForm">
            <input
              autoFocus
              className="spiceSearchInput"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translations.placeholder}
              type="search"
              aria-label="Search Spice documents"
            />
          </form>

          <div className="spiceSearchStatus">
            {status === 'loading' && <span className="spiceSearchSpinner" aria-hidden="true" />}
            <span>{summaryText}</span>
          </div>

          <div className="spiceSearchResultList" role="list">
            {status === 'success' && results.length === 0 && (
              <div className="spiceSearchEmpty">No matches yet. Try refining your query.</div>
            )}

            {results.map((result) => {
              const href = resolveUrl(result, config);
              const description = resolveDescription(result, config);
              const title = resolveTitle(result, config);
              const content = (
                <div className="spiceSearchResultCard">
                  <div className="spiceSearchResultHeading">
                    <span className="spiceSearchResultTitle">{title}</span>
                    <span className="spiceSearchResultDataset">{result.dataset}</span>
                  </div>
                  {description && <p className="spiceSearchResultExcerpt">{description}</p>}
                  <div className="spiceSearchResultMeta">
                    <span>Score {result.score.toFixed(2)}</span>
                  </div>
                </div>
              );

              if (href) {
                const isExternal = /^https?:\/\//i.test(href);
                return isExternal ? (
                  <a
                    key={`${result.dataset}-${result.score}-${href}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="spiceSearchResultLink"
                    role="listitem">
                    {content}
                  </a>
                ) : (
                  <Link
                    key={`${result.dataset}-${result.score}-${href}`}
                    to={href}
                    className="spiceSearchResultLink"
                    role="listitem"
                    onClick={onClose}>
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={`${result.dataset}-${result.score}-static`}
                  className={clsx('spiceSearchResultLink', 'spiceSearchResultLink--disabled')}
                  role="listitem">
                  {content}
                </div>
              );
            })}
          </div>

          <footer className="spiceSearchFooter">
            Powered by <span>Spice Search</span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function SearchBar(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const themeConfig = siteConfig.themeConfig as typeof siteConfig.themeConfig & {
    spiceSearch?: SpiceSearchThemeConfig;
  };

  const config = themeConfig.spiceSearch;
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [queuedKey, setQueuedKey] = useState<string | undefined>(undefined);
  const preconnectOrigin = config?.preconnectOrigin;

  const openModal = useCallback(() => {
    if (config?.endpoint) {
      setIsOpen(true);
    }
  }, [config?.endpoint]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    searchButtonRef.current?.focus();
    setQueuedKey(undefined);
  }, []);

  const handleInput = useCallback(
    (event: KeyboardEvent) => {
      if (!config?.endpoint) {
        return;
      }
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        return;
      }
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setQueuedKey(event.key);
        openModal();
      }
    },
    [config?.endpoint, openModal],
  );

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef,
  });

  if (!config?.endpoint) {
    return null;
  }

  return (
    <>
      {preconnectOrigin && (
        <Head>
          <link rel="preconnect" href={preconnectOrigin} crossOrigin="anonymous" />
        </Head>
      )}
      <DocSearchButton
        onClick={openModal}
        ref={searchButtonRef}
        translations={translations.button}
        aria-label="Search Spice docs"
      />

      <SearchModal
        config={config}
        isOpen={isOpen}
        onClose={closeModal}
        initialQuery={queuedKey}
        onInitialQueryConsumed={() => setQueuedKey(undefined)}
      />
    </>
  );
}
