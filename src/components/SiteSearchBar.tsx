import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LEN } from '../hooks/useMovieSearch'
import { navigateToHomeWithSearch, SEARCH_URL_KEY, setSearchInParams } from '../searchQueryUrl'

export function SiteSearchBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isHome = pathname === '/'
  const urlQ = searchParams.get(SEARCH_URL_KEY) ?? ''
  const [awayDraft, setAwayDraft] = useState('')
  const awayDraftRef = useRef(awayDraft)
  awayDraftRef.current = awayDraft

  useEffect(() => {
    if (isHome) setAwayDraft('')
  }, [isHome])

  const displayValue = isHome ? urlQ : awayDraft

  const handleChange = (v: string) => {
    if (isHome) {
      setSearchInParams(setSearchParams, v)
    } else {
      setAwayDraft(v)
    }
  }

  useEffect(() => {
    if (isHome) return
    const timer = window.setTimeout(() => {
      const d = awayDraftRef.current.trim()
      if (d.length >= SEARCH_MIN_LEN) {
        navigateToHomeWithSearch(navigate, d)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [awayDraft, isHome, navigate])

  const clear = () => {
    if (isHome) {
      setSearchInParams(setSearchParams, '')
    } else {
      setAwayDraft('')
    }
  }

  return (
    <div className="site-search-bar">
      <form
        className="search site-search-bar__form"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="visually-hidden" htmlFor="site-movie-search">
          Search movies
        </label>
        <div className="search__field">
          <svg
            className="search__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="site-movie-search"
            type="search"
            className="search__input"
            placeholder="Search movies (powered by TMDB)…"
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            autoComplete="off"
            aria-describedby="site-search-hint"
          />
          {displayValue ? (
            <button
              type="button"
              className="search__clear"
              onClick={clear}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>
        <p id="site-search-hint" className="search-hint site-search-bar__hint">
          Type <strong>{SEARCH_MIN_LEN}+ characters</strong> to search TMDB.
          {isHome ? (
            <>
              {' '}
              Shorter queries are skipped — browse <strong>Trending</strong>{' '}
              below when the box is empty.
            </>
          ) : (
            <>
              {' '}
              Searching from here opens <strong>Home</strong> with results
              after a short pause.
            </>
          )}
        </p>
      </form>
    </div>
  )
}
