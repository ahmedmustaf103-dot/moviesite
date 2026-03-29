import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  movieToEntry,
  persistFavorites,
  readFavorites,
  type WatchlistEntry,
} from './favoritesStorage'
import type { TmdbMovieSummary } from './types/tmdb'

type FavoritesCtx = {
  items: WatchlistEntry[]
  add: (movie: TmdbMovieSummary) => void
  remove: (id: number) => void
  toggle: (movie: TmdbMovieSummary) => void
  has: (id: number) => boolean
}

const FavoritesContext = createContext<FavoritesCtx | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WatchlistEntry[]>(() => readFavorites())

  useEffect(() => {
    persistFavorites(items)
  }, [items])

  const add = useCallback((movie: TmdbMovieSummary) => {
    const entry = movieToEntry(movie)
    setItems((prev) => {
      if (prev.some((x) => x.id === entry.id)) return prev
      return [...prev, entry]
    })
  }, [])

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const toggle = useCallback((movie: TmdbMovieSummary) => {
    const entry = movieToEntry(movie)
    setItems((prev) => {
      if (prev.some((x) => x.id === entry.id)) {
        return prev.filter((x) => x.id !== entry.id)
      }
      return [...prev, entry]
    })
  }, [])

  const has = useCallback(
    (id: number) => items.some((x) => x.id === id),
    [items],
  )

  const value = useMemo(
    () => ({ items, add, remove, toggle, has }),
    [items, add, remove, toggle, has],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites(): FavoritesCtx {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}
