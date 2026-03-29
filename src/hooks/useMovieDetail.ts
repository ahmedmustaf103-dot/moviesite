import { useCallback, useEffect, useState } from 'react'
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchWatchProviders,
  getApiKey,
} from '../tmdb'
import type { TmdbCredits, TmdbMovieDetails } from '../types/tmdb'
import type { TmdbWatchProviderRegion } from '../types/tmdb'
import { pickProviderRegion } from '../movieDetailUtils'

export function useMovieDetail(movieId: number, idValid: boolean) {
  const apiKeyPresent = Boolean(getApiKey())

  const [movie, setMovie] = useState<TmdbMovieDetails | null>(null)
  const [credits, setCredits] = useState<TmdbCredits | null>(null)
  const [providerRegion, setProviderRegion] =
    useState<TmdbWatchProviderRegion | null>(null)
  const [loading, setLoading] = useState(idValid && apiKeyPresent)
  const [error, setError] = useState<unknown>(null)
  const [refetchTick, setRefetchTick] = useState(0)

  useEffect(() => {
    if (!idValid) {
      setMovie(null)
      setCredits(null)
      setProviderRegion(null)
      setLoading(false)
      setError(null)
      return
    }

    if (!apiKeyPresent) {
      setMovie(null)
      setCredits(null)
      setProviderRegion(null)
      setLoading(false)
      setError(null)
      return
    }

    const ac = new AbortController()
    setLoading(true)
    setError(null)
    setMovie(null)
    setCredits(null)
    setProviderRegion(null)

    ;(async () => {
      try {
        const [dRes, cRes, pRes] = await Promise.allSettled([
          fetchMovieDetails(movieId, { signal: ac.signal }),
          fetchMovieCredits(movieId, { signal: ac.signal }),
          fetchWatchProviders(movieId, { signal: ac.signal }),
        ])

        if (dRes.status !== 'fulfilled') {
          throw dRes.reason
        }

        setMovie(dRes.value)
        if (cRes.status === 'fulfilled') setCredits(cRes.value)
        if (pRes.status === 'fulfilled') {
          setProviderRegion(pickProviderRegion(pRes.value))
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setError(err)
        setMovie(null)
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    })()

    return () => ac.abort()
  }, [movieId, idValid, apiKeyPresent, refetchTick])

  const retryLoad = useCallback(() => {
    setError(null)
    setLoading(true)
    setRefetchTick((n) => n + 1)
  }, [])

  return {
    apiKeyPresent,
    movie,
    credits,
    providerRegion,
    loading,
    error,
    retryLoad,
  }
}
