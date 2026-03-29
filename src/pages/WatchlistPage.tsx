import { Link } from 'react-router-dom'
import { useFavorites } from '../FavoritesContext'
import { MovieCard } from '../components/MovieCard'
import { useViewTransitionNav } from '../hooks/useViewTransitionNav'

export default function WatchlistPage() {
  const viewTransition = useViewTransitionNav()
  const { items } = useFavorites()

  return (
    <>
      <main className="main">
        <div className="section-head">
          <h1 className="section-head__title">Your watchlist</h1>
          <p className="section-head__subtitle">
            Saved on this device only. Tap the heart on any movie to add or
            remove.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="empty">
            <p className="empty__title">Nothing saved yet</p>
            <p className="empty__hint">
              Browse trending titles or search, then tap the heart on a poster
              to save it here.
            </p>
            <Link
              to="/"
              className="button-primary detail-inline-link"
              viewTransition={viewTransition}
            >
              Discover movies
            </Link>
          </div>
        ) : (
          <ul className="grid">
            {items
              .slice()
              .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
              .map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
          </ul>
        )}
      </main>
    </>
  )
}
