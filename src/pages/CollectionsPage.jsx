import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { COLLECTIONS } from '@data/collections'
import { DEPARTMENTS, TYPES } from '@data/categories'
import { useDocumentTitle } from '@hooks/index'
import PageHero from '@components/layout/PageHero'
import SectionHeading from '@components/common/SectionHeading'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import { CategoryCard } from '@components/cards/index.jsx'
import cn from '@utils/cn'

export default function CollectionsPage() {
  useDocumentTitle('Collections')

  return (
    <>
      <PageHero
        eyebrow="The collections"
        title="Six houses, one workshop"
        lede="Each collection begins as a story rather than a price point. Bridal heirlooms, everyday diamonds, temple gold — and the quiet pieces that sit between them."
        image="/images/editorial/layered-haram-trunk.jpg"
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Collections' }]}
        height="md"
      />

      {/* ============================================ alternating editorial */}
      <section className="mj-section bg-ivory">
        <div className="mj-container space-y-24 lg:space-y-34">
          {COLLECTIONS.map((collection, index) => {
            const flip = index % 2 === 1
            return (
              <article
                key={collection.slug}
                className="group/coll grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
              >
                <div className={cn('lg:col-span-7', flip && 'lg:order-2')}>
                  <Link to={ROUTES.collection(collection.slug)} className="block">
                    <ImageReveal
                      src={collection.heroImage}
                      alt={collection.name}
                      ratio="aspect-[4/3]"
                      imgClassName="transition-transform duration-1200 ease-luxe group-hover/coll:scale-[1.03]"
                    />
                  </Link>
                </div>

                <div className={cn('lg:col-span-5', flip && 'lg:order-1')}>
                  <Reveal direction={flip ? 'right' : 'left'}>
                    <p className="mj-eyebrow mb-5">
                      {String(index + 1).padStart(2, '0')} — {collection.kicker}
                    </p>
                    <h2 className="mj-display text-display-md">{collection.name}</h2>
                    <p className="mt-3 font-serif text-[1.25rem] italic text-bronze">
                      {collection.meaning}
                    </p>
                    <p className="mt-7 text-body leading-[1.9] text-charcoal-200">
                      {collection.intro}
                    </p>
                    <p className="mt-6 border-t border-charcoal/10 pt-6 font-sans text-body-xs uppercase tracking-wide2 text-charcoal-50">
                      {collection.pieces}
                    </p>

                    <Link
                      to={ROUTES.collection(collection.slug)}
                      className="group/link mt-8 inline-flex items-center gap-3 font-sans text-label uppercase tracking-wider2 text-charcoal transition-colors duration-300 hover:text-bronze"
                    >
                      <span className="mj-underline">Explore {collection.name}</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/link:translate-x-1"
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                    </Link>
                  </Reveal>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ==================================================== by department */}
      <section className="mj-section bg-ivory-300">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Shop by department"
            title="Or start from the occasion"
            align="center"
            flourish
            className="mb-14 lg:mb-18"
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
            {DEPARTMENTS.map((department, index) => (
              <CategoryCard key={department.slug} category={department} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= by piece */}
      <section className="mj-section bg-ivory">
        <div className="mj-container">
          <SectionHeading
            eyebrow="Shop by piece"
            title="Or simply by what it is"
            align="center"
            className="mb-14 lg:mb-16"
          />
          <ul className="flex flex-wrap justify-center gap-3">
            {TYPES.map((type) => (
              <li key={type.slug}>
                <Link
                  to={ROUTES.collection(type.slug)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-charcoal/12 px-6 py-3.5 font-sans text-label uppercase tracking-wider2 text-charcoal-200 transition-all duration-400 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-gold/[0.07] hover:text-bronze"
                >
                  {type.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
