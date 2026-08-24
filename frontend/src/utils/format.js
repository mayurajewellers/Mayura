/** Indian-market formatting helpers — lakh/crore grouping, weights, dates. */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrPlain = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** ₹1,24,500 */
export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return inr.format(Number(value))
}

/** 1,24,500 — for when the symbol is rendered separately. */
export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return inrPlain.format(Number(value))
}

/** ₹1.25 L / ₹1.2 Cr — used in compact filter labels. */
export function formatPriceCompact(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 === 0 ? 0 : 2)} Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 2)} L`
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)} K`
  return `₹${n}`
}

/** 12.480 g */
export function formatWeight(grams) {
  if (grams == null) return '—'
  return `${Number(grams).toFixed(3)} g`
}

/** 0.75 ct */
export function formatCarat(carat) {
  if (!carat) return '—'
  return `${Number(carat).toFixed(2)} ct`
}

/** 24 March 2026 */
export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Percentage saved between MRP and selling price. */
export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

/** "necklace" → "Necklace"; "daily-wear" → "Daily Wear" */
export function titleCase(value = '') {
  return String(value)
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Trim a string to a word boundary. */
export function truncate(text = '', max = 140) {
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max)).trim()}…`
}

/** Deterministic estimated-delivery window, five working days out. */
export function estimatedDelivery(daysFromNow = 5, from = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() + daysFromNow)
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date)
}
