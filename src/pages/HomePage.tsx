import { MovieCard } from '../components/MovieCard'
import { SEARCH_MIN_LEN, useMovieSearch } from '../hooks/useMovieSearch'
import { getFriendlySearchError } from '../searchErrors'

export default function HomePage() {
  const {
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
    showDiscover,
    showSearchError,
    showEmptyResults,
    canLoadMore,
    loadMore,
    retrySearch,
    error,
    trending,
    trendingLoading,
    trendingError,
  } = useMovieSearch()

  const errorCopy = showSearchError ? getFriendlySearchError(error) : null

  return (
    <>
      <main
        className="main"
        aria-busy={loading && searchActive && !showSearchError}
      >
        <h1 className="visually-hidden">Cinefind</h1>
        <span id="search-loading-hint" className="visually-hidden">
          {loading && searchActive
            ? 'Loading movie results from The Movie Database.'
            : showSearchError
              ? 'Search failed. Error message is shown on the page.'
              : ''}
        </span>

        {showNoApiBanner(apiKeyPresent)}

        {shortQuery && (
          <div className="notice notice--info" role="status">
            <p className="notice__title">Keep typing</p>
            <p className="notice__text">
              Enter at least {SEARCH_MIN_LEN} characters to run a TMDB search, or
              clear the box to see trending titles.
            </p>
          </div>
        )}

        <div className="main__toolbar">
          <p className="results-count">
            {loading && searchActive && !showSearchError ? (
              results.length > 0 ? (
                <>
                  {results.length} shown —{' '}
                  <span className="results-count__subtle">refreshing</span>
                </>
              ) : (
                <span className="results-count__subtle">Searching…</span>
              )
            ) : showSearchError ? (
              <span className="results-count--error">Something went wrong</span>
            ) : searchActive && !loading ? (
              <>
                {searchMeta.totalResults.toLocaleString()} match
                {searchMeta.totalResults !== 1 ? 'es' : ''}
                {searchMeta.totalPages > 1
                  ? ` · page ${searchMeta.page} of ${searchMeta.totalPages}`
                  : ''}
              </>
            ) : showDiscover ? (
              <>Trending & discover</>
            ) : (
              <>&nbsp;</>
            )}
          </p>
        </div>

        {loading && searchActive && !showSearchError && (
          <div className="state-bar" role="status" aria-label="Search loading">
            <span className="spinner" aria-hidden />
            <span className="state-bar__text">
              {results.length > 0
                ? 'Updating results…'
                : 'Fetching from The Movie Database…'}
            </span>
          </div>
        )}

        {showDiscover && !searchActive && (
          <>
            <section
              className="discover-section"
              aria-labelledby="trending-title"
            >
              <div className="section-head section-head--tight">
                <h2 id="trending-title" className="section-head__title">
                  Trending this week
                </h2>
                <p className="section-head__subtitle">
                  Popular on TMDB right now. Select a title for cast, streaming
                  options, and more.
                </p>
              </div>
              {!apiKeyPresent ? null : trendingLoading ? (
                <ul className="grid grid--skeleton" aria-busy="true">
                  {Array.from({ length: 6 }, (_, i) => (
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
              ) : trendingError ? (
                <div className="notice notice--error" role="status">
                  <p className="notice__title">Couldn’t load trending</p>
                  <p className="notice__text">
                    {getFriendlySearchError(trendingError).message}
                  </p>
                </div>
              ) : (
                <ul className="grid">
                  {trending.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
              )}
            </section>

            {!trimmed && (
              <div className="empty empty--discover">
                <p className="empty__title">Search anything</p>
                <p className="empty__hint">
                  Use the bar above with {SEARCH_MIN_LEN}+ letters (TMDB doesn’t
                  run empty searches). Your results support pagination — load
                  more when there are additional pages.
                </p>
              </div>
            )}
          </>
        )}

        {showSearchError && errorCopy ? (
          <div className="empty empty--error" role="alert">
            <div className="empty__icon" aria-hidden>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
            </div>
            <p className="empty__title">{errorCopy.title}</p>
            <p className="empty__hint">{errorCopy.message}</p>
            <div className="empty__actions">
              <button
                type="button"
                className="button-primary"
                onClick={retrySearch}
              >
                Try again
              </button>
              <button
                type="button"
                className="button-ghost"
                onClick={() => {
                  setQuery('')
                }}
              >
                Clear search
              </button>
            </div>
          </div>
        ) : null}

        {searchActive && loading && results.length === 0 ? (
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
        ) : null}

        {!apiKeyPresent && trimmed ? (
          <div className="empty">
            <p className="empty__title">Add your API key to search</p>
            <p className="empty__hint">
              Create <code className="inline-code">.env</code> with{' '}
              <code className="inline-code">VITE_TMDB_API_KEY=…</code> and
              restart the dev server.
            </p>
          </div>
        ) : null}

        {showEmptyResults ? (
          <div className="empty">
            <p className="empty__title">No matches</p>
            <p className="empty__hint">
              Try different spelling or a shorter title.
            </p>
            <button
              type="button"
              className="button-ghost"
              onClick={() => setQuery('')}
            >
              Clear search
            </button>
          </div>
        ) : null}

        {searchActive && !loading && results.length > 0 ? (
          <>
            <ul className={`grid${loading ? ' grid--dim' : ''}`}>
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
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
                      <span
                        className="spinner spinner--inline"
                        aria-hidden
                      />
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more
                      <span className="load-more-btn__meta">
                        ({results.length} of ~{searchMeta.totalResults})
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : searchMeta.totalPages > 1 ? (
              <p className="end-of-results">End of results</p>
            ) : null}
          </>
        ) : null}
      </main>
    </>
  )
}

function showNoApiBanner(apiKeyPresent: boolean) {
  if (apiKeyPresent) return null
  return (
    <div className="notice notice--warn" role="status">
      <p className="notice__title">TMDB API key missing</p>
      <p className="notice__text">
        Copy <code className="inline-code">.env.example</code> to{' '}
        <code className="inline-code">.env</code>, add your key from{' '}
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noreferrer"
        >
          themoviedb.org/settings/api
        </a>
        , then restart <code className="inline-code">npm run dev</code>.
      </p>
    </div>
  )
}
