import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchTrendingMovies,
  getApiKey,
  searchMovies,
} from '../tmdb'
import { SEARCH_URL_KEY, setSearchInParams } from '../searchQueryUrl'
import type { TmdbMovieSummary } from '../types/tmdb'

export const SEARCH_MIN_LEN = 2
export const SEARCH_DEBOUNCE_MS = 400

export interface SearchMeta {
  page: number
  totalPages: number
  totalResults: number
}

export function useMovieSearch() {
  const loadMoreAbortRef = useRef<AbortController | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const apiKeyPresent = Boolean(getApiKey())

  const query = searchParams.get(SEARCH_URL_KEY) ?? ''
  const setQuery = useCallback(
    (value: string) => {
      setSearchInParams(setSearchParams, value)
    },
    [setSearchParams],
  )
  const [results, setResults] = useState<TmdbMovieSummary[]>([])
  const [searchMeta, setSearchMeta] = useState<SearchMeta>({
    page: 1,
    totalPages: 0,
    totalResults: 0,
  })
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [refetchTick, setRefetchTick] = useState(0)

  const [trendResults, setTrendResults] = useState<TmdbMovieSummary[]>([])
  const [trendingLoading, setTrendingLoading] = useState(false)
  const [trendingError, setTrendingError] = useState<unknown>(null)

  const trimmed = query.trim()
  const searchActive =
    trimmed.length >= SEARCH_MIN_LEN && apiKeyPresent
  const shortQuery =
    trimmed.length > 0 && trimmed.length < SEARCH_MIN_LEN && apiKeyPresent

  useEffect(() => {
    if (!apiKeyPresent) {
      setTrendResults([])
      setTrendingLoading(false)
      setTrendingError(null)
      return
    }
    const ac = new AbortController()
    setTrendingLoading(true)
    setTrendingError(null)
    ;(async () => {
      try {
        const data = await fetchTrendingMovies('week', { signal: ac.signal })
        setTrendResults(Array.isArray(data.results) ? data.results : [])
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setTrendResults([])
        setTrendingError(err)
      } finally {
        if (!ac.signal.aborted) setTrendingLoading(false)
      }
    })()
    return () => ac.abort()
  }, [apiKeyPresent])

  useEffect(() => {
    if (!searchActive) {
      setResults([])
      setError(null)
      setLoading(false)
      setSearchMeta({ page: 1, totalPages: 0, totalResults: 0 })
      return
    }

    const ac = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await searchMovies(trimmed, {
          signal: ac.signal,
          page: 1,
        })
        const list = Array.isArray(data.results) ? data.results : []
        setResults(list)
        setSearchMeta({
          page: 1,
          totalPages: data.total_pages ?? 1,
          totalResults: data.total_results ?? list.length,
        })
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err)
        setResults([])
        setSearchMeta({ page: 1, totalPages: 0, totalResults: 0 })
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      ac.abort()
    }
  }, [trimmed, apiKeyPresent, refetchTick, searchActive])

  useEffect(
    () => () => {
      loadMoreAbortRef.current?.abort()
    },
    [],
  )

  const showDiscover = !searchActive && !loading
  const showSearchError = Boolean(error && searchActive && !loading)
  const showEmptyResults =
    searchActive && !loading && !error && results.length === 0

  const canLoadMore =
    searchActive &&
    !loading &&
    !error &&
    searchMeta.page < searchMeta.totalPages

  const loadMore = useCallback(async () => {
    if (!canLoadMore || loadingMore) return
    const q = trimmed
    if (q.length < SEARCH_MIN_LEN) return
    loadMoreAbortRef.current?.abort()
    const ac = new AbortController()
    loadMoreAbortRef.current = ac
    setLoadingMore(true)
    setError(null)
    try {
      const data = await searchMovies(q, {
        page: searchMeta.page + 1,
        signal: ac.signal,
      })
      const next = Array.isArray(data.results) ? data.results : []
      setResults((prev) => [...prev, ...next])
      setSearchMeta((m) => ({
        page: m.page + 1,
        totalPages: data.total_pages ?? m.totalPages,
        totalResults: data.total_results ?? m.totalResults,
      }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError(err)
    } finally {
      if (loadMoreAbortRef.current === ac) loadMoreAbortRef.current = null
      setLoadingMore(false)
    }
  }, [
    canLoadMore,
    loadingMore,
    trimmed,
    searchMeta.page,
    searchMeta.totalPages,
  ])

  const retrySearch = useCallback(() => {
    setError(null)
    setLoading(true)
    setRefetchTick((n) => n + 1)
  }, [])

  return {
    apiKeyPresent,
    query,
    setQuery,
    trimmed,
    searchActive,
    shortQuery,
    results,
    searchMeta,
    loading,
    loadingMore,
    error,
    showDiscover,
    showSearchError,
    showEmptyResults,
    canLoadMore,
    loadMore,
    retrySearch,
    trending: trendResults,
    trendingLoading,
    trendingError,
  }
}
