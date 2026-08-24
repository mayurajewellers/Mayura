import { SHOP_CATEGORIES } from '@data/homepage'
import { ROUTES } from '@constants/routes'
import SectionHeading from '@components/common/SectionHeading'
import { CategoryCard } from '@components/cards/index.jsx'

/**
 * The six primary category windows, directly beneath the hero:
 * Gold · Diamond · Gemstones · Italian · Gold Coins · Kids.
 */
export default function ShopByCategory() {
  return (
    <section className="mj-section-sm bg-ivory pt-10 lg:pt-14" aria-labelledby="shop-by-category">
      <div className="mj-container">
        <SectionHeading
          id="shop-by-category"
          eyebrow="Shop by category"
          title="Find your perfect piece"
          lede="Six ways into the collection — start with the metal, the stone, or the person it is for."
          align="center"
          flourish
          className="mb-12 lg:mb-16"
          link={ROUTES.collection('all')}
          linkLabel="View everything"
        />

        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 lg:gap-x-8 lg:gap-y-12 xl:grid-cols-6">
          {SHOP_CATEGORIES.map((category, index) => (
            <CategoryCard key={category.slug} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
