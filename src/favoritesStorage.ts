import type { TmdbMovieSummary } from './types/tmdb'

const STORAGE_KEY = 'cinefind-watchlist-v1'

export interface WatchlistEntry {
  id: number
  title: string
  poster_path: string | null
  vote_average?: number
  release_date?: string | null
  savedAt: number
}

export function readFavorites(): WatchlistEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(
      (x): x is WatchlistEntry =>
        x != null &&
        typeof (x as WatchlistEntry).id === 'number' &&
        typeof (x as WatchlistEntry).title === 'string',
    )
  } catch {
    return []
  }
}

export function persistFavorites(items: WatchlistEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* quota / private mode */
  }
}

export function movieToEntry(movie: TmdbMovieSummary): WatchlistEntry {
  return {
    id: movie.id,
    title: movie.title ?? 'Untitled',
    poster_path: movie.poster_path ?? null,
    vote_average: movie.vote_average,
    release_date: movie.release_date ?? null,
    savedAt: Date.now(),
  }
}
