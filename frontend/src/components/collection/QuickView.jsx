import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useShop } from '@context/ShopContext'
import { discountPercent, formatPrice, formatWeight } from '@utils/format'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'
import SmartImage from '@components/common/SmartImage'
import Rating from '@components/common/Rating'
import { Badge, SpecList } from '@components/common/index.jsx'
import cn from '@utils/cn'

/** Compact product preview so a shopper never loses their place in the grid. */
export default function QuickView({ product, open, onClose }) {
  const { addToCart, isWishlisted, toggleWishlist } = useShop()
  const [size, setSize] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (product) {
      setSize(product.size?.default ?? null)
      setActiveImage(0)
    }
  }, [product])

  if (!product) return null

  const saved = isWishlisted(product.id)
  const discount = discountPercent(product.price, product.compareAtPrice)

  return (
    <Modal open={open} onClose={onClose} label={`Quick view — ${product.name}`}>
      <div className="grid md:grid-cols-2">
        {/* --------------------------------------------------------- media */}
        <div className="bg-champagne-50 p-5 sm:p-7">
          <SmartImage
            src={product.images[activeImage]}
            alt={product.name}
            ratio="aspect-editorial"
            rounded="rounded-luxe"
          />
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === activeImage}
                  className={cn(
                    'w-16 overflow-hidden rounded-luxe border transition-all duration-400',
                    index === activeImage
                      ? 'border-gold'
                      : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <SmartImage src={image} alt="" ratio="aspect-square" rounded="rounded-none" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------- copy */}
        <div className="flex flex-col p-6 sm:p-9">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {product.badge && <Badge tone="gold">{product.badge}</Badge>}
            {discount > 0 && <Badge tone="light">{discount}% off</Badge>}
          </div>

          <p className="mj-eyebrow mb-3">{product.metal} · {product.purity}</p>

          <h2 className="mj-display text-display-xs">{product.name}</h2>

          <Rating
            value={product.rating}
            count={product.reviewCount}
            size="sm"
            showValue
            className="mt-4"
          />

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-[1.625rem] tabular-nums text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="font-sans text-body-sm tabular-nums text-charcoal-50 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="mt-1.5 font-sans text-body-xs text-charcoal-50">
            Inclusive of GST · Making {product.makingCharges}
          </p>

          <p className="mt-6 line-clamp-4 text-body-sm leading-[1.9] text-charcoal-200">
            {product.description}
          </p>

          {product.size?.options?.length > 1 && (
            <fieldset className="mt-7">
              <legend className="mj-field-label">{product.size.label}</legend>
              <div className="flex flex-wrap gap-2">
                {product.size.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={cn(
                      'min-w-[3rem] rounded-luxe border px-3.5 py-2.5 font-sans text-body-xs transition-all duration-300',
                      size === option
                        ? 'border-charcoal bg-charcoal text-ivory'
                        : 'border-charcoal/15 text-charcoal-200 hover:border-charcoal/40',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <SpecList
            className="mt-7"
            items={[
              { label: 'Gross weight', value: formatWeight(product.grossWeight) },
              { label: 'Net gold', value: formatWeight(product.netWeight) },
              ...(product.stones?.length
                ? [{ label: 'Stones', value: product.stones.map((s) => `${s.count ?? ''} ${s.type}`.trim()).join(' · ') }]
                : []),
            ]}
          />

          <div className="mt-8 flex gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                addToCart(product, { size })
                onClose()
              }}
            >
              Add to bag
            </Button>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={cn(
                'flex h-[3.375rem] w-[3.375rem] shrink-0 items-center justify-center rounded-luxe border transition-all duration-400',
                saved
                  ? 'border-gold bg-gold text-espresso'
                  : 'border-charcoal/20 text-charcoal-100 hover:border-charcoal hover:text-charcoal',
              )}
            >
              <Heart className={cn('h-[1.15rem] w-[1.15rem]', saved && 'fill-current')} strokeWidth={1.4} />
            </button>
          </div>

          <Link
            to={ROUTES.product(product.slug)}
            onClick={onClose}
            className="group/full mt-6 inline-flex items-center gap-2.5 font-sans text-label uppercase tracking-wider2 text-charcoal-200 transition-colors duration-300 hover:text-bronze"
          >
            <span className="mj-underline">Full details</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/full:translate-x-1"
              strokeWidth={1.4}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </Modal>
  )
}
