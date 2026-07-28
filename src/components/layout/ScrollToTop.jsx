import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Restores scroll to the top on navigation, but honours in-page hash links
 * (e.g. /about#craftsmanship) by scrolling that element into view instead.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        window.requestAnimationFrame(() =>
          target.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        )
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])

  return null
}
