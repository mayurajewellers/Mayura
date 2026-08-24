import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { BRANDS_FAMILY as STATIC_BRANDS } from '@data/homepage'
import collectionService from '@services/collectionService'
import SectionHeading from '@components/common/SectionHeading'
import cn from '@utils/cn'

/**
 * BRANDS FAMILY — the houses within Mayura Jewellers, in a horizontal
 * carousel. Touch devices swipe natively (scroll-snap); the arrow controls
 * page the rail for pointer and keyboard users.
 */
export default function BrandsFamily() {
  const railRef = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  const [brands, setBrands] = useState(() => STATIC_BRANDS || [])

  useEffect(() => {
    let isSubscribed = true
    collectionService
      .getCollections()
      .then((res) => {
        if (!isSubscribed) return
        if (res && res.success && Array.isArray(res.collections) && res.collections.length > 0) {
          const apiBrands = res.collections.map((c) => ({
            key: c.slug || c.id,
            name: c.name || '',
            kicker: c.kicker || 'Signature Collection',
            logo: null,
            to: ROUTES.collection(c.slug),
          }))
          setBrands(apiBrands)
        }
      })
      .catch(() => {
        // Fallback gracefully to static brands if backend is unavailable
      })

    return () => {
      isSubscribed = false
    }
  }, [])

  const updateEdges = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    setEdges({
      start: rail.scrollLeft <= 8,
      end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8,
    })
  }, [])

  const page = (direction) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="bg-ivory" aria-labelledby="brands-family">
      <div className="mj-container py-section-sm">
        <SectionHeading
          id="brands-family"
          eyebrow="The houses of Mayura"
          title="Brands Family"
          lede="Every occasion asks for a different kind of jewellery — so Mayura is built as a family of houses, each with its own craft, its own artisans and its own point of view. One counter, six signatures."
          align="center"
          flourish
          className="mb-12 lg:mb-16"
        />

        <div className="relative">
          {/* ---------------------------------------------------- controls */}
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label="Previous brands"
            className={cn(
              'absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-ivory-50 text-charcoal shadow-card transition-all duration-400 ease-luxe sm:flex lg:-left-5',
              edges.start
                ? 'border-charcoal/10 text-charcoal/25'
                : 'border-charcoal/15 hover:border-gold hover:bg-espresso hover:text-ivory',
            )}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.4} />
          </button>

          <button
            type="button"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label="More brands"
            className={cn(
              'absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-ivory-50 text-charcoal shadow-card transition-all duration-400 ease-luxe sm:flex lg:-right-5',
              edges.end
                ? 'border-charcoal/10 text-charcoal/25'
                : 'border-charcoal/15 hover:border-gold hover:bg-espresso hover:text-ivory',
            )}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.4} />
          </button>

          {/* -------------------------------------------------------- rail */}
          <ul
            ref={railRef}
            onScroll={updateEdges}
            className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:mx-0 sm:px-0 lg:gap-6"
            aria-label="Mayura brand family"
          >
            {brands.map((brand) => (
              <li
                key={brand.key}
                className="w-[11.5rem] shrink-0 snap-start sm:w-[13rem] lg:w-auto lg:flex-1"
              >
                <Link
                  to={brand.to}
                  className="group/brand flex h-36 flex-col items-center justify-center gap-2.5 rounded-card border border-charcoal/[0.08] bg-white/60 px-6 text-center transition-all duration-500 ease-luxe hover:-translate-y-1 hover:border-gold/45 hover:shadow-card-hover"
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      loading="lazy"
                      className="max-h-12 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-display text-[1.625rem] leading-none text-royal-700 transition-colors duration-300 group-hover/brand:text-royal">
                      {brand.name}
                    </span>
                  )}
                  <span className="mj-rule-gold w-10" aria-hidden="true" />
                  <span className="font-sans text-eyebrow-sm uppercase tracking-luxe text-charcoal-100">
                    {brand.kicker}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
