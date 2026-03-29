/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY?: string
  readonly VITE_WATCH_REGION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
