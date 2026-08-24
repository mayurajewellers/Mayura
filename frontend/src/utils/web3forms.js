/**
 * Web3Forms — the only thing on this site that talks to a server.
 *
 * Web3Forms accepts a POST straight from the browser and emails the payload to
 * the inbox its access key was issued for, so the enquiry form works without
 * this project growing a backend. The recipient address is fixed to the key,
 * not chosen by the client, so the form cannot be repointed by a visitor.
 *
 * The key lives in VITE_WEB3FORMS_ACCESS_KEY (see .env.example). Vite inlines
 * it into the bundle, which is exactly how Web3Forms is designed to be used —
 * the key is a public, write-only identifier. Nothing secret belongs here.
 */

const ENDPOINT = 'https://api.web3forms.com/submit'

const NOT_CONFIGURED =
  'The enquiry form is not connected yet. Please send us a WhatsApp or call the shop — we will answer straight away.'

const NO_NETWORK =
  'We could not reach our mail service. Check your connection and try once more, or reach us on WhatsApp.'

const UNKNOWN =
  'Your message could not be sent just now. Please try again in a moment, or reach us on WhatsApp.'

export const WEB3FORMS_ACCESS_KEY = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? '').trim()

/** False until the access key is supplied, so the UI can say something useful. */
export const isWeb3FormsConfigured = WEB3FORMS_ACCESS_KEY.length > 0

/**
 * POST an enquiry to Web3Forms.
 *
 * @param {Record<string, unknown>} fields  Payload; keys become the labels in
 *   the email. `email` is reserved — Web3Forms uses it as the reply-to address.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<object>} The parsed Web3Forms response.
 * @throws {Error} With a message written for the visitor, not the console.
 */
export async function submitToWeb3Forms(fields, { signal } = {}) {
  if (!isWeb3FormsConfigured) throw new Error(NOT_CONFIGURED)

  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_ACCESS_KEY, ...fields }),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error(NO_NETWORK)
  }

  let result = {}
  try {
    result = await response.json()
  } catch {
    /* a non-JSON body is handled as a failure below */
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? result.body?.message ?? UNKNOWN)
  }

  return result
}
