import { useEffect, useState } from 'react'
import { fetchMovieGenreList, getApiKey } from '../tmdb'
import type { TmdbGenre } from '../types/tmdb'

export function useMovieGenres() {
  const apiKeyPresent = Boolean(getApiKey())
  const [genres, setGenres] = useState<TmdbGenre[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!apiKeyPresent) {
      setGenres([])
      setLoading(false)
      setError(null)
      return
    }
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const list = await fetchMovieGenreList({ signal: ac.signal })
        setGenres(list)
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setError(e)
        setGenres([])
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    })()
    return () => ac.abort()
  }, [apiKeyPresent])

  return { genres, loading, error, apiKeyPresent }
}
