import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MovieCard } from '../components/MovieCard'
import { useViewTransitionNav } from '../hooks/useViewTransitionNav'
import { fetchTopRatedMovies, getApiKey } from '../tmdb'
import type { TmdbMovieSummary } from '../types/tmdb'
import { getFriendlySearchError } from '../searchErrors'

export default function TopRatedPage() {
  const viewTransition = useViewTransitionNav()
  const apiKeyPresent = Boolean(getApiKey())

  const [movies, setMovies] = useState<TmdbMovieSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(apiKeyPresent)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!apiKeyPresent) {
      setMovies([])
      setLoading(false)
      setError(null)
      return
    }
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    setMovies([])
    setPage(1)
    ;(async () => {
      try {
        const data = await fetchTopRatedMovies({
          signal: ac.signal,
          page: 1,
        })
        const list = Array.isArray(data.results) ? data.results : []
        setMovies(list)
        setTotalPages(data.total_pages ?? 1)
        setTotalResults(data.total_results ?? list.length)
        setPage(1)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError(e)
        setMovies([])
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [apiKeyPresent])

  const canLoadMore =
    apiKeyPresent && !loading && !error && page < totalPages

  const loadMore = useCallback(async () => {
    if (!canLoadMore || loadingMore) return
    setLoadingMore(true)
    setError(null)
    const nextPage = page + 1
    try {
      const data = await fetchTopRatedMovies({ page: nextPage })
      const list = Array.isArray(data.results) ? data.results : []
      setMovies((prev) => [...prev, ...list])
      setPage(nextPage)
      setTotalPages(data.total_pages ?? totalPages)
      setTotalResults(data.total_results ?? totalResults)
    } catch (e) {
      setError(e)
    } finally {
      setLoadingMore(false)
    }
  }, [canLoadMore, loadingMore, page, totalPages, totalResults])

  const errorCopy = error ? getFriendlySearchError(error) : null

  return (
    <>
      <main className="main" aria-busy={loading}>
        <div className="section-head">
          <h1 className="section-head__title">Top rated</h1>
          <p className="section-head__subtitle">
            Highest audience-rated titles on TMDB (paginated). Ratings reflect
            TMDB votes, not IMDb.
          </p>
        </div>

        {!apiKeyPresent && (
          <div className="notice notice--warn" role="status">
            <p className="notice__title">TMDB API key missing</p>
            <p className="notice__text">
              Add <code className="inline-code">VITE_TMDB_API_KEY</code> to your{' '}
              <code className="inline-code">.env</code> file.
            </p>
          </div>
        )}

        {apiKeyPresent && loading && (
          <ul className="grid grid--skeleton" aria-busy="true">
            {Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <div className="card card--skeleton">
                  <div className="card__poster-wrap">
                    <div className="card__skel card__skel--poster" />
                  </div>
                  <div className="card__body">
                    <div className="card__skel card__skel--title" />
                    <div className="card__skel card__skel--meta" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {apiKeyPresent && !loading && error && errorCopy && (
          <div className="empty empty--error" role="alert">
            <p className="empty__title">{errorCopy.title}</p>
            <p className="empty__hint">{errorCopy.message}</p>
            <Link
              to="/"
              className="button-primary detail-inline-link"
              viewTransition={viewTransition}
            >
              Go home
            </Link>
          </div>
        )}

        {apiKeyPresent && !loading && !error && movies.length > 0 && (
          <>
            <ul className="grid">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </ul>
            {canLoadMore ? (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="button-primary load-more-btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className="spinner spinner--inline" aria-hidden />
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more
                      <span className="load-more-btn__meta">
                        ({movies.length} loaded)
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : totalPages > 1 ? (
              <p className="end-of-results">End of results</p>
            ) : null}
          </>
        )}
      </main>
    </>
  )
}
