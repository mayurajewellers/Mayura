import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/* --------------------------------------------------------------------------
   useScrollPosition — a "past threshold" flag for the navbar, with hysteresis.

   `threshold` is either a number (legacy: enter == exit) or `{ enter, exit }`.
   Hysteresis matters for any sticky header that changes its own height:
   collapsing the header shifts layout, the browser's scroll anchoring nudges
   scrollY, and with a single threshold that nudge can flip the state straight
   back — an expand/compact feedback loop that reads as vibration. Keeping the
   enter point comfortably above the exit point (by more than the header's
   height delta) makes every state change one-way and stable.

   State is only committed when the derived values actually change, so the
   header never re-renders per scrolled pixel.
   -------------------------------------------------------------------------- */
export function useScrollPosition(threshold = 24) {
  const { enter, exit } =
    typeof threshold === 'number' ? { enter: threshold, exit: threshold } : threshold

  const [state, setState] = useState({ scrolled: false, direction: 'up' })
  const lastY = useRef(0)

  useEffect(() => {
    let frame = null

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        const y = window.scrollY
        const direction = y > lastY.current && y > 120 ? 'down' : 'up'
        lastY.current = y

        setState((current) => {
          /* Hysteresis: enter compact above `enter`, leave it only below
             `exit`; anywhere in between keeps the current state. */
          const scrolled = current.scrolled ? y > exit : y > enter
          if (scrolled === current.scrolled && direction === current.direction) return current
          return { scrolled, direction }
        })
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [enter, exit])

  return state
}

/* --------------------------------------------------------------------------
   useLockBodyScroll — freeze the page behind a drawer or modal without the
   layout jumping as the scrollbar disappears.
   -------------------------------------------------------------------------- */
export function useLockBodyScroll(locked = false) {
  useLayoutEffect(() => {
    if (!locked) return undefined
    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [locked])
}

/* --------------------------------------------------------------------------
   useMediaQuery
   -------------------------------------------------------------------------- */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const list = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)
    setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/* --------------------------------------------------------------------------
   useLocalStorageState — persisted state that degrades gracefully when
   storage is unavailable (private browsing, quota exceeded).
   -------------------------------------------------------------------------- */
export function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage full or blocked — the app keeps working in memory */
    }
  }, [key, value])

  return [value, setValue]
}

/* --------------------------------------------------------------------------
   useOnClickOutside — closes menus and dropdowns.
   -------------------------------------------------------------------------- */
export function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener, { passive: true })
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, enabled])
}

/* --------------------------------------------------------------------------
   useEscapeKey
   -------------------------------------------------------------------------- */
export function useEscapeKey(handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const listener = (event) => {
      if (event.key === 'Escape') handler(event)
    }
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [handler, enabled])
}

/* --------------------------------------------------------------------------
   useFocusTrap — keeps keyboard focus inside an open overlay.
   -------------------------------------------------------------------------- */
export function useFocusTrap(ref, enabled = true) {
  useEffect(() => {
    if (!enabled || !ref.current) return undefined
    const node = ref.current
    const previouslyFocused = document.activeElement

    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const focusables = () => Array.from(node.querySelectorAll(selector)).filter((el) => el.offsetParent !== null)

    const first = focusables()[0]
    if (first) window.requestAnimationFrame(() => first.focus())

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [ref, enabled])
}

/* --------------------------------------------------------------------------
   useDocumentTitle
   -------------------------------------------------------------------------- */
export function useDocumentTitle(title, { suffix = 'Mayura Jewellers' } = {}) {
  useEffect(() => {
    if (!title) return undefined
    const previous = document.title
    document.title = title === suffix ? title : `${title} — ${suffix}`
    return () => {
      document.title = previous
    }
  }, [title, suffix])
}

/* --------------------------------------------------------------------------
   useCountUp — animates a number into view once.
   -------------------------------------------------------------------------- */
export function useCountUp(target, { duration = 1600, start = false } = {}) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!start) return undefined
    const from = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - from) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [target, duration, start])

  return value
}

/* --------------------------------------------------------------------------
   useCopyToClipboard
   -------------------------------------------------------------------------- */
export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), resetAfter)
        return true
      } catch {
        return false
      }
    },
    [resetAfter],
  )

  return [copied, copy]
}

export { default as useAuth } from './useAuth'

