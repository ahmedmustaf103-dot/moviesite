import { Link } from 'react-router-dom'
import { useViewTransitionNav } from '../hooks/useViewTransitionNav'
import { prefetchMovieBundle } from '../tmdb'
import { formatRating } from '../movieFormat'
import type { TmdbMovieSummary } from '../types/tmdb'
import { PosterImage } from './PosterImage'
import { WatchlistHeart } from './WatchlistHeart'

type Props = {
  movie: TmdbMovieSummary
}

export function MovieCard({ movie }: Props) {
  const viewTransition = useViewTransitionNav()
  const year = movie.release_date
    ? String(movie.release_date).slice(0, 4)
    : '—'
  const rating = formatRating(movie.vote_average ?? 0, movie.vote_count)

  return (
    <li className="grid__cell">
      <WatchlistHeart movie={movie} />
      <Link
        to={`/movie/${movie.id}`}
        className="card-link"
        aria-label={`${movie.title}, view details`}
        viewTransition={viewTransition}
        onPointerEnter={() => prefetchMovieBundle(movie.id)}
      >
        <article className="card">
          <div className="card__poster-wrap">
            <PosterImage
              posterPath={movie.poster_path}
              alt=""
              wrapperClassName="card__poster-frame"
              imgClassName="card__poster"
            />
            <div className="card__badge" aria-label="TMDB rating">
              ★ {rating}
            </div>
          </div>
          <div className="card__body">
            <h2 className="card__title">{movie.title}</h2>
            <p className="card__meta">
              <span>{year}</span>
              {movie.original_language ? (
                <>
                  <span className="card__dot" aria-hidden />
                  <span className="card__lang">
                    {String(movie.original_language).toUpperCase()}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </article>
      </Link>
    </li>
  )
}
