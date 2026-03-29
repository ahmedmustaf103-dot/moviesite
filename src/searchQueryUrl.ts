import type { NavigateFunction, SetURLSearchParams } from 'react-router-dom'

export const SEARCH_URL_KEY = 'q'

export function setSearchInParams(
  setSearchParams: SetURLSearchParams,
  value: string,
): void {
  setSearchParams(
    (prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(SEARCH_URL_KEY, value)
      else next.delete(SEARCH_URL_KEY)
      return next
    },
    { replace: true },
  )
}

export function navigateToHomeWithSearch(
  navigate: NavigateFunction,
  trimmedQuery: string,
): void {
  const params = new URLSearchParams()
  params.set(SEARCH_URL_KEY, trimmedQuery)
  navigate({ pathname: '/', search: `?${params.toString()}` }, { replace: true })
}
