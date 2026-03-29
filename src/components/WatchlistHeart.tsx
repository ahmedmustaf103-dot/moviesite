import { useFavorites } from '../FavoritesContext'
import type { TmdbMovieSummary } from '../types/tmdb'

type Props = {
  movie: TmdbMovieSummary
  className?: string
}

export function WatchlistHeart({ movie, className = '' }: Props) {
  const { toggle, has } = useFavorites()
  const on = has(movie.id)

  return (
    <button
      type="button"
      className={`fav-btn ${on ? 'fav-btn--on' : ''} ${className}`.trim()}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(movie)
      }}
      aria-pressed={on}
      aria-label={
        on
          ? `Remove “${movie.title}” from watchlist`
          : `Add “${movie.title}” to watchlist`
      }
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={on ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
