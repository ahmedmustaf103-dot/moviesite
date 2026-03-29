import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MovieCard } from '../components/MovieCard'
import { useViewTransitionNav } from '../hooks/useViewTransitionNav'
import {
  discoverMoviesByGenre,
  fetchMovieGenreList,
  getApiKey,
} from '../tmdb'
import type { TmdbMovieSummary } from '../types/tmdb'
import { getFriendlySearchError } from '../searchErrors'

export default function GenreBrowsePage() {
  const { genreId: idParam } = useParams()
  const viewTransition = useViewTransitionNav()
  const genreId = Number(idParam)
  const idValid = Number.isInteger(genreId) && genreId > 0
  const apiKeyPresent = Boolean(getApiKey())

  const [genreName, setGenreName] = useState<string>('')
  const [movies, setMovies] = useState<TmdbMovieSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(idValid && apiKeyPresent)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!idValid || !apiKeyPresent) {
      setGenreName('')
      return
    }
    const ac = new AbortController()
    ;(async () => {
      try {
        const list = await fetchMovieGenreList({ signal: ac.signal })
        const g = list.find((x) => x.id === genreId)
        setGenreName(g?.name ?? `Genre #${genreId}`)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setGenreName(`Genre #${genreId}`)
      }
    })()
    return () => ac.abort()
  }, [genreId, idValid, apiKeyPresent])

  useEffect(() => {
    if (!idValid || !apiKeyPresent) {
      setMovies([])
      setPage(1)
      setTotalPages(1)
      setTotalResults(0)
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
        const data = await discoverMoviesByGenre(genreId, {
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
  }, [genreId, idValid, apiKeyPresent])

  const canLoadMore =
    idValid &&
    apiKeyPresent &&
    !loading &&
    !error &&
    page < totalPages

  const loadMore = useCallback(async () => {
    if (!canLoadMore || loadingMore) return
    setLoadingMore(true)
    setError(null)
    const nextPage = page + 1
    try {
      const data = await discoverMoviesByGenre(genreId, {
        signal: ac.signal,
        page: nextPage,
      })
      const list = Array.isArray(data.results) ? data.results : []
      setMovies((prev) => [...prev, ...list])
      setPage(nextPage)
      setTotalPages(data.total_pages ?? totalPages)
      setTotalResults(data.total_results ?? totalResults)
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError(e)
    } finally {
      setLoadingMore(false)
    }
  }, [
    canLoadMore,
    loadingMore,
    genreId,
    page,
    totalPages,
    totalResults,
  ])

  const errorCopy = error ? getFriendlySearchError(error) : null

  const title = useMemo(() => {
    if (!idValid) return 'Invalid genre'
    return genreName || 'Movies'
  }, [idValid, genreName])

  return (
    <>
      <main className="main" aria-busy={loading}>
        <div className="section-head">
          <h1 className="section-head__title">{title}</h1>
          <p className="section-head__subtitle">
            {idValid && apiKeyPresent && !loading && !error ? (
              <>
                {totalResults.toLocaleString()} title
                {totalResults !== 1 ? 's' : ''} from TMDB (popularity order).
              </>
            ) : (
              'Discover movies tagged with this genre on The Movie Database.'
            )}
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

        {!idValid && (
          <div className="empty empty--error" role="alert">
            <p className="empty__title">Unknown genre</p>
            <p className="empty__hint">
              Use the Genre menu to pick a valid category.
            </p>
            <Link
              to="/"
              className="button-primary detail-inline-link"
              viewTransition={viewTransition}
            >
              Go home
            </Link>
          </div>
        )}

        {idValid && apiKeyPresent && loading && (
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

        {idValid && apiKeyPresent && !loading && error && errorCopy && (
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

        {idValid && apiKeyPresent && !loading && !error && movies.length === 0 && (
          <div className="empty">
            <p className="empty__title">No movies found</p>
            <p className="empty__hint">Try another genre from the menu.</p>
          </div>
        )}

        {idValid && apiKeyPresent && !loading && !error && movies.length > 0 && (
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
                        ({movies.length} of ~{totalResults})
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
