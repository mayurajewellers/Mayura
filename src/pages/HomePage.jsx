import { useState } from 'react'
import { ROUTES } from '@constants/routes'
import { useDocumentTitle } from '@hooks/index'
import { BEST_SELLERS, NEW_ARRIVALS, PRODUCTS } from '@data/products'
import Hero from '@components/home/Hero'
import ShopByCategory from '@components/home/ShopByCategory'
import TrustStrip from '@components/home/TrustStrip'
import ProductRail from '@components/home/ProductRail'
import SignatureCollections from '@components/home/SignatureCollections'
import CraftsmanshipBanner from '@components/home/CraftsmanshipBanner'
import BridalFeature from '@components/home/BridalFeature'
import MayuraPromises from '@components/home/MayuraPromises'
import TestimonialsSection from '@components/home/TestimonialsSection'
import FounderSection from '@components/home/FounderSection'
import InstagramGallery from '@components/home/InstagramGallery'
import VisitStore from '@components/home/VisitStore'
import InsiderSignup from '@components/home/InsiderSignup'
import BrandsFamily from '@components/home/BrandsFamily'
import DiamondCuts from '@components/home/DiamondCuts'
import QuickView from '@components/collection/QuickView'

export default function HomePage() {
  useDocumentTitle('Mayura Jewellers')
  const [quickView, setQuickView] = useState(null)

  /* Enough of the catalogue for the rails without over-fetching the page. */
  const newArrivals = [...NEW_ARRIVALS, ...PRODUCTS.filter((p) => !p.badge)].slice(0, 8)
  const bestSellers = BEST_SELLERS.slice(0, 8)

  return (
    <>
      <Hero />
      <ShopByCategory />
      <TrustStrip />

      <ProductRail
        eyebrow="New this season"
        title="Just arrived"
        lede="Eight pieces that came off the bench this month — lighter chains, a new enamel ring and the first of the winter bridal work."
        products={newArrivals}
        link={ROUTES.collection('all')}
        linkLabel="View all"
        onQuickView={setQuickView}
      />

      <SignatureCollections />
      <CraftsmanshipBanner />

      <ProductRail
        eyebrow="Most repeated"
        title="Best sellers"
        lede="The pieces customers come back for — and the ones they send their sisters in for."
        products={bestSellers}
        link={ROUTES.collection('all')}
        linkLabel="Shop best sellers"
        background="bg-ivory-300"
        onQuickView={setQuickView}
      />

      <BridalFeature />
      <MayuraPromises />
      <TestimonialsSection />
      <FounderSection />
      <InstagramGallery />
      <VisitStore />

      <InsiderSignup />
      <BrandsFamily />
      <DiamondCuts />

      <QuickView product={quickView} open={Boolean(quickView)} onClose={() => setQuickView(null)} />
    </>
  )
}
