import type { ApiError } from './types/tmdb'

export type ErrorContext = 'search' | 'movie'

export function getFriendlySearchError(
  err: unknown,
  context: ErrorContext = 'search',
): { title: string; message: string } {
  if (!err) {
    return {
      title: 'Something went wrong',
      message:
        context === 'movie'
          ? 'We couldn’t load this title. Please go back and try again.'
          : 'We couldn’t complete your search. Please wait a moment and try again.',
    }
  }

  const e = err as ApiError
  if (e.code === 'NETWORK' || (e as Error).name === 'TypeError') {
    return {
      title: 'You’re offline or the request was blocked',
      message:
        'We couldn’t reach The Movie Database. Check your internet connection, disable VPN or firewall rules that block TMDB, then try again.',
    }
  }

  const status = e.status

  if (status === 401 || status === 403) {
    return {
      title: 'API key problem',
      message:
        'TMDB didn’t accept your API key. Double-check VITE_TMDB_API_KEY in your .env file, save it, and restart the dev server.',
    }
  }

  if (status === 429) {
    return {
      title: 'Too many requests',
      message:
        'The movie database is rate-limiting requests right now. Wait a minute and try your search again.',
    }
  }

  if (status === 404) {
    if (context === 'movie') {
      return {
        title: 'Movie not found',
        message:
          'TMDB has no record for this ID. It may have been removed, or the link is wrong. Try searching again from home.',
      }
    }
    return {
      title: 'Search service unavailable',
      message:
        'The search endpoint couldn’t be reached. TMDB may be updating — try again shortly.',
    }
  }

  if (status !== undefined && status >= 500 && status < 600) {
    return {
      title: 'TMDB is having trouble',
      message:
        'Their servers returned an error. It’s usually temporary — try again in a little while.',
    }
  }

  const detail =
    typeof e.detail === 'string' && e.detail.trim()
      ? e.detail.trim()
      : typeof e.message === 'string' &&
          e.message.trim() &&
          e.message !== 'HTTP_ERROR' &&
          e.message !== 'NETWORK'
        ? e.message.trim()
        : null

  if (detail) {
    return {
      title:
        context === 'movie' ? 'Couldn’t load this movie' : 'Couldn’t load results',
      message: `${detail} If this keeps happening, try again later or check TMDB’s status.`,
    }
  }

  return {
    title: context === 'movie' ? 'Couldn’t load this movie' : 'Couldn’t load results',
    message:
      'Something unexpected happened while talking to The Movie Database. Please try again.',
  }
}
