import { STORAGE_KEYS } from '@constants/routes'

/**
 * newsletterService — Mayura Jewellers Insiders signup.
 *
 * There is NO backend yet, so signups are validated on the client and kept
 * in localStorage only. The UI is explicit that this is a frontend
 * confirmation — nothing is sent anywhere.
 *
 * FUTURE API INTEGRATION POINT: replace the body of `subscribe` with
 * `POST /api/insiders` and delete the localStorage write.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.insider)) ?? []
  } catch {
    return []
  }
}

export const newsletterService = {
  validate(email) {
    if (!email || !email.trim()) return 'Please enter your email address.'
    if (!EMAIL_RE.test(email.trim())) return 'That does not look like a valid email address.'
    return null
  },

  isSubscribed(email) {
    return read().some((entry) => entry.email === email.trim().toLowerCase())
  },

  async subscribe({ email, segment = null }) {
    const error = this.validate(email)
    if (error) return { ok: false, error }

    const normalised = email.trim().toLowerCase()
    const entries = read()
    if (entries.some((entry) => entry.email === normalised)) {
      return { ok: true, alreadySubscribed: true }
    }

    entries.push({ email: normalised, segment, at: new Date().toISOString() })
    try {
      window.localStorage.setItem(STORAGE_KEYS.insider, JSON.stringify(entries))
    } catch {
      return { ok: false, error: 'Could not save your signup on this device. Please try again.' }
    }
    return { ok: true, alreadySubscribed: false }
  },
}

export default newsletterService
