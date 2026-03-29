import type {
  TmdbProvider,
  TmdbWatchProviderRegion,
  TmdbWatchProvidersResponse,
} from './types/tmdb'
import { getWatchRegion } from './tmdb'

export function pickProviderRegion(
  data: TmdbWatchProvidersResponse | null | undefined,
): TmdbWatchProviderRegion | null {
  if (!data?.results) return null
  const want = getWatchRegion()
  return (
    data.results[want] ||
    data.results.US ||
    Object.values(data.results)[0] ||
    null
  )
}

export interface ProviderGroup {
  label: string
  providers: TmdbProvider[]
}

export function groupProviders(region: TmdbWatchProviderRegion | null): ProviderGroup[] {
  if (!region) return []
  const groups: ProviderGroup[] = []
  const push = (label: string, key: 'flatrate' | 'rent' | 'buy') => {
    const arr = region[key]
    if (Array.isArray(arr) && arr.length) groups.push({ label, providers: arr })
  }
  push('Stream', 'flatrate')
  push('Rent', 'rent')
  push('Buy', 'buy')
  return groups
}
