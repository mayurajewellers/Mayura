import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { SlidersHorizontal, Sparkles } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle, useIsDesktop } from '@hooks/index'
import productService from '@services/productService'
import collectionService from '@services/collectionService'
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filterProducts,
  productsInGroup,
  resolveGroup,
  sortProducts,
} from '@utils/catalogue'
import PageHero from '@components/layout/PageHero'
import ProductCard from '@components/cards/ProductCard'
import FilterPanel from '@components/collection/FilterPanel'
import SortDropdown from '@components/collection/SortDropdown'
import QuickView from '@components/collection/QuickView'
import Drawer from '@components/common/Drawer'
import Button from '@components/common/Button'
import Pagination from '@components/common/Pagination'
import EmptyState from '@components/common/EmptyState'
import Reveal from '@components/motion/Reveal'

const PER_PAGE = 12

export default function CollectionPage() {
  const { slug } = useParams()
  const group = resolveGroup(slug)
  const isDesktop = useIsDesktop()

  const [apiProducts, setApiProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

  useDocumentTitle(group?.title ?? 'Collection')

  /* Fetch API products when slug or filters change */
  useEffect(() => {
    let isSubscribed = true
    setLoading(true)

    const params = {}
    if (group?.kind === 'collection') params.collection = slug
    else if (group?.kind === 'department') params.department = slug
    else if (group?.kind === 'type') params.type = slug

    if (sort) params.sort = sort

    productService
      .getProducts(params)
      .then((res) => {
        if (!isSubscribed) return
        if (res.success && res.products) {
          setApiProducts(res.products)
        } else {
          setApiProducts(null)
        }
      })
      .catch(() => {
        if (isSubscribed) setApiProducts(null)
      })
      .finally(() => {
        if (isSubscribed) setLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [slug, sort, group?.kind])

  /* A new collection means a clean slate. */
  useEffect(() => {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }, [slug])

  useEffect(() => setPage(1), [filters, sort])

  const base = useMemo(() => {
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      return apiProducts
    }
    return productsInGroup(group)
  }, [apiProducts, group])

  const filtered = useMemo(() => filterProducts(base, filters), [base, filters])
  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const pageItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const activeCount = countActiveFilters(filters)

  if (!group) return <Navigate to={ROUTES.collections} replace />

  const filterUi = (
    <FilterPanel
      filters={filters}
      onChange={setFilters}
      onReset={() => setFilters(EMPTY_FILTERS)}
    />
  )

  return (
    <>
      <PageHero
        eyebrow={group.kicker}
        title={group.title}
        lede={group.intro}
        image={group.heroImage}
        height="md"
        breadcrumbs={[
          { label: 'Home', to: ROUTES.home },
          { label: 'Collections', to: ROUTES.collections },
          { label: group.title },
        ]}
      />

      {/* ------------------------------------- collection story, if any */}
      {group.story && (
        <section className="border-b border-charcoal/[0.07] bg-ivory-300">
          <div className="mj-container py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-4">
                <p className="font-serif text-[1.5rem] italic leading-snug text-bronze">
                  {group.meaning}
                </p>
                {group.tagline && (
                  <p className="mt-4 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-50">
                    {group.tagline}
                  </p>
                )}
              </Reveal>
              <Reveal delay={0.12} className="lg:col-span-8">
                <p className="max-w-3xl text-body-lg leading-[1.95] text-charcoal-200">
                  {group.story}
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- catalogue */}
      <section className="bg-ivory py-14 lg:py-20">
        <div className="mj-container">
          <div className="lg:grid lg:grid-cols-12 lg:gap-14">
            {/* ----------------------------------------------- filter rail */}
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-32">{filterUi}</div>
            </aside>

            {/* --------------------------------------------------- results */}
            <div className="lg:col-span-9">
              <div className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-5">
                <p className="font-sans text-body-sm text-charcoal-100">
                  <span className="tabular-nums text-charcoal">{sorted.length}</span>{' '}
                  {sorted.length === 1 ? 'piece' : 'pieces'}
                  {activeCount > 0 && ` · ${activeCount} filter${activeCount === 1 ? '' : 's'}`}
                </p>

                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="flex items-center gap-2.5 border-b border-charcoal/15 py-2.5 font-sans text-label uppercase tracking-wider2 text-charcoal transition-colors duration-300 hover:border-gold lg:hidden"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Filter
                    {activeCount > 0 && <span className="text-bronze">({activeCount})</span>}
                  </button>

                  <SortDropdown value={sort} onChange={setSort} />
                </div>
              </div>

              {pageItems.length ? (
                <>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-7 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                    {pageItems.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={setQuickView}
                        priority={index < 3}
                      />
                    ))}
                  </div>

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={(next) => {
                      setPage(next)
                      window.scrollTo({ top: 320, behavior: 'smooth' })
                    }}
                    className="mt-20"
                  />
                </>
              ) : (
                <EmptyState
                  icon={Sparkles}
                  eyebrow="Nothing here yet"
                  title="No pieces match those filters"
                  copy="Try loosening one of them — or tell us what you are looking for and we will make it. Most designs can be remade in three to five weeks."
                  primaryAction={{ label: 'Clear filters', onClick: () => setFilters(EMPTY_FILTERS) }}
                  secondaryAction={{ label: 'View everything', to: ROUTES.collection('all') }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------- mobile filter drawer */}
      <Drawer
        open={filtersOpen && !isDesktop}
        onClose={() => setFiltersOpen(false)}
        title="Refine"
        side="left"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)} className="flex-1">
              Clear
            </Button>
            <Button variant="primary" onClick={() => setFiltersOpen(false)} className="flex-1">
              Show {sorted.length}
            </Button>
          </div>
        }
      >
        {filterUi}
      </Drawer>

      <QuickView product={quickView} open={Boolean(quickView)} onClose={() => setQuickView(null)} />
    </>
  )
}
