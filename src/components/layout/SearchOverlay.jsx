import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock, Search, TrendingUp, X } from 'lucide-react'
import { ROUTES, STORAGE_KEYS } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { TRENDING_SEARCHES } from '@data/search'
import { searchProducts } from '@utils/catalogue'
import { formatPrice } from '@utils/format'
import { useEscapeKey, useLocalStorageState, useLockBodyScroll } from '@hooks/index'
import SmartImage from '@components/common/SmartImage'
import cn from '@utils/cn'

/**
 * Command-palette style search. Opens from the navbar, filters the catalogue
 * live, remembers recent queries in localStorage, and hands off to the full
 * search page on Enter.
 */
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useLocalStorageState(STORAGE_KEYS.recentSearches, [])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useLockBodyScroll(open)
  useEscapeKey(onClose, open)

  useEffect(() => {
    if (open) {
      setQuery('')
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => searchProducts(query).slice(0, 6), [query])

  const commit = (value) => {
    const term = value.trim()
    if (!term) return
    setRecent((current) => [term, ...current.filter((r) => r !== term)].slice(0, 6))
    onClose()
    navigate(`${ROUTES.search}?q=${encodeURIComponent(term)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div
            className="absolute inset-0 bg-espresso/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="relative max-h-[92vh] overflow-y-auto bg-ivory shadow-lift"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
          >
            <div className="mj-container py-8 sm:py-10">
              {/* ------------------------------------------------- input */}
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  commit(query)
                }}
                className="flex items-center gap-4 border-b border-charcoal/15 pb-5 focus-within:border-gold"
              >
                <Search className="h-5 w-5 shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for jhumkas, solitaires, mangalsutra…"
                  aria-label="Search the collection"
                  className="w-full border-0 bg-transparent p-0 font-display text-[1.375rem] text-charcoal placeholder:text-charcoal-50/70 focus:outline-none focus:ring-0 sm:text-[1.75rem]"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="-mr-2 shrink-0 rounded-luxe p-2 text-charcoal-100 transition-colors duration-300 hover:bg-charcoal/[0.06] hover:text-charcoal"
                >
                  <X className="h-5 w-5" strokeWidth={1.3} />
                </button>
              </form>

              {/* ----------------------------------------------- results */}
              {query.trim() ? (
                <div className="pt-8">
                  {results.length ? (
                    <>
                      <p className="mj-eyebrow mb-6">
                        {results.length} match{results.length === 1 ? '' : 'es'}
                      </p>
                      <ul className="grid gap-1">
                        {results.map((product) => (
                          <li key={product.id}>
                            <Link
                              to={ROUTES.product(product.slug)}
                              onClick={onClose}
                              className="group/res flex items-center gap-5 rounded-card px-3 py-3 transition-colors duration-300 hover:bg-champagne-50"
                            >
                              <SmartImage
                                src={product.images[0]}
                                alt=""
                                ratio="aspect-square"
                                className="w-16 shrink-0 sm:w-20"
                                rounded="rounded-luxe"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="mj-eyebrow block text-charcoal-50">
                                  {product.metal}
                                </span>
                                <span className="mt-1.5 block truncate font-display text-[1.0625rem] text-charcoal transition-colors duration-300 group-hover/res:text-bronze">
                                  {product.name}
                                </span>
                              </span>
                              <span className="shrink-0 font-display text-body-sm tabular-nums text-charcoal">
                                {formatPrice(product.price)}
                              </span>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 text-charcoal-50 transition-transform duration-400 group-hover/res:translate-x-1"
                                strokeWidth={1.3}
                                aria-hidden="true"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => commit(query)}
                        className="mj-link mt-8 inline-block font-sans text-label uppercase tracking-wider2 text-bronze"
                      >
                        See all results for “{query}”
                      </button>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="font-display text-display-xs text-charcoal">
                        Nothing matched “{query}”
                      </p>
                      <p className="mx-auto mt-3 max-w-md text-body-sm leading-relaxed text-charcoal-200">
                        Try a broader word — “bridal”, “diamond”, “22K” — or tell us what you are
                        looking for on WhatsApp and we will find it.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* ------------------------------------------ empty state */
                <div className="grid gap-10 pt-10 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="mj-eyebrow mb-5 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      Trending
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => commit(term)}
                            className="rounded-full border border-charcoal/12 px-4 py-2 font-sans text-body-xs text-charcoal-200 transition-all duration-300 hover:border-gold hover:bg-gold/[0.07] hover:text-bronze"
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recent.length > 0 && (
                    <div>
                      <div className="mb-5 flex items-center justify-between">
                        <p className="mj-eyebrow flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                          Recent
                        </p>
                        <button
                          type="button"
                          onClick={() => setRecent([])}
                          className="font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-50 transition-colors hover:text-error"
                        >
                          Clear
                        </button>
                      </div>
                      <ul className="space-y-0.5">
                        {recent.map((term) => (
                          <li key={term}>
                            <button
                              type="button"
                              onClick={() => commit(term)}
                              className="block w-full rounded-luxe py-2 text-left font-sans text-body-sm text-charcoal-200 transition-colors duration-300 hover:text-bronze"
                            >
                              {term}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={cn(recent.length === 0 && 'md:col-span-1')}>
                    <p className="mj-eyebrow mb-5">Popular categories</p>
                    <ul className="space-y-0.5">
                      {[
                        { label: 'Bridal Collection', to: ROUTES.collection('bridal-collection') },
                        { label: 'Diamond Jewellery', to: ROUTES.collection('diamond-jewellery') },
                        { label: 'Daily Wear', to: ROUTES.collection('daily-wear') },
                        { label: 'Mangalsutra', to: ROUTES.collection('mangalsutra') },
                        { label: 'Men', to: ROUTES.collection('men-collection') },
                      ].map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.to}
                            onClick={onClose}
                            className="block py-2 font-sans text-body-sm text-charcoal-200 transition-colors duration-300 hover:text-bronze"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
