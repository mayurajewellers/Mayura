import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { STORAGE_KEYS } from '@constants/routes'
import { notificationService } from '@/services/notificationService'
import { authService } from '@/services/authService'
import NotificationPrompt from './NotificationPrompt'
import AuthModal from './AuthModal'

const NOTIFICATION_DELAY_MS = 4000
const AUTH_DELAY_MS = 3000

/* Pages where an engagement popup would get in the way of a task. */
const QUIET_PATHS = [
  /^\/login/,
  /^\/signup/,
  /^\/forgot-password/,
  /^\/checkout/,
  /^\/order-confirmed/,
  /^\/cart/,
  /^\/video-consultation/,
]

const hasSeenAuthPrompt = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.authPrompt) !== null
  } catch {
    return true
  }
}

const markAuthPrompt = () => {
  try {
    window.localStorage.setItem(STORAGE_KEYS.authPrompt, new Date().toISOString())
  } catch {
    /* fine */
  }
}

/**
 * Orchestrates the first-visit engagement sequence:
 *
 *   1. the Mayura notification pre-permission modal (first), then
 *   2. the sign-in / register modal — never both at once, each at most
 *      once per browser, and never on checkout or auth pages.
 */
export default function EngagementManager() {
  const location = useLocation()
  const [showNotification, setShowNotification] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const timers = useRef([])

  const quiet = () => QUIET_PATHS.some((re) => re.test(window.location.pathname))

  const scheduleAuth = (delay = AUTH_DELAY_MS) => {
    if (hasSeenAuthPrompt() || authService.currentUser()) return
    const t = window.setTimeout(() => {
      if (quiet() || hasSeenAuthPrompt() || authService.currentUser()) return
      markAuthPrompt()
      setShowAuth(true)
    }, delay)
    timers.current.push(t)
  }

  /*
   * The sequence is scheduled on mount and fully torn down on unmount.
   *
   * NOTE: no "already started" ref guard here — under React 18 StrictMode
   * (development), effects run set-up → clean-up → set-up on mount. A ref
   * guard survives that cycle, so the second set-up would bail out right
   * after the clean-up cleared the timers, and the popups would never fire
   * on localhost. Scheduling idempotently and relying on the clean-up is
   * both StrictMode-safe and production-correct.
   */
  useEffect(() => {
    timers.current = []

    const t = window.setTimeout(() => {
      if (quiet()) return
      if (notificationService.shouldPrompt()) {
        setShowNotification(true) // auth is scheduled after this closes
      } else {
        scheduleAuth()
      }
    }, NOTIFICATION_DELAY_MS)
    timers.current.push(t)

    const cleanup = timers.current
    return () => cleanup.forEach((id) => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* location is read live inside quiet(); the effect runs once by design. */
  void location

  return (
    <>
      <NotificationPrompt
        open={showNotification}
        onClose={() => setShowNotification(false)}
        onResult={() => scheduleAuth()}
      />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  )
}
