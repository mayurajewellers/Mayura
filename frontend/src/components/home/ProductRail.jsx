import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeading from '@components/common/SectionHeading'
import ProductCard from '@components/cards/ProductCard'
import cn from '@utils/cn'

/**
 * Horizontally scrolling product rail. Snaps on touch, has real arrow
 * controls on desktop, and never traps the page scroll.
 */
export default function ProductRail({
  eyebrow,
  title,
  lede,
  link,
  linkLabel,
  products = [],
  onQuickView,
  className,
  background = 'bg-ivory',
}) {
  const scroller = useRef(null)

  const scrollBy = (direction) => {
    const node = scroller.current
    if (!node) return
    const amount = node.clientWidth * 0.72
    node.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (!products.length) return null

  return (
    <section className={cn('mj-section', background, className)} aria-labelledby={`rail-${title}`}>
      <div className="mj-container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          link={link}
          linkLabel={linkLabel}
          className="mb-12 lg:mb-16"
        />
      </div>

      <div className="relative">
        <div
          ref={scroller}
          className="mj-hide-scrollbar-x flex snap-x snap-mandatory gap-6 px-5 pb-2 sm:px-8 lg:px-12 xl:px-16"
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="w-[74vw] shrink-0 snap-start sm:w-[42vw] md:w-[32vw] lg:w-[25vw] xl:w-[21rem]"
            >
              <ProductCard product={product} onQuickView={onQuickView} priority={index < 2} />
            </div>
          ))}
          <div className="w-1 shrink-0" aria-hidden="true" />
        </div>

        {/* arrows — desktop only, purely supplementary to native scrolling */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 lg:flex">
          {[-1, 1].map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => scrollBy(direction)}
              aria-label={direction === -1 ? 'Scroll left' : 'Scroll right'}
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/10 bg-ivory/92 text-charcoal-100 shadow-card backdrop-blur transition-all duration-400 ease-luxe hover:border-gold hover:bg-charcoal hover:text-ivory"
            >
              {direction === -1 ? (
                <ChevronLeft className="h-4 w-4" strokeWidth={1.4} />
              ) : (
                <ChevronRight className="h-4 w-4" strokeWidth={1.4} />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
