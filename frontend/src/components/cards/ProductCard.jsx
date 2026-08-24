import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Heart } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { EASE_LUXE } from '@constants/motion'
import { useShop } from '@context/ShopContext'
import { discountPercent, formatPrice, formatWeight } from '@utils/format'
import SmartImage from '@components/common/SmartImage'
import { Badge } from '@components/common/index.jsx'
import cn from '@utils/cn'

/**
 * The luxury product card.
 *
 *  · hover swaps to the second photograph over 700ms
 *  · a quiet gold hairline draws in beneath the frame
 *  · wishlist and quick-view surface on hover, and are always reachable
 *    by keyboard because they are real buttons in the DOM
 */
function ProductCard({ product, onQuickView, priority = false, className, compact = false }) {
  const { isWishlisted, toggleWishlist } = useShop()
  const saved = isWishlisted(product.id)
  const discount = discountPercent(product.price, product.compareAtPrice)
  const [primary, secondary] = product.images

  return (
    <motion.article
      className={cn('group/card relative flex h-full flex-col', className)}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE_LUXE }}
    >
      {/* ---------------------------------------------------------- media */}
      <div className="relative overflow-hidden rounded-card bg-champagne-50">
        <Link
          to={ROUTES.product(product.slug)}
          className="block focus-visible:outline-offset-4"
          tabIndex={-1}
          aria-hidden="true"
        >
          <SmartImage
            src={primary}
            alt={product.name}
            ratio="aspect-editorial"
            priority={priority}
            rounded="rounded-card"
            imgClassName="transition-all duration-1200 ease-luxe group-hover/card:scale-[1.04] group-hover/card:opacity-0"
          />
          {secondary && (
            <img
              src={secondary}
              alt=""
              loading="lazy"
              decoding="async"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.06] rounded-card object-cover opacity-0 transition-all duration-1200 ease-luxe group-hover/card:scale-100 group-hover/card:opacity-100"
            />
          )}
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute left-3.5 top-3.5 flex flex-col items-start gap-1.5">
          {product.badge && (
            <Badge tone={product.badge === 'New' ? 'dark' : 'gold'}>{product.badge}</Badge>
          )}
          {discount > 0 && <Badge tone="light">{discount}% off</Badge>}
          {product.madeToOrder && <Badge tone="light">Made to order</Badge>}
        </div>

        {/* wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={cn(
            'absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-400 ease-luxe',
            'opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100',
            saved
              ? '!opacity-100 border-gold bg-gold text-espresso'
              : 'border-charcoal/10 bg-ivory/90 text-charcoal-100 hover:border-gold hover:text-bronze',
          )}
        >
          <Heart className={cn('h-4 w-4', saved && 'fill-current')} strokeWidth={1.4} />
        </button>

        {/* quick view */}
        {onQuickView && (
          <div className="absolute inset-x-3.5 bottom-3.5 translate-y-3 opacity-0 transition-all duration-500 ease-luxe group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="flex w-full items-center justify-center gap-2 rounded-luxe border border-charcoal/8 bg-ivory/94 py-3 font-sans text-eyebrow uppercase tracking-luxe text-charcoal backdrop-blur transition-colors duration-300 hover:bg-charcoal hover:text-ivory"
            >
              <Eye className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
              Quick view
              <span className="sr-only">of {product.name}</span>
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- copy */}
      <div className="flex flex-1 flex-col pt-5">
        <p className="mj-eyebrow mb-2.5 text-charcoal-50">
          {product.metal.replace(/\s*Gold$/, '')} · {product.purity.split(' ')[0]}
        </p>

        <h3 className="font-display text-[1.0625rem] leading-[1.4] text-charcoal">
          <Link
            to={ROUTES.product(product.slug)}
            className="after:absolute after:inset-0 after:content-[''] hover:text-bronze"
          >
            {product.name}
          </Link>
        </h3>

        {!compact && (
          <p className="mt-2 font-sans text-body-xs text-charcoal-50">
            {formatWeight(product.grossWeight)}
            {product.stones?.length > 0 &&
              ` · ${product.stones.reduce((n, s) => n + (s.count ?? 0), 0)} stones`}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2.5 pt-4">
          <span className="font-display text-[1.0625rem] tabular-nums text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice > product.price && (
            <span className="font-sans text-body-xs tabular-nums text-charcoal-50 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* the gold hairline that draws in on hover */}
        <span
          className="mt-4 h-px w-full origin-left scale-x-0 bg-gold/60 transition-transform duration-700 ease-luxe group-hover/card:scale-x-100"
          aria-hidden="true"
        />
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)
