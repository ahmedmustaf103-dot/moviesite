import { useState } from 'react'
import { posterSrc, posterThumbSrc } from '../tmdb'

type PosterImageProps = {
  posterPath: string | null
  alt: string
  className?: string
  imgClassName?: string
  wrapperClassName?: string
  width?: number
  height?: number
}

export function PosterImage({
  posterPath,
  alt,
  className = '',
  imgClassName = '',
  wrapperClassName = '',
  width = 500,
  height = 750,
}: PosterImageProps) {
  const full = posterSrc(posterPath)
  const thumb = posterThumbSrc(posterPath)
  const [loaded, setLoaded] = useState(false)

  if (!full) {
    return (
      <div
        className={`poster-frame poster-frame--empty ${wrapperClassName}`}
        role="img"
        aria-label={alt || 'No poster'}
      />
    )
  }

  return (
    <div className={`poster-frame ${wrapperClassName}`}>
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="poster-frame__lqip"
          width={92}
          height={138}
          aria-hidden
        />
      ) : null}
      <img
        src={full}
        alt={alt}
        width={width}
        height={height}
        className={`poster-frame__full ${loaded ? 'is-loaded' : ''} ${className} ${imgClassName}`.trim()}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
