# Cinefind — Movie search (TMDB)

React + TypeScript + Vite app: search and browse movies via [The Movie Database (TMDB)](https://www.themoviedb.org/) API.

## Setup

```bash
npm install
cp .env.example .env
# Add VITE_TMDB_API_KEY from https://www.themoviedb.org/settings/api
npm run dev
```

## Scripts

- `npm run dev` — local dev server  
- `npm run build` — production build to `dist/`  
- `npm run preview` — preview the build  

## Deploy

Static hosting with SPA fallback (see `netlify.toml`, `vercel.json`, `public/_redirects`). Client-side `VITE_*` keys are exposed in the bundle; use a serverless proxy if you need to hide the API key.

## License

Private / portfolio use — TMDB attribution required per [their terms](https://www.themoviedb.org/documentation/api/terms-of-use).
