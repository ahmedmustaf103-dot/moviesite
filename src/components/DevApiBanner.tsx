import { getApiKey } from '../tmdb'

/** Dev-only: single prominent warning when the TMDB key is missing */
export function DevApiBanner() {
  if (!import.meta.env.DEV) return null
  if (getApiKey()) return null

  return (
    <div className="dev-api-banner" role="status">
      <strong>Dev mode:</strong> Set{' '}
      <code className="inline-code">VITE_TMDB_API_KEY</code> in{' '}
      <code className="inline-code">.env</code> and restart{' '}
      <code className="inline-code">npm run dev</code>. Without it, API calls
      are skipped.
    </div>
  )
}
