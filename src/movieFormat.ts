export function formatRating(
  voteAverage: number | undefined,
  voteCount?: number,
): string {
  const v = Number(voteAverage)
  if (!Number.isFinite(v) || v <= 0) return '—'
  if (voteCount === 0) return '—'
  return v.toFixed(1)
}

export function formatReleaseDate(iso: string | null | undefined): string {
  if (!iso || typeof iso !== 'string') return '—'
  try {
    const d = new Date(`${iso}T12:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(d)
  } catch {
    return iso
  }
}
