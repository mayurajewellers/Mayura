import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Gift, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { CONTACT } from '@constants/site'
import { useShop } from '@context/ShopContext'
import { useDocumentTitle } from '@hooks/index'
import { estimatedDelivery, formatPrice, formatWeight } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import ProductRail from '@components/home/ProductRail'
import SmartImage from '@components/common/SmartImage'
import EmptyState from '@components/common/EmptyState'
import Button from '@components/common/Button'
import QuantityStepper from '@components/common/QuantityStepper'
import Reveal from '@components/motion/Reveal'
import { Stagger, StaggerItem } from '@components/motion/Stagger'
import { BEST_SELLERS } from '@data/products'
import cn from '@utils/cn'

const COUPONS = {
  MAYURA10: { label: '10% off making charges', rate: 0.03 },
  FESTIVE: { label: 'Festive — 5% off', rate: 0.05 },
}

export default function CartPage() {
  useDocumentTitle('Shopping bag')
  const { cartLines, cartSubtotal, updateCartQuantity, removeFromCart, clearCart } = useShop()

  const [coupon, setCoupon] = useState('')
  const [applied, setApplied] = useState(null)
  const [couponError, setCouponError] = useState('')

  const applyCoupon = (event) => {
    event.preventDefault()
    const code = coupon.trim().toUpperCase()
    if (COUPONS[code]) {
      setApplied({ code, ...COUPONS[code] })
      setCouponError('')
    } else {
      setApplied(null)
      setCouponError('That code is not recognised. Try MAYURA10 or FESTIVE.')
    }
  }

  const discount = applied ? Math.round(cartSubtotal * applied.rate) : 0
  const shipping = cartSubtotal >= 25000 || cartSubtotal === 0 ? 0 : 250
  const total = cartSubtotal - discount + shipping

  return (
    <>
      <PageHero
        eyebrow="Shopping bag"
        title="Your selection"
        lede={
          cartLines.length
            ? 'Review the pieces below. Checkout on this site is a demonstration — to complete a purchase, call or WhatsApp us and we will confirm the day’s rate.'
            : undefined
        }
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Bag' }]}
      />

      <section className="mj-section bg-ivory">
        <div className="mj-container">
          {cartLines.length ? (
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
              {/* ------------------------------------------------ lines */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="mb-8 flex items-center justify-between border-b border-charcoal/10 pb-5">
                  <p className="font-sans text-body-sm text-charcoal-100">
                    <span className="tabular-nums text-charcoal">{cartLines.length}</span>{' '}
                    {cartLines.length === 1 ? 'line' : 'lines'}
                  </p>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="inline-flex items-center gap-2 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-100 transition-colors duration-300 hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
                    Empty bag
                  </button>
                </div>

                <Stagger className="divide-y divide-charcoal/10">
                  {cartLines.map((line) => (
                    <StaggerItem key={line.key}>
                      <article className="grid grid-cols-[6rem_1fr] gap-5 py-7 first:pt-0 sm:grid-cols-[8rem_1fr] sm:gap-7">
                        <Link to={ROUTES.product(line.product.slug)} className="block">
                          <SmartImage
                            src={line.product.images[0]}
                            alt={line.product.name}
                            ratio="aspect-square"
                            rounded="rounded-luxe"
                          />
                        </Link>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="mj-eyebrow mb-2 text-charcoal-50">
                                {line.product.metal} · {line.product.purity.split(' ')[0]}
                              </p>
                              <h2 className="font-display text-[1.125rem] leading-snug">
                                <Link
                                  to={ROUTES.product(line.product.slug)}
                                  className="text-charcoal transition-colors duration-300 hover:text-bronze"
                                >
                                  {line.product.name}
                                </Link>
                              </h2>
                              <p className="mt-2 font-sans text-body-xs text-charcoal-50">
                                {line.size && `${line.product.size.label}: ${line.size} · `}
                                {formatWeight(line.product.grossWeight)} · {line.product.sku}
                              </p>
                            </div>

                            <p className="shrink-0 font-display text-[1.125rem] tabular-nums text-charcoal">
                              {formatPrice(line.lineTotal)}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                            <QuantityStepper
                              value={line.quantity}
                              onChange={(next) => updateCartQuantity(line.key, next)}
                            />
                            <button
                              type="button"
                              onClick={() => removeFromCart(line.key)}
                              className="inline-flex items-center gap-2 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-50 transition-colors duration-300 hover:text-error"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>

                <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-charcoal/10 pt-8">
                  <Link
                    to={ROUTES.collection('all')}
                    className="mj-link font-sans text-label uppercase tracking-wider2 text-charcoal"
                  >
                    Continue browsing
                  </Link>
                </div>
              </div>

              {/* ----------------------------------------------- summary */}
              <div className="lg:col-span-5 xl:col-span-4">
                <Reveal delay={0.1}>
                  <div className="lg:sticky lg:top-32">
                    <div className="mj-panel p-7 sm:p-8">
                      <h2 className="font-display text-display-xs">Order summary</h2>

                      {/* --------------------------------------- coupon */}
                      <form onSubmit={applyCoupon} className="mt-7">
                        <label htmlFor="coupon" className="mj-field-label">
                          Promotional code
                        </label>
                        <div className="flex gap-2.5">
                          <div className="relative flex-1">
                            <Tag
                              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-50"
                              strokeWidth={1.4}
                              aria-hidden="true"
                            />
                            <input
                              id="coupon"
                              value={coupon}
                              onChange={(event) => setCoupon(event.target.value)}
                              placeholder="MAYURA10"
                              className="mj-field-box pl-11 uppercase tracking-wide"
                            />
                          </div>
                          <Button type="submit" variant="outline" size="sm" className="shrink-0">
                            Apply
                          </Button>
                        </div>
                        {applied && (
                          <p className="mt-3 flex items-center gap-2 font-sans text-body-xs text-success-dark">
                            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                            {applied.code} applied — {applied.label}
                          </p>
                        )}
                        {couponError && (
                          <p className="mt-3 font-sans text-body-xs text-error">{couponError}</p>
                        )}
                      </form>

                      {/* -------------------------------------- totals */}
                      <dl className="mt-8 space-y-3.5 border-t border-charcoal/10 pt-7">
                        <div className="flex justify-between gap-4">
                          <dt className="font-sans text-body-sm text-charcoal-200">Subtotal</dt>
                          <dd className="font-sans text-body-sm tabular-nums text-charcoal">
                            {formatPrice(cartSubtotal)}
                          </dd>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between gap-4">
                            <dt className="font-sans text-body-sm text-success-dark">
                              Discount ({applied.code})
                            </dt>
                            <dd className="font-sans text-body-sm tabular-nums text-success-dark">
                              −{formatPrice(discount)}
                            </dd>
                          </div>
                        )}

                        <div className="flex justify-between gap-4">
                          <dt className="font-sans text-body-sm text-charcoal-200">
                            Insured delivery
                          </dt>
                          <dd
                            className={cn(
                              'font-sans text-body-sm tabular-nums',
                              shipping === 0 ? 'text-success-dark' : 'text-charcoal',
                            )}
                          >
                            {shipping === 0 ? 'Free' : formatPrice(shipping)}
                          </dd>
                        </div>

                        <div className="flex justify-between gap-4 border-t border-charcoal/10 pt-5">
                          <dt className="font-display text-[1.125rem] text-charcoal">Total</dt>
                          <dd className="font-display text-[1.375rem] tabular-nums text-charcoal">
                            {formatPrice(total)}
                          </dd>
                        </div>
                      </dl>

                      <p className="mt-3 font-sans text-body-xs leading-relaxed text-charcoal-50">
                        Inclusive of 3% GST. Gold-based prices are finalised at the rate on the day
                        of billing.
                      </p>

                      <Button
                        variant="primary"
                        fullWidth
                        className="mt-7"
                        to={ROUTES.checkout}
                        icon={ArrowRight}
                      >
                        Proceed to checkout
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        className="mt-3"
                        href={CONTACT.whatsappUrl}
                        target="_blank"
                      >
                        Confirm on WhatsApp instead
                      </Button>

                      <ul className="mt-8 space-y-3.5 border-t border-charcoal/10 pt-7">
                        {[
                          { icon: Truck, text: `Insured despatch — delivery by ${estimatedDelivery(6)}` },
                          { icon: ShieldCheck, text: 'BIS hallmarked with certificates in the box' },
                          { icon: Gift, text: 'Complimentary gift packaging on every order' },
                        ].map((item) => (
                          <li key={item.text} className="flex gap-3">
                            <item.icon
                              className="mt-0.5 h-4 w-4 shrink-0 text-bronze"
                              strokeWidth={1.3}
                              aria-hidden="true"
                            />
                            <span className="text-body-xs leading-relaxed text-charcoal-200">
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              eyebrow="Nothing in the bag"
              title="Your bag is empty"
              copy="Add a piece and it will wait here. Nothing is charged on this website — the bag simply keeps your selection together until you call, message or visit."
              primaryAction={{ label: 'Browse the collection', to: ROUTES.collection('all') }}
              secondaryAction={{ label: 'View your wishlist', to: ROUTES.wishlist }}
            />
          )}
        </div>
      </section>

      {!cartLines.length && (
        <ProductRail
          eyebrow="Most repeated"
          title="Best sellers"
          products={BEST_SELLERS.slice(0, 8)}
          background="bg-ivory-300"
        />
      )}
    </>
  )
}
