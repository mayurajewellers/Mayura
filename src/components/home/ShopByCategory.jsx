import { DEPARTMENTS } from '@data/categories'
import { ROUTES } from '@constants/routes'
import SectionHeading from '@components/common/SectionHeading'
import { CategoryCard } from '@components/cards/index.jsx'

export default function ShopByCategory() {
  return (
    <section className="mj-section bg-ivory" aria-labelledby="shop-by-category">
      <div className="mj-container">
        <SectionHeading
          id="shop-by-category"
          eyebrow="Shop by category"
          title="Six ways into the collection"
          lede="Most people arrive knowing the occasion rather than the piece. Start where you are."
          align="center"
          flourish
          className="mb-14 lg:mb-20"
          link={ROUTES.collection('all')}
          linkLabel="View everything"
        />

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
          {DEPARTMENTS.map((department, index) => (
            <CategoryCard key={department.slug} category={department} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
