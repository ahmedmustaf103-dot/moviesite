import type {
  ApiError,
  TmdbCredits,
  TmdbGenreListResponse,
  TmdbMovieDetails,
  TmdbSearchResponse,
  TmdbWatchProvidersResponse,
} from './types/tmdb'

const API_BASE = 'https://api.themoviedb.org/3'
export const IMG_BASE = 'https://image.tmdb.org/t/p/w500'
const IMG_PROFILE = 'https://image.tmdb.org/t/p/w185'
const IMG_LOGO = 'https://image.tmdb.org/t/p/w92'
const IMG_THUMB = 'https://image.tmdb.org/t/p/w92'

const prefetchInFlight = new Set<string>()

export function getApiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY
  return typeof key === 'string' && key.trim() ? key.trim() : ''
}

export function getWatchRegion(): string {
  const r = import.meta.env.VITE_WATCH_REGION
  return typeof r === 'string' && /^[A-Za-z]{2}$/.test(r.trim())
    ? r.trim().toUpperCase()
    : 'US'
}

export function posterSrc(posterPath: string | null): string | null {
  if (!posterPath) return null
  return `${IMG_BASE}${posterPath}`
}

/** Tiny image for LQIP / blur-up placeholders */
export function posterThumbSrc(posterPath: string | null): string | null {
  if (!posterPath) return null
  return `${IMG_THUMB}${posterPath}`
}

export function profileSrc(profilePath: string | null): string | null {
  if (!profilePath) return null
  return `${IMG_PROFILE}${profilePath}`
}

export function providerLogoSrc(logoPath: string | null): string | null {
  if (!logoPath) return null
  return `${IMG_LOGO}${logoPath}`
}

async function tmdbGet<T>(
  path: string,
  options: {
    signal?: AbortSignal
    params?: Record<string, string>
  } = {},
): Promise<T> {
  const apiKey = getApiKey()
  if (!apiKey) {
    const err = new Error('MISSING_API_KEY') as ApiError
    err.code = 'MISSING_API_KEY'
    throw err
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    ...(options.params || {}),
  })

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}?${params}`, {
      signal: options.signal,
    })
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e
    const err = new Error('NETWORK') as ApiError
    err.code = 'NETWORK'
    err.cause = e
    throw err
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    const serverMsg =
      typeof data.status_message === 'string' ? data.status_message : ''
    const firstErr =
      Array.isArray(data.errors) && data.errors[0] != null
        ? String(data.errors[0])
        : ''
    const err = new Error(serverMsg || firstErr || `HTTP ${res.status}`) as ApiError
    err.code = 'HTTP_ERROR'
    err.status = res.status
    err.detail = serverMsg || firstErr || null
    throw err
  }

  return data as T
}

export async function searchMovies(
  query: string,
  options: { signal?: AbortSignal; page?: number; language?: string } = {},
): Promise<TmdbSearchResponse> {
  return tmdbGet<TmdbSearchResponse>('/search/movie', {
    ...options,
    params: {
      query: query.trim(),
      include_adult: 'false',
      page: String(options.page ?? 1),
      language: options.language ?? 'en-US',
    },
  })
}

export async function fetchTrendingMovies(
  timeWindow: 'day' | 'week' = 'week',
  options: { signal?: AbortSignal; language?: string } = {},
): Promise<TmdbSearchResponse> {
  return tmdbGet<TmdbSearchResponse>(`/trending/movie/${timeWindow}`, {
    ...options,
    params: {
      language: options.language ?? 'en-US',
    },
  })
}

let cachedGenreList: TmdbGenreListResponse['genres'] | null = null
let genreListInflight: Promise<TmdbGenreListResponse['genres']> | null = null

/** Cached list of TMDB movie genres (same IDs as discover `with_genres`). */
export async function fetchMovieGenreList(
  options: { signal?: AbortSignal; language?: string } = {},
): Promise<TmdbGenreListResponse['genres']> {
  if (cachedGenreList?.length) return cachedGenreList
  if (genreListInflight) return genreListInflight
  const lang = options.language ?? 'en-US'
  genreListInflight = tmdbGet<TmdbGenreListResponse>('/genre/movie/list', {
    ...options,
    params: { language: lang },
  })
    .then((data) => {
      const list = Array.isArray(data.genres) ? data.genres : []
      cachedGenreList = list
      return list
    })
    .finally(() => {
      genreListInflight = null
    })
  return genreListInflight
}

export async function discoverMoviesByGenre(
  genreId: number,
  options: { signal?: AbortSignal; page?: number; language?: string } = {},
): Promise<TmdbSearchResponse> {
  return tmdbGet<TmdbSearchResponse>('/discover/movie', {
    ...options,
    params: {
      with_genres: String(genreId),
      sort_by: 'popularity.desc',
      page: String(options.page ?? 1),
      include_adult: 'false',
      language: options.language ?? 'en-US',
    },
  })
}

export async function fetchTopRatedMovies(
  options: { signal?: AbortSignal; page?: number; language?: string } = {},
): Promise<TmdbSearchResponse> {
  return tmdbGet<TmdbSearchResponse>('/movie/top_rated', {
    ...options,
    params: {
      page: String(options.page ?? 1),
      language: options.language ?? 'en-US',
    },
  })
}

export async function fetchMovieDetails(
  movieId: number,
  options: { signal?: AbortSignal; language?: string } = {},
): Promise<TmdbMovieDetails> {
  return tmdbGet<TmdbMovieDetails>(`/movie/${movieId}`, {
    ...options,
    params: {
      language: options.language ?? 'en-US',
    },
  })
}

export async function fetchMovieCredits(
  movieId: number,
  options: { signal?: AbortSignal } = {},
): Promise<TmdbCredits> {
  return tmdbGet<TmdbCredits>(`/movie/${movieId}/credits`, {
    ...options,
    params: {},
  })
}

export async function fetchWatchProviders(
  movieId: number,
  options: { signal?: AbortSignal } = {},
): Promise<TmdbWatchProvidersResponse> {
  return tmdbGet<TmdbWatchProvidersResponse>(`/movie/${movieId}/watch/providers`, {
    ...options,
    params: {},
  })
}

/** Warm HTTP cache for snappier navigations (detail + credits + providers). */
export function prefetchMovieBundle(movieId: number): void {
  if (!getApiKey()) return
  const key = String(movieId)
  if (prefetchInFlight.has(key)) return
  prefetchInFlight.add(key)
  void Promise.allSettled([
    fetchMovieDetails(movieId),
    fetchMovieCredits(movieId),
    fetchWatchProviders(movieId),
  ]).finally(() => {
    prefetchInFlight.delete(key)
  })
}
