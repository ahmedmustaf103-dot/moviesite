import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getWatchRegion, profileSrc, providerLogoSrc } from '../tmdb'
import { getFriendlySearchError } from '../searchErrors'
import { formatRating, formatReleaseDate } from '../movieFormat'
import { WatchlistHeart } from '../components/WatchlistHeart'
import { PosterImage } from '../components/PosterImage'
import { useMovieDetail } from '../hooks/useMovieDetail'
import { useViewTransitionNav } from '../hooks/useViewTransitionNav'
import { groupProviders } from '../movieDetailUtils'

export default function MovieDetailPage() {
  const viewTransition = useViewTransitionNav()
  const location = useLocation()
  const { id: idParam } = useParams()
  const movieId = Number(idParam)
  const idValid = Number.isInteger(movieId) && movieId > 0
  const {
    apiKeyPresent,
    movie,
    credits,
    providerRegion,
    loading,
    error,
    retryLoad,
  } = useMovieDetail(movieId, idValid)

  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const errorCopy = error ? getFriendlySearchError(error, 'movie') : null
  const rating = movie
    ? formatRating(movie.vote_average, movie.vote_count ?? 0)
    : null
  const releaseLabel = movie ? formatReleaseDate(movie.release_date) : null

  const directors =
    credits?.crew?.filter((c) => c.job === 'Director').map((c) => c.name) || []
  const directorLabel = directors.length ? directors.join(', ') : '—'

  const cast = Array.isArray(credits?.cast) ? credits.cast.slice(0, 14) : []
  const providerGroups = groupProviders(providerRegion)
  const regionCode = getWatchRegion()

  return (
    <>
      <main
        className="main main--detail"
        aria-busy={loading && idValid && apiKeyPresent ? true : undefined}
      >
        <p id="detail-status" className="visually-hidden" aria-live="polite">
          {loading && idValid && apiKeyPresent
            ? 'Loading movie details.'
            : error && !loading
              ? 'Could not load movie details.'
              : movie
                ? `Loaded ${movie.title}.`
                : ''}
        </p>

        <div
          className={`toast${copied ? ' toast--show' : ''}`}
          role="status"
          aria-hidden={!copied}
        >
          Link copied to clipboard
        </div>

        {!apiKeyPresent ? (
          <div className="notice notice--warn" role="status">
            <p className="notice__title">TMDB API key missing</p>
            <p className="notice__text">
              Add <code className="inline-code">.env</code> with{' '}
              <code className="inline-code">VITE_TMDB_API_KEY</code> and restart
              the dev server.
            </p>
          </div>
        ) : null}

        {idValid && !apiKeyPresent && (
          <div className="empty empty--inline" role="status">
            <p className="empty__title">Set up your API key</p>
            <p className="empty__hint">
              Search and movie pages need a TMDB key. Add it to{' '}
              <code className="inline-code">.env</code>, restart{' '}
              <code className="inline-code">npm run dev</code>, then refresh this
              page.
            </p>
            <Link
              to="/"
              className="button-ghost detail-inline-link"
              viewTransition={viewTransition}
            >
              Back to home
            </Link>
          </div>
        )}

        {!idValid && (
          <div className="empty empty--error" role="alert">
            <p className="empty__title">Invalid movie link</p>
            <p className="empty__hint">
              This URL doesn’t point to a valid TMDB movie.
            </p>
            <Link
              to="/"
              className="button-primary detail-inline-link"
              viewTransition={viewTransition}
            >
              Go home
            </Link>
          </div>
        )}

        {idValid && apiKeyPresent && loading && (
          <div
            className="state-bar"
            role="status"
            aria-label="Loading movie details"
          >
            <span className="spinner" aria-hidden />
            <span className="state-bar__text">Loading movie details…</span>
          </div>
        )}

        {idValid && apiKeyPresent && loading && (
          <div className="detail detail--loading" aria-busy="true">
            <div className="detail__grid">
              <div className="detail__poster-wrap">
                <div className="card__skel card__skel--poster detail__skel-poster" />
              </div>
              <div className="detail__content">
                <div className="card__skel card__skel--title detail__skel-title" />
                <div className="card__skel card__skel--meta detail__skel-line" />
                <div className="card__skel card__skel--meta detail__skel-line detail__skel-line--wide" />
                <div className="card__skel card__skel--meta detail__skel-line detail__skel-line--wide" />
                <div className="card__skel card__skel--meta detail__skel-line detail__skel-line--wide" />
              </div>
            </div>
          </div>
        )}

        {idValid && apiKeyPresent && !loading && error && errorCopy && (
          <div className="empty empty--error" role="alert">
            <div className="empty__icon" aria-hidden>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
            </div>
            <p className="empty__title">{errorCopy.title}</p>
            <p className="empty__hint">{errorCopy.message}</p>
            <div className="empty__actions">
              <button
                type="button"
                className="button-primary"
                onClick={retryLoad}
              >
                Try again
              </button>
              <Link
                to="/"
                className="button-ghost detail-inline-link"
                viewTransition={viewTransition}
              >
                Back to home
              </Link>
            </div>
          </div>
        )}

        {idValid && apiKeyPresent && !loading && movie && (
          <article className="detail">
            <div className="detail__hero-actions">
              <WatchlistHeart movie={movie} className="fav-btn--large" />
              <button
                type="button"
                className="button-ghost share-btn"
                onClick={copyLink}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" x2="12" y1="2" y2="15" />
                </svg>
                Copy link
              </button>
            </div>
            <p
              className="detail__share-url"
              title={typeof window !== 'undefined' ? window.location.href : ''}
            >
              <span className="detail__share-label">Shareable path</span>
              <code className="detail__share-code">{location.pathname}</code>
            </p>

            <div className="detail__grid">
              <div className="detail__poster-wrap">
                {movie.poster_path ? (
                  <PosterImage
                    posterPath={movie.poster_path}
                    alt=""
                    imgClassName="detail__poster"
                  />
                ) : (
                  <div
                    className="detail__poster detail__poster--placeholder"
                    role="img"
                    aria-label="No poster"
                  />
                )}
              </div>
              <div className="detail__content">
                <h1 className="detail__title">{movie.title}</h1>
                {movie.tagline ? (
                  <p className="detail__tagline">{movie.tagline}</p>
                ) : null}

                <dl className="detail__stats">
                  <div className="detail__stat">
                    <dt>Release date</dt>
                    <dd>{releaseLabel}</dd>
                  </div>
                  <div className="detail__stat">
                    <dt>Rating</dt>
                    <dd>
                      ★ {rating}
                      {(movie.vote_count ?? 0) > 0 ? (
                        <span className="detail__votes">
                          {' '}
                          ({(movie.vote_count ?? 0).toLocaleString()} votes)
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="detail__stat">
                    <dt>Director</dt>
                    <dd>{directorLabel}</dd>
                  </div>
                  {(movie.runtime ?? 0) > 0 ? (
                    <div className="detail__stat">
                      <dt>Runtime</dt>
                      <dd>{movie.runtime} min</dd>
                    </div>
                  ) : null}
                </dl>

                {Array.isArray(movie.genres) && movie.genres.length > 0 ? (
                  <ul className="detail__genres">
                    {movie.genres.map((g) => (
                      <li key={g.id}>{g.name}</li>
                    ))}
                  </ul>
                ) : null}

                <section className="detail__overview-section">
                  <h2 className="detail__overview-heading">Overview</h2>
                  <p className="detail__overview">
                    {movie.overview?.trim()
                      ? movie.overview
                      : 'No overview available for this title.'}
                  </p>
                </section>

                {cast.length > 0 ? (
                  <section className="detail__cast-section">
                    <h2 className="detail__overview-heading">Cast</h2>
                    <div className="cast-scroll">
                      {cast.map((person) => {
                        const ps = profileSrc(person.profile_path)
                        return (
                          <div key={person.id} className="cast-card">
                            {ps ? (
                              <img
                                className="cast-card__img"
                                src={ps}
                                alt=""
                                width="185"
                                height="278"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className="cast-card__img cast-card__img--placeholder"
                                aria-hidden
                              />
                            )}
                            <p className="cast-card__name">{person.name}</p>
                            <p className="cast-card__char">{person.character}</p>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ) : null}

                {providerGroups.length > 0 ? (
                  <section className="detail__watch-section">
                    <h2 className="detail__overview-heading">
                      Where to watch ({regionCode})
                    </h2>
                    {providerRegion?.link ? (
                      <p className="detail__watch-linkwrap">
                        <a
                          href={providerRegion.link}
                          className="detail__watch-external"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View all options on TMDB →
                        </a>
                      </p>
                    ) : null}
                    {providerGroups.map((g) => (
                      <div key={g.label} className="provider-group">
                        <h3 className="provider-group__label">{g.label}</h3>
                        <ul className="provider-list">
                          {g.providers.map((p) => {
                            const logo = providerLogoSrc(p.logo_path)
                            return (
                              <li
                                key={`${g.label}-${p.provider_id}`}
                                className="provider-pill"
                              >
                                {logo ? (
                                  <img
                                    className="provider-pill__logo"
                                    src={logo}
                                    alt=""
                                    width="24"
                                    height="24"
                                  />
                                ) : null}
                                <span>{p.provider_name}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </section>
                ) : (
                  <section className="detail__watch-section detail__watch-section--empty">
                    <h2 className="detail__overview-heading">
                      Where to watch ({regionCode})
                    </h2>
                    <p className="detail__overview">
                      No streaming data for this region in TMDB. Try another
                      region via{' '}
                      <code className="inline-code">VITE_WATCH_REGION</code> in{' '}
                      <code className="inline-code">.env</code>.
                    </p>
                  </section>
                )}
              </div>
            </div>
          </article>
        )}
      </main>
    </>
  )
}
