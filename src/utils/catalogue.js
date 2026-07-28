import { PRODUCTS } from '@data/products'
import { DEPARTMENTS, TYPES } from '@data/categories'
import { COLLECTIONS } from '@data/collections'

/**
 * A single slug space across departments, jewellery types and signature
 * collections, so /collections/:slug resolves whichever the customer clicked.
 */
export function resolveGroup(slug) {
  const department = DEPARTMENTS.find((d) => d.slug === slug)
  if (department) {
    return {
      kind: 'department',
      slug,
      title: department.name,
      kicker: department.kicker,
      intro: department.longBlurb ?? department.blurb,
      heroImage: department.coverImage ?? department.image,
      match: (p) => p.departments.includes(slug),
    }
  }

  const type = TYPES.find((t) => t.slug === slug)
  if (type) {
    return {
      kind: 'type',
      slug,
      title: type.name,
      kicker: 'Shop by piece',
      intro: type.blurb,
      heroImage: type.image,
      match: (p) => p.type === slug,
    }
  }

  const collection = COLLECTIONS.find((c) => c.slug === slug)
  if (collection) {
    return {
      kind: 'collection',
      slug,
      title: collection.name,
      kicker: collection.kicker,
      intro: collection.intro,
      story: collection.story,
      meaning: collection.meaning,
      tagline: collection.tagline,
      heroImage: collection.heroImage,
      match: (p) => p.collection === slug,
    }
  }

  if (slug === 'all' || !slug) {
    return {
      kind: 'all',
      slug: 'all',
      title: 'The Complete Collection',
      kicker: 'Everything in store',
      intro:
        'Sixty pieces across gold, diamond, bridal and daily wear. Filter by metal, purity, price or occasion — or come in and we will do it for you over a cup of tea.',
      heroImage: '/images/editorial/trousseau-gold-set.jpg',
      match: () => true,
    }
  }

  return null
}

export const productsInGroup = (group) => (group ? PRODUCTS.filter(group.match) : [])

/* ---------------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest first' },
  { key: 'price-asc', label: 'Price — low to high' },
  { key: 'price-desc', label: 'Price — high to low' },
  { key: 'weight-desc', label: 'Weight — heaviest first' },
  { key: 'rating', label: 'Highest rated' },
]

const badgeRank = { Bestseller: 0, New: 1, Bridal: 2 }

export function sortProducts(list, key = 'featured') {
  const items = [...list]
  switch (key) {
    case 'price-asc':
      return items.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return items.sort((a, b) => b.price - a.price)
    case 'weight-desc':
      return items.sort((a, b) => b.grossWeight - a.grossWeight)
    case 'rating':
      return items.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    case 'newest':
      return items.sort(
        (a, b) => (a.badge === 'New' ? -1 : 1) - (b.badge === 'New' ? -1 : 1),
      )
    case 'featured':
    default:
      return items.sort(
        (a, b) =>
          (badgeRank[a.badge] ?? 9) - (badgeRank[b.badge] ?? 9) ||
          b.rating - a.rating,
      )
  }
}

export const EMPTY_FILTERS = {
  types: [],
  metals: [],
  purities: [],
  occasions: [],
  departments: [],
  priceMax: null,
  inStockOnly: false,
}

export function filterProducts(list, filters) {
  const f = { ...EMPTY_FILTERS, ...filters }
  return list.filter((p) => {
    if (f.types.length && !f.types.includes(p.type)) return false
    if (f.metals.length && !f.metals.includes(p.metalKey)) return false
    if (f.purities.length && !f.purities.some((k) => p.purity.startsWith(k))) return false
    if (f.departments.length && !f.departments.some((d) => p.departments.includes(d))) return false
    if (f.occasions.length && !f.occasions.some((o) => p.occasions.includes(o))) return false
    if (f.priceMax != null && p.price > f.priceMax) return false
    if (f.inStockOnly && !p.inStock) return false
    return true
  })
}

export const countActiveFilters = (filters) => {
  const f = { ...EMPTY_FILTERS, ...filters }
  return (
    f.types.length +
    f.metals.length +
    f.purities.length +
    f.occasions.length +
    f.departments.length +
    (f.priceMax != null ? 1 : 0) +
    (f.inStockOnly ? 1 : 0)
  )
}

/* ---------------------------------------------------------------------- */

/** Related = same collection first, then same type, never the product itself. */
export function relatedProducts(product, limit = 4) {
  if (!product) return []
  const pool = PRODUCTS.filter((p) => p.id !== product.id)
  const scored = pool.map((p) => {
    let score = 0
    if (p.collection === product.collection) score += 3
    if (p.type === product.type) score += 2
    if (p.departments.some((d) => product.departments.includes(d))) score += 1
    if (Math.abs(p.price - product.price) < product.price * 0.4) score += 1
    return { p, score }
  })
  return scored
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .slice(0, limit)
    .map((s) => s.p)
}

/** Lightweight fuzzy-ish search across the fields a shopper actually types. */
export function searchProducts(query, list = PRODUCTS) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)

  return list
    .map((p) => {
      const haystack = [
        p.name,
        p.type,
        p.collection,
        p.metal,
        p.purity,
        p.description,
        ...p.departments,
        ...p.occasions,
        ...(p.stones ?? []).map((s) => s.type),
      ]
        .join(' ')
        .toLowerCase()

      let score = 0
      for (const term of terms) {
        if (!haystack.includes(term)) return null
        if (p.name.toLowerCase().includes(term)) score += 5
        if (p.type.includes(term)) score += 3
        if (p.collection.includes(term)) score += 2
        score += 1
      }
      return { p, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.p.rating - a.p.rating)
    .map((s) => s.p)
}
