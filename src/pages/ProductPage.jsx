import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Repeat,
  Ruler,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { getProductBySlug } from '@data/products'
import { relatedProducts } from '@utils/catalogue'
import { useShop } from '@context/ShopContext'
import { useDocumentTitle } from '@hooks/index'
import { discountPercent, estimatedDelivery, formatPrice } from '@utils/format'
import ProductGallery from '@components/product/ProductGallery'
import GoldVariantSelector from '@components/product/GoldVariantSelector'
import ProductInfoTabs from '@components/product/ProductInfoTabs'
import ProductRail from '@components/home/ProductRail'
import QuickView from '@components/collection/QuickView'
import Button from '@components/common/Button'
import Rating from '@components/common/Rating'
import Accordion from '@components/common/Accordion'
import Modal from '@components/common/Modal'
import { Badge, Breadcrumbs } from '@components/common/index.jsx'
import Reveal from '@components/motion/Reveal'
import cn from '@utils/cn'

const SIZE_GUIDE = [
  { size: '8', diameter: '15.3 mm', circumference: '48.0 mm' },
  { size: '10', diameter: '16.1 mm', circumference: '50.6 mm' },
  { size: '12', diameter: '16.9 mm', circumference: '53.1 mm' },
  { size: '14', diameter: '17.7 mm', circumference: '55.7 mm' },
  { size: '16', diameter: '18.5 mm', circumference: '58.3 mm' },
  { size: '18', diameter: '19.4 mm', circumference: '60.9 mm' },
  { size: '20', diameter: '20.2 mm', circumference: '63.5 mm' },
  { size: '22', diameter: '21.0 mm', circumference: '66.0 mm' },
]

export default function ProductPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)
  const { addToCart, isWishlisted, toggleWishlist, recordView, recentProducts } = useShop()

  const [size, setSize] = useState(null)
  const [goldVariant, setGoldVariant] = useState(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

  useDocumentTitle(product?.name ?? 'Product')

  useEffect(() => {
    if (product) {
      setSize(product.size?.default ?? null)
      setGoldVariant(null)
      recordView(product.id)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [product, recordView])

  const related = useMemo(() => relatedProducts(product, 8), [product])
  const alsoViewed = useMemo(
    () => recentProducts.filter((p) => p.id !== product?.id).slice(0, 6),
    [recentProducts, product],
  )

  if (!product) return <Navigate to={ROUTES.collection('all')} replace />

  const saved = isWishlisted(product.id)
  const discount = discountPercent(product.price, product.compareAtPrice)

  const accordions = [
    {
      title: 'Description',
      content: (
        <div className="space-y-5">
          <p>{product.description}</p>
          <ul className="space-y-2.5">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3.5">
                <span className="mt-[0.6rem] h-1 w-1 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: 'Care instructions',
      content: (
        <ul className="space-y-3">
          {product.care.map((item) => (
            <li key={item} className="flex gap-3.5">
              <span className="mt-[0.6rem] h-1 w-1 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    { title: 'Shipping', content: <p>{product.shipping}</p> },
    { title: 'Returns & exchange', content: <p>{product.returns}</p> },
    { title: 'Warranty', content: <p>{product.warranty}</p> },
    {
      title: 'Frequently asked',
      content: (
        <div className="space-y-5">
          <div>
            <p className="font-sans font-medium text-charcoal">Can this be resized?</p>
            <p className="mt-1.5">
              Yes — once free of charge within twelve months, for up to two sizes either way. Fully
              pavé shanks and eternity bands have to be remade rather than resized.
            </p>
          </div>
          <div>
            <p className="font-sans font-medium text-charcoal">Will the exact weight match?</p>
            <p className="mt-1.5">
              Within about ±3%. Because each piece is finished by hand, the weight on your invoice
              is the weight you are billed for — never the website figure.
            </p>
          </div>
          <div>
            <p className="font-sans font-medium text-charcoal">Can I see it before buying?</p>
            <p className="mt-1.5">
              Always. Book a viewing and we will have it on the tray when you arrive, or ask for a
              video call and we will show you every angle.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const whatsappLink = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(
    `Hello Mayura Jewellers, I would like to enquire about ${product.name} (${product.sku}).`,
  )}`

  return (
    <>
      <div className="border-b border-charcoal/[0.07] bg-ivory-300">
        <div className="mj-container py-6">
          <Breadcrumbs
            items={[
              { label: 'Home', to: ROUTES.home },
              { label: 'Collections', to: ROUTES.collections },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      {/* ================================================== main product */}
      <section className="bg-ivory py-12 lg:py-18">
        <div className="mj-container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* The gallery is the shorter column, so it is the one that
                sticks — the specification column scrolls past it. */}
            <div className="lg:col-span-7">
              <div className="lg:sticky lg:top-28">
                <ProductGallery images={product.images} name={product.name} badge={product.badge} />
              </div>
            </div>

            {/* ------------------------------------------------ buy column */}
            <div className="lg:col-span-5">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {product.madeToOrder && <Badge tone="light">Made to order</Badge>}
                  {discount > 0 && <Badge tone="gold">{discount}% off</Badge>}
                </div>

                <p className="mj-eyebrow mb-4">
                  {product.metal} · {product.purity}
                </p>

                <h1 className="mj-display text-display-sm">{product.name}</h1>

                <Rating
                  value={product.rating}
                  count={product.reviewCount}
                  size="sm"
                  showValue
                  className="mt-5"
                />

                <div className="mt-7 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-display-xs tabular-nums text-charcoal">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="font-sans text-body tabular-nums text-charcoal-50 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <p className="mt-2 font-sans text-body-xs text-charcoal-50">
                  Inclusive of GST · Making charges {product.makingCharges} · Price moves with the
                  daily gold rate
                </p>

                {/* ------------------------------------------------- size */}
                {product.size?.options?.length > 1 && (
                  <fieldset className="mt-9">
                    <div className="mb-3 flex items-center justify-between">
                      <legend className="mj-field-label mb-0">{product.size.label}</legend>
                      {product.type === 'rings' && (
                        <button
                          type="button"
                          onClick={() => setSizeGuideOpen(true)}
                          className="inline-flex items-center gap-1.5 font-sans text-[0.6875rem] uppercase tracking-wide2 text-bronze transition-colors hover:text-charcoal"
                        >
                          <Ruler className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                          Size guide
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.size.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSize(option)}
                          aria-pressed={size === option}
                          className={cn(
                            'min-w-[3.25rem] rounded-luxe border px-4 py-3 font-sans text-body-sm transition-all duration-300',
                            size === option
                              ? 'border-charcoal bg-charcoal text-ivory'
                              : 'border-charcoal/15 text-charcoal-200 hover:border-charcoal/45',
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                {/* -------------------------------- gold purity & shade */}
                <GoldVariantSelector
                  product={product}
                  value={goldVariant}
                  onChange={setGoldVariant}
                />

                {/* ------------------- product details & price breakup */}
                <ProductInfoTabs product={product} className="mt-9" />

                {/* ---------------------------------------------- actions */}
                <div className="mt-8 flex gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => addToCart(product, { size, variant: goldVariant })}
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
                    <Heart
                      className={cn('h-[1.15rem] w-[1.15rem]', saved && 'fill-current')}
                      strokeWidth={1.4}
                    />
                  </button>
                </div>

                <Button
                  variant="outline"
                  fullWidth
                  className="mt-3"
                  href={whatsappLink}
                  target="_blank"
                  icon={MessageCircle}
                  iconPosition="left"
                >
                  Enquire on WhatsApp
                </Button>

                {/* ------------------------------------------- assurances */}
                <ul className="mt-9 space-y-4 border-t border-charcoal/10 pt-8">
                  {[
                    {
                      icon: ShieldCheck,
                      text: product.certification,
                    },
                    {
                      icon: Truck,
                      text: product.madeToOrder
                        ? 'Made to order — we will confirm a delivery date in writing.'
                        : `Free insured delivery. Order today for delivery by ${estimatedDelivery(6)}.`,
                    },
                    {
                      icon: Repeat,
                      text: 'Lifetime exchange at the prevailing gold rate, with deductions stated before you buy.',
                    },
                    {
                      icon: BadgeCheck,
                      text: 'Verify the HUID yourself on the BIS Care app before you pay.',
                    },
                  ].map((item) => (
                    <li key={item.text} className="flex gap-3.5">
                      <item.icon
                        className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-bronze"
                        strokeWidth={1.3}
                        aria-hidden="true"
                      />
                      <span className="text-body-sm leading-relaxed text-charcoal-200">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* ------------------------------------------- accordions */}
                <Accordion items={accordions} className="mt-10" defaultOpen={[0]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- collection cross-link */}
      <section className="border-y border-charcoal/[0.07] bg-champagne">
        <div className="mj-container py-12">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <p className="max-w-2xl font-serif text-[1.25rem] italic leading-relaxed text-espresso/80">
                This piece belongs to the {product.collection.charAt(0).toUpperCase() + product.collection.slice(1)} collection.
              </p>
              <Link
                to={ROUTES.collection(product.collection)}
                className="mj-btn-outline shrink-0 border-espresso/30 text-espresso hover:bg-espresso hover:text-ivory"
              >
                See the collection
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <ProductRail
        eyebrow="You may also like"
        title="Related pieces"
        products={related}
        onQuickView={setQuickView}
      />

      {alsoViewed.length > 0 && (
        <ProductRail
          eyebrow="Your history"
          title="Recently viewed"
          products={alsoViewed}
          background="bg-ivory-300"
          onQuickView={setQuickView}
        />
      )}

      {/* ------------------------------------------------------ size guide */}
      <Modal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} label="Ring size guide" size="max-w-2xl">
        <div className="p-8 sm:p-10">
          <p className="mj-eyebrow mb-4">Sizing</p>
          <h2 className="mj-display text-display-xs">Indian ring size guide</h2>
          <p className="mt-5 text-body-sm leading-[1.9] text-charcoal-200">
            Wrap a strip of paper around the base of the finger, mark the overlap, and measure the
            length in millimetres — that is the circumference. Measure in the evening; fingers are
            smallest in the morning. If you fall between two sizes, take the larger.
          </p>

          <table className="mt-8 w-full text-left">
            <thead>
              <tr className="border-b border-charcoal/12">
                {['Size', 'Diameter', 'Circumference'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="pb-3 font-sans text-eyebrow uppercase tracking-luxe text-charcoal-50"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map((row) => (
                <tr key={row.size} className="border-b border-charcoal/[0.07]">
                  <td className="py-3 font-sans text-body-sm tabular-nums text-charcoal">{row.size}</td>
                  <td className="py-3 font-sans text-body-sm tabular-nums text-charcoal-200">{row.diameter}</td>
                  <td className="py-3 font-sans text-body-sm tabular-nums text-charcoal-200">{row.circumference}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-7 text-body-xs text-charcoal-50">
            Still unsure? Come in and we will measure you on a proper mandrel in thirty seconds, or
            we will post you a free plastic sizer.
          </p>
        </div>
      </Modal>

      <QuickView product={quickView} open={Boolean(quickView)} onClose={() => setQuickView(null)} />
    </>
  )
}
