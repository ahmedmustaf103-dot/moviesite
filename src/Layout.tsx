import { Outlet, useLocation } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { SiteSearchBar } from './components/SiteSearchBar'
import { TopMenu } from './components/TopMenu'

export default function Layout() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <TopMenu />
      <SiteSearchBar />
      <div
        key={pathname}
        id="main-content"
        tabIndex={-1}
        className="route-outlet"
      >
        <Outlet />
      </div>
      <footer className="footer">
        <div className="footer__row">
          <ThemeToggle />
          <p>
            This product uses the TMDB API but is not endorsed or certified by{' '}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
            >
              TMDB
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}
