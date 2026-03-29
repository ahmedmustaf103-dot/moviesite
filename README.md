# Cinefind

A responsive movie discovery app powered by **[The Movie Database (TMDB)](https://www.themoviedb.org/)**. Search titles, browse trending and top-rated lists, explore by genre, and save a local watchlist—built as a modern SPA with React and TypeScript.

**Repository:** [github.com/ahmedmustaf103-dot/moviesite](https://github.com/ahmedmustaf103-dot/moviesite)

## Live demo

**[▶ Open live app →](https://moviesite-tau-lake.vercel.app)** — hosted on [Vercel](https://vercel.com).

**Deploy in one click** (set `VITE_TMDB_API_KEY` in the host’s environment when asked):

| Platform | Action |
| -------- | ------ |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fahmedmustaf103-dot%2Fmoviesite&env=VITE_TMDB_API_KEY&envDescription=Get%20a%20free%20key%20at%20themoviedb.org%2Fsettings%2Fapi&envLink=https%3A%2F%2Fwww.themoviedb.org%2Fsettings%2Fapi) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ahmedmustaf103-dot/moviesite) |

On Netlify, add **`VITE_TMDB_API_KEY`** under **Site configuration → Environment variables** (and redeploy if needed).

### Deployed site shows no movies / empty trending

Vite **inlines** `VITE_TMDB_API_KEY` when you run **`npm run build`**. If the variable was missing during that build, the live site has no key forever until you rebuild.

1. **Vercel:** Project → **Settings** → **Environment Variables** → add `VITE_TMDB_API_KEY` (your TMDB key). Turn it on for **Production** and **Preview** (and Development if you use Vercel CLI builds).
2. Go to **Deployments** → open the latest deployment → **⋯** → **Redeploy** (do not use the old build cache if offered a choice to skip — you need a **new** build).
3. Wait for the build to finish, then hard-refresh the live URL.

The name must be exactly **`VITE_TMDB_API_KEY`** (not `TMDB_API_KEY`).

---

## Features

- **Search** — Debounced TMDB search with pagination (“load more”), synced to the URL (`?q=`) so queries are shareable and bookmarkable.
- **Discovery** — Trending (week), top-rated, and **genre** browse via TMDB discover.
- **Detail pages** — Cast, director, runtime, overview, and regional “where to watch” (configurable with `VITE_WATCH_REGION`).
- **Watchlist** — Saved in `localStorage` (device-only).
- **UX** — Loading and error states, optional view transitions (where supported), light/dark theme, poster blur placeholders (TMDB w92 → full image).
- **Quality** — React error boundary, banner when the API key is missing (dev + production hints), `AbortController` on network calls, route-level code splitting (`React.lazy` + `Suspense`).

---

## Tech stack

| Area        | Choices                                      |
| ----------- | -------------------------------------------- |
| UI          | React 19, TypeScript, CSS (design tokens)      |
| Tooling     | Vite 6, `@vitejs/plugin-react`               |
| Routing     | React Router 7                               |
| Data        | TMDB REST API v3 (`fetch`)                   |
| Deploy      | Netlify / Vercel / Cloudflare-friendly SPA   |

---

## Getting started

### Prerequisites

- **Node.js** 20+ recommended  
- A free **[TMDB API key](https://www.themoviedb.org/settings/api)**

### Install & run

```bash
git clone https://github.com/ahmedmustaf103-dot/moviesite.git
cd moviesite
npm install
cp .env.example .env
```

Edit `.env` and set your key:

```env
VITE_TMDB_API_KEY=your_key_here
```

Optional — default watch region for streaming providers (ISO 3166-1 alpha-2):

```env
VITE_WATCH_REGION=US
```

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Command           | Description                 |
| ----------------- | --------------------------- |
| `npm run dev`     | Start dev server with HMR   |
| `npm run build`   | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally        |

---

## Environment variables

| Variable              | Required | Description |
| --------------------- | -------- | ----------- |
| `VITE_TMDB_API_KEY`   | Yes*     | TMDB API key. *Required for live API calls; the UI still loads without it but shows setup hints. |
| `VITE_WATCH_REGION`   | No       | Region code for watch providers (default `US`). |

> **Security:** Any `VITE_*` variable is embedded in the client bundle. That is normal for a public TMDB key. Do **not** commit `.env`. If you ever need a secret key, proxy TMDB through a small serverless function instead.

---

## Project structure

```
src/
├── App.tsx              # Routes, lazy pages, error boundary shell
├── Layout.tsx           # Top nav, global search bar, outlet
├── main.tsx
├── tmdb.ts              # API helpers + image URLs
├── types/tmdb.ts        # Response / entity types
├── hooks/               # useMovieSearch, useMovieDetail, genres, etc.
├── pages/               # Home, detail, genre, top-rated, watchlist
├── components/          # Cards, poster, menus, theme toggle, …
└── index.css            # Theme variables, layout, a11y
```

Deploy configs live at the repo root: `netlify.toml`, `vercel.json`, and `public/_redirects` (SPA fallback to `index.html`).

---

## Accessibility & motion

- Skip link to main content  
- Focus styles on interactive controls  
- Respects **`prefers-reduced-motion`** for animations and view transitions  

---

## TMDB attribution

This product uses the TMDB API but is **not** endorsed or certified by TMDB. See [TMDB API terms of use](https://www.themoviedb.org/documentation/api/terms-of-use).

---

## License

Use for learning and portfolio. Ensure compliance with TMDB’s rules for any public deployment.
