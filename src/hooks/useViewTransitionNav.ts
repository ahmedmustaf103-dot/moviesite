import { useEffect, useState } from 'react'

function viewTransitionNavEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return false
  return typeof document.startViewTransition === 'function'
}

/** For `<Link viewTransition={...} />` — Chromium route transitions without Reduced Motion. */
export function useViewTransitionNav(): boolean {
  const [enabled, setEnabled] = useState(viewTransitionNavEnabled)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(viewTransitionNavEnabled())
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return enabled
}
