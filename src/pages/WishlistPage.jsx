import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { useShop } from '@context/ShopContext'
import { useDocumentTitle } from '@hooks/index'
import { formatPrice, formatWeight } from '@utils/format'
import PageHero from '@components/layout/PageHero'
import ProductRail from '@components/home/ProductRail'
import SmartImage from '@components/common/SmartImage'
import EmptyState from '@components/common/EmptyState'
import Button from '@components/common/Button'
import { Badge } from '@components/common/index.jsx'
import { Stagger, StaggerItem } from '@components/motion/Stagger'
import { BEST_SELLERS } from '@data/products'

export default function WishlistPage() {
  useDocumentTitle('Wishlist')
  const { wishlistProducts, toggleWishlist, moveWishlistItemToCart, clearWishlist } = useShop()

  return (
    <>
      <PageHero
        eyebrow="Saved pieces"
        title="Your wishlist"
        lede={
          wishlistProducts.length
            ? `${wishlistProducts.length} ${wishlistProducts.length === 1 ? 'piece' : 'pieces'} put aside. Bring the list to the counter and we will have them ready on a tray.`
            : undefined
        }
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Wishlist' }]}
      />

      <section className="mj-section bg-ivory">
        <div className="mj-container">
          {wishlistProducts.length ? (
            <>
              <div className="mb-10 flex items-center justify-between border-b border-charcoal/10 pb-5">
                <p className="font-sans text-body-sm text-charcoal-100">
                  <span className="tabular-nums text-charcoal">{wishlistProducts.length}</span> saved
                </p>
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="inline-flex items-center gap-2 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-100 transition-colors duration-300 hover:text-error"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
                  Clear wishlist
                </button>
              </div>

              <Stagger className="space-y-5">
                {wishlistProducts.map((product) => (
                  <StaggerItem key={product.id}>
                    <article className="group/wish grid grid-cols-[7rem_1fr] items-center gap-5 rounded-card border border-charcoal/[0.07] bg-white/55 p-4 transition-all duration-500 ease-luxe hover:border-charcoal/12 hover:shadow-card sm:grid-cols-[9rem_1fr_auto] sm:gap-7 sm:p-5">
                      <Link to={ROUTES.product(product.slug)} className="block">
                        <SmartImage
                          src={product.images[0]}
                          alt={product.name}
                          ratio="aspect-square"
                          rounded="rounded-luxe"
                        />
                      </Link>

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <p className="mj-eyebrow text-charcoal-50">
                            {product.metal} · {product.purity.split(' ')[0]}
                          </p>
                          {product.badge && <Badge tone="gold">{product.badge}</Badge>}
                        </div>

                        <h2 className="font-display text-[1.125rem] leading-snug">
                          <Link
                            to={ROUTES.product(product.slug)}
                            className="text-charcoal transition-colors duration-300 hover:text-bronze"
                          >
                            {product.name}
                          </Link>
                        </h2>

                        <p className="mt-2 font-sans text-body-xs text-charcoal-50">
                          {formatWeight(product.grossWeight)} · {product.sku}
                        </p>

                        <p className="mt-3 font-display text-[1.125rem] tabular-nums text-charcoal">
                          {formatPrice(product.price)}
                        </p>

                        {/* mobile actions */}
                        <div className="mt-4 flex flex-wrap gap-2.5 sm:hidden">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => moveWishlistItemToCart(product)}
                          >
                            Move to bag
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWishlist(product)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* desktop actions */}
                      <div className="hidden shrink-0 flex-col items-end gap-3 sm:flex">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShoppingBag}
                          iconPosition="left"
                          onClick={() => moveWishlistItemToCart(product)}
                        >
                          Move to bag
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product)}
                          className="inline-flex items-center gap-2 font-sans text-[0.6875rem] uppercase tracking-wide2 text-charcoal-50 transition-colors duration-300 hover:text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </Stagger>

              <div className="mt-14 flex flex-col items-center gap-4 border-t border-charcoal/10 pt-12 text-center">
                <p className="max-w-lg text-body-sm leading-[1.9] text-charcoal-200">
                  Your wishlist is stored only in this browser — nothing is sent anywhere. Screenshot
                  it, or send us the piece names on WhatsApp and we will hold them for you.
                </p>
                <Button variant="outline" to={ROUTES.collection('all')} className="mt-2">
                  Continue browsing
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Heart}
              eyebrow="Nothing saved yet"
              title="Your wishlist is empty"
              copy="Tap the heart on any piece to put it aside. The list lives in this browser, so you can build it over a few visits and bring it to the counter when you are ready."
              primaryAction={{ label: 'Browse the collection', to: ROUTES.collection('all') }}
              secondaryAction={{ label: 'See bridal', to: ROUTES.collection('bridal-collection') }}
            />
          )}
        </div>
      </section>

      {!wishlistProducts.length && (
        <ProductRail
          eyebrow="Somewhere to start"
          title="Our best sellers"
          products={BEST_SELLERS.slice(0, 8)}
          background="bg-ivory-300"
        />
      )}
    </>
  )
}
