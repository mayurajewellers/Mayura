import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, Search, SearchX, TrendingUp, X } from 'lucide-react'
import { ROUTES, STORAGE_KEYS } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { POPULAR_CATEGORIES, TRENDING_SEARCHES } from '@data/search'
import productService from '@services/productService'
import { searchProducts, sortProducts } from '@utils/catalogue'
import { useDocumentTitle, useLocalStorageState } from '@hooks/index'
import PageHero from '@components/layout/PageHero'
import ProductCard from '@components/cards/ProductCard'
import QuickView from '@components/collection/QuickView'
import SortDropdown from '@components/collection/SortDropdown'
import SmartImage from '@components/common/SmartImage'
import EmptyState from '@components/common/EmptyState'
import Button from '@components/common/Button'
import Reveal from '@components/motion/Reveal'
import { Stagger, StaggerItem } from '@components/motion/Stagger'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [draft, setDraft] = useState(query)
  const [sort, setSort] = useState('featured')
  const [quickView, setQuickView] = useState(null)
  const [recent, setRecent] = useLocalStorageState(STORAGE_KEYS.recentSearches, [])
  const [apiResults, setApiResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useDocumentTitle(query ? `Search — ${query}` : 'Search')

  useEffect(() => setDraft(query), [query])

  useEffect(() => {
    const term = query.trim()
    if (!term) {
      setApiResults(null)
      return
    }
    setRecent((current) => [term, ...current.filter((r) => r !== term)].slice(0, 8))

    let isSubscribed = true
    setLoading(true)

    productService
      .getProducts({ search: term, sort })
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.products) {
          setApiResults(res.products)
        } else {
          setApiResults(null)
        }
      })
      .catch(() => {
        if (isSubscribed) setApiResults(null)
      })
      .finally(() => {
        if (isSubscribed) setLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [query, sort, setRecent])

  const results = useMemo(() => {
    if (apiResults && Array.isArray(apiResults)) {
      return apiResults
    }
    return sortProducts(searchProducts(query), sort)
  }, [apiResults, query, sort])

  const submit = (event) => {
    event.preventDefault()
    setParams(draft.trim() ? { q: draft.trim() } : {})
  }

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={query ? `“${query}”` : 'Find your piece'}
        lede={
          query
            ? `${results.length} ${results.length === 1 ? 'match' : 'matches'} in the collection.`
            : 'Search by name, metal, purity, stone or occasion — “22K jhumka”, “bridal haram”, “solitaire under 2 lakh”.'
        }
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Search' }]}
      >
        <form onSubmit={submit} className="mt-10 max-w-2xl">
          <label htmlFor="search-input" className="sr-only">
            Search the collection
          </label>
          <div className="flex items-center gap-4 border-b border-charcoal/20 pb-4 transition-colors duration-400 focus-within:border-gold">
            <Search className="h-5 w-5 shrink-0 text-bronze" strokeWidth={1.3} aria-hidden="true" />
            <input
              id="search-input"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search the collection…"
              className="w-full border-0 bg-transparent p-0 font-display text-[1.375rem] text-charcoal placeholder:text-charcoal-50/70 focus:outline-none focus:ring-0"
            />
            {draft && (
              <button
                type="button"
                onClick={() => {
                  setDraft('')
                  setParams({})
                }}
                aria-label="Clear search"
                className="shrink-0 rounded p-1.5 text-charcoal-50 transition-colors duration-300 hover:text-charcoal"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </form>
      </PageHero>

      <section className="mj-section bg-ivory">
        <div className="mj-container">
          {query ? (
            results.length ? (
              <>
                <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-5">
                  <p className="font-sans text-body-sm text-charcoal-100">
                    <span className="tabular-nums text-charcoal">{results.length}</span>{' '}
                    {results.length === 1 ? 'result' : 'results'}
                  </p>
                  <SortDropdown value={sort} onChange={setSort} />
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-7 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
                  {results.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickView}
                      priority={index < 4}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={SearchX}
                eyebrow="No matches"
                title={`We could not find “${query}”`}
                copy="Try a broader word — “bridal”, “diamond”, “22K”, “jhumka”. Or tell us what you have in mind and we will make it; most designs take three to five weeks."
                primaryAction={{ label: 'Browse everything', to: ROUTES.collection('all') }}
                secondaryAction={{ label: 'Ask on WhatsApp', to: undefined }}
              >
                <div className="mt-10">
                  <p className="mj-eyebrow mb-5">Try one of these</p>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => setParams({ q: term })}
                          className="rounded-full border border-charcoal/12 px-4 py-2 font-sans text-body-xs text-charcoal-200 transition-all duration-300 hover:border-gold hover:bg-gold/[0.07] hover:text-bronze"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </EmptyState>
            )
          ) : (
            /* -------------------------------------------- idle state */
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
              <div className="space-y-12 lg:col-span-4">
                <Reveal>
                  <p className="mj-eyebrow mb-6 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Trending searches
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => setParams({ q: term })}
                          className="rounded-full border border-charcoal/12 px-4 py-2.5 font-sans text-body-xs text-charcoal-200 transition-all duration-300 hover:border-gold hover:bg-gold/[0.07] hover:text-bronze"
                        >
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </Reveal>

                {recent.length > 0 && (
                  <Reveal delay={0.08}>
                    <div className="mb-6 flex items-center justify-between">
                      <p className="mj-eyebrow flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                        Recent searches
                      </p>
                      <button
                        type="button"
                        onClick={() => setRecent([])}
                        className="font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-50 transition-colors hover:text-error"
                      >
                        Clear
                      </button>
                    </div>
                    <ul className="divide-y divide-charcoal/[0.07]">
                      {recent.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => setParams({ q: term })}
                            className="block w-full py-3 text-left font-sans text-body-sm text-charcoal-200 transition-colors duration-300 hover:text-bronze"
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                <Reveal delay={0.12}>
                  <div className="rounded-card border border-charcoal/[0.08] bg-champagne-50 p-7">
                    <p className="font-display text-[1.125rem] leading-snug text-charcoal">
                      Cannot find it?
                    </p>
                    <p className="mt-3 text-body-sm leading-[1.9] text-charcoal-200">
                      Almost everything can be remade. Send us a photograph on WhatsApp and we will
                      quote a weight, a price and a date.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6"
                      href={CONTACT.whatsappUrl}
                      target="_blank"
                    >
                      Ask on WhatsApp
                    </Button>
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-8">
                <p className="mj-eyebrow mb-8">Popular categories</p>
                <Stagger className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {POPULAR_CATEGORIES.map((category) => (
                    <StaggerItem key={category.label}>
                      <Link to={category.to} className="group/pop block">
                        <div className="overflow-hidden rounded-card bg-champagne-100">
                          <SmartImage
                            src={category.image}
                            alt={category.label}
                            ratio="aspect-[4/5]"
                            rounded="rounded-card"
                            imgClassName="transition-transform duration-1200 ease-luxe group-hover/pop:scale-[1.06]"
                          />
                        </div>
                        <p className="mt-4 font-display text-[1.0625rem] text-charcoal transition-colors duration-300 group-hover/pop:text-bronze">
                          {category.label}
                        </p>
                      </Link>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          )}
        </div>
      </section>

      <QuickView product={quickView} open={Boolean(quickView)} onClose={() => setQuickView(null)} />
    </>
  )
}
