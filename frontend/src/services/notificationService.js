import { STORAGE_KEYS } from '@constants/routes'

/**
 * notificationService — wraps the standard browser Notification API.
 *
 * A website cannot grant itself notification permission; all this service can
 * do is (a) remember whether we have already asked, and (b) call
 * `Notification.requestPermission()` when — and only when — the customer
 * explicitly opts in from the Mayura-branded pre-permission modal.
 *
 * FUTURE API INTEGRATION POINT: when a push backend exists, subscribe the
 * service-worker push manager inside `requestPermission()` after 'granted'.
 */

export const notificationService = {
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window
  },

  /** 'granted' | 'denied' | 'default' | 'unsupported' */
  permission() {
    return this.isSupported() ? Notification.permission : 'unsupported'
  },

  /** Have we already shown the branded prompt this browser? */
  hasPrompted() {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.notificationPrompt) !== null
    } catch {
      return true // storage blocked — err on the side of not nagging
    }
  },

  /** Record the customer's choice so we never nag. */
  markPrompted(outcome) {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.notificationPrompt,
        JSON.stringify({ outcome, at: new Date().toISOString() }),
      )
    } catch {
      /* fine — worst case the prompt could appear again in a new session */
    }
  },

  /** Should the branded modal be shown at all? */
  shouldPrompt() {
    if (!this.isSupported()) return false
    if (this.hasPrompted()) return false
    // Never re-ask a browser that has already granted or denied.
    return Notification.permission === 'default'
  },

  /** Called only from the explicit "Allow notifications" button. */
  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    try {
      const result = await Notification.requestPermission()
      return result // 'granted' | 'denied' | 'default'
    } catch {
      return 'denied'
    }
  },
}

export default notificationService
