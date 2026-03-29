/** Minimal movie shape returned by search, trending, etc. */
export interface TmdbMovieSummary {
  id: number
  title: string
  poster_path: string | null
  backdrop_path?: string | null
  overview?: string
  release_date?: string | null
  vote_average?: number
  vote_count?: number
  original_language?: string
}

export interface TmdbSearchResponse {
  page: number
  results: TmdbMovieSummary[]
  total_pages: number
  total_results: number
}

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbGenreListResponse {
  genres: TmdbGenre[]
}

export interface TmdbMovieDetails extends TmdbMovieSummary {
  tagline?: string
  runtime?: number
  genres?: TmdbGenre[]
}

export interface TmdbCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface TmdbCrewMember {
  id: number
  name: string
  job: string
}

export interface TmdbCredits {
  cast: TmdbCastMember[]
  crew: TmdbCrewMember[]
}

export interface TmdbProvider {
  provider_id: number
  provider_name: string
  logo_path: string | null
}

export interface TmdbWatchProviderRegion {
  link?: string
  flatrate?: TmdbProvider[]
  rent?: TmdbProvider[]
  buy?: TmdbProvider[]
}

export interface TmdbWatchProvidersResponse {
  results: Record<string, TmdbWatchProviderRegion>
}

export interface ApiError extends Error {
  code?: string
  status?: number
  detail?: string | null
  cause?: unknown
}
