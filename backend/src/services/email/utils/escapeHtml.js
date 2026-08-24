/**
/**
 * Utility to safely escape user-generated input inserted into HTML email bodies.
 * Protects against HTML / Script injection attacks.
 */
export const escapeHtml = (text) => {
  if (text === null || text === undefined) return ''
  if (typeof text !== 'string') text = String(text)
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default escapeHtml
