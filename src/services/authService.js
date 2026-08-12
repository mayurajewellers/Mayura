import { STORAGE_KEYS } from '@constants/routes'

/**
 * authService — TEMPORARY frontend-only mock authentication.
 *
 * There is NO backend yet. This module exists so the UI (sign-in / register
 * modal and pages) has a single integration point: when a real API arrives,
 * replace the bodies of `register`, `signIn` and `signOut` with fetch calls
 * and nothing else in the app needs to change.
 *
 * Security notes for the demo implementation:
 *  - Passwords are NEVER stored in plain text. A one-way SHA-256 digest is
 *    kept purely so the demo can tell "right password" from "wrong password".
 *  - This is NOT real security and is clearly labelled as a demonstration.
 *  - No sensitive personal data beyond name + email is persisted.
 */

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.auth)) ?? { users: [], session: null }
  } catch {
    return { users: [], session: null }
  }
}

const write = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state))
  } catch {
    /* storage unavailable — the demo simply won't persist */
  }
}

async function digest(text) {
  if (!window.crypto?.subtle) return `plainfallback:${text.length}:${text.slice(0, 2)}`
  const data = new TextEncoder().encode(`mayura-demo::${text}`)
  const hash = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const authService = {
  /** The signed-in user (demo session), or null. */
  currentUser() {
    const { users, session } = read()
    if (!session) return null
    return users.find((u) => u.email === session.email) ?? null
  },

  /* FUTURE API INTEGRATION POINT:
     replace with `POST /api/auth/register`. */
  async register({ name, email, password }) {
    const state = read()
    const normalised = email.trim().toLowerCase()
    if (state.users.some((u) => u.email === normalised)) {
      return { ok: false, error: 'An account with this email already exists. Try signing in instead.' }
    }
    const passwordDigest = await digest(password)
    const user = { name: name.trim(), email: normalised, passwordDigest, createdAt: new Date().toISOString() }
    state.users.push(user)
    state.session = { email: normalised, startedAt: new Date().toISOString() }
    write(state)
    return { ok: true, user: { name: user.name, email: user.email } }
  },

  /* FUTURE API INTEGRATION POINT:
     replace with `POST /api/auth/login`. */
  async signIn({ email, password }) {
    const state = read()
    const normalised = email.trim().toLowerCase()
    const user = state.users.find((u) => u.email === normalised)
    if (!user) return { ok: false, error: 'No account found with this email. Create one to continue.' }
    const passwordDigest = await digest(password)
    if (passwordDigest !== user.passwordDigest) {
      return { ok: false, error: 'That password does not match. Please try again.' }
    }
    state.session = { email: normalised, startedAt: new Date().toISOString() }
    write(state)
    return { ok: true, user: { name: user.name, email: user.email } }
  },

  /* FUTURE API INTEGRATION POINT: `POST /api/auth/logout`. */
  signOut() {
    const state = read()
    state.session = null
    write(state)
  },
}

export default authService
