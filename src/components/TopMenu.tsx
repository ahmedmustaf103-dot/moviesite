import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useFavorites } from '../FavoritesContext'
import { useMovieGenres } from '../hooks/useMovieGenres'
import { useViewTransitionNav } from '../hooks/useViewTransitionNav'
import type { TmdbGenre } from '../types/tmdb'

/** All genres visible: fill columns top-to-bottom, then the next column (TMDB movie list). */
function splitGenresIntoColumns(items: TmdbGenre[], columnCount: number): TmdbGenre[][] {
  if (items.length === 0) return []
  const perCol = Math.ceil(items.length / columnCount)
  const cols: TmdbGenre[][] = []
  for (let c = 0; c < columnCount; c++) {
    cols.push(items.slice(c * perCol, (c + 1) * perCol))
  }
  return cols
}

export function TopMenu() {
  const location = useLocation()
  const viewTransition = useViewTransitionNav()
  const { genres, loading, error, apiKeyPresent } = useMovieGenres()
  const { items: watchlistItems } = useFavorites()

  const path = location.pathname
  const homeActive = path === '/'
  const genreActive = path.startsWith('/genre/')
  const topActive = path === '/top-rated'
  const watchActive = path === '/watchlist'

  const sortedGenres = [...genres].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )

  const genreColumns = useMemo(
    () => splitGenresIntoColumns(sortedGenres, 4),
    [sortedGenres],
  )

  return (
    <nav className="top-menu" aria-label="Site">
      <div className="top-menu__inner">
        <Link
          to="/"
          className="brand brand--link brand--top-menu"
          viewTransition={viewTransition}
          aria-label="Cinefind, home"
        >
          <span className="brand__mark" aria-hidden />
          <span className="brand__title">Cinefind</span>
        </Link>

        <div className="top-menu__nav">
          <Link
            to="/"
            className={`top-menu__link${homeActive ? ' top-menu__link--active' : ''}`}
            viewTransition={viewTransition}
          >
            Home
          </Link>

          <div className="top-menu__dropdown">
            <button
              type="button"
              className={`top-menu__trigger${genreActive ? ' top-menu__link--active' : ''}`}
              aria-haspopup="true"
              aria-expanded="false"
              aria-label="Browse by genre. Hover or focus to open list."
            >
              Genre
              <svg
                className="top-menu__chevron"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="top-menu__panel" role="menu">
              {!apiKeyPresent ? (
                <p className="top-menu__panel-hint">
                  Add <code className="inline-code">VITE_TMDB_API_KEY</code> to
                  load genres.
                </p>
              ) : loading && sortedGenres.length === 0 ? (
                <p className="top-menu__panel-hint">Loading genres…</p>
              ) : error && sortedGenres.length === 0 ? (
                <p className="top-menu__panel-hint">
                  Couldn’t load genres. Check your connection and API key, then
                  refresh the page.
                </p>
              ) : sortedGenres.length === 0 ? (
                <p className="top-menu__panel-hint">No genres available.</p>
              ) : (
                <div className="top-menu__genre-columns">
                  {genreColumns
                    .filter((col) => col.length > 0)
                    .map((col, ci) => (
                      <ul key={ci} className="top-menu__genre-col">
                        {col.map((g) => (
                          <li key={g.id} role="none">
                            <Link
                              role="menuitem"
                              to={`/genre/${g.id}`}
                              className="top-menu__genre-link"
                              viewTransition={viewTransition}
                            >
                              {g.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ))}
                </div>
              )}
            </div>
          </div>

          <Link
            to="/top-rated"
            className={`top-menu__link${topActive ? ' top-menu__link--active' : ''}`}
            viewTransition={viewTransition}
          >
            Top rated
          </Link>

          <Link
            to="/watchlist"
            className={`top-menu__link${watchActive ? ' top-menu__link--active' : ''}`}
            viewTransition={viewTransition}
          >
            Watchlist
            {watchlistItems.length > 0 ? (
              <span className="nav-pill">{watchlistItems.length}</span>
            ) : null}
          </Link>
        </div>
      </div>
    </nav>
  )
}
