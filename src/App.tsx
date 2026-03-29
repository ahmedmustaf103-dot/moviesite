import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import { DevApiBanner } from './components/DevApiBanner'
import { ErrorBoundary } from './components/ErrorBoundary'

const HomePage = lazy(() => import('./pages/HomePage'))
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'))
const GenreBrowsePage = lazy(() => import('./pages/GenreBrowsePage'))
const TopRatedPage = lazy(() => import('./pages/TopRatedPage'))

function PageFallback() {
  return (
    <div className="page-fallback" role="status" aria-label="Loading page">
      <span className="spinner spinner--page" aria-hidden />
      <p>Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <DevApiBanner />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="genre/:genreId" element={<GenreBrowsePage />} />
            <Route path="top-rated" element={<TopRatedPage />} />
            <Route path="movie/:id" element={<MovieDetailPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
