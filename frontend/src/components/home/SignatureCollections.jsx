import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { COLLECTIONS } from '@data/collections'
import SectionHeading from '@components/common/SectionHeading'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import { CollectionCard } from '@components/cards/index.jsx'

/**
 * An asymmetrical collections block: one large editorial panel with the lead
 * collection, then a row of three tall cards. Deliberately not a 3×2 grid.
 */
export default function SignatureCollections() {
  const [lead, ...rest] = COLLECTIONS

  return (
    <section className="mj-section bg-ivory-300" aria-labelledby="signature-collections">
      <div className="mj-container">
        <SectionHeading
          id="signature-collections"
          eyebrow="Signature collections"
          title="Six houses, one workshop"
          lede="Each collection begins as a story rather than a price point. Bridal heirlooms, everyday diamonds, temple gold — and the pieces that sit quietly between them."
          link={ROUTES.collections}
          linkLabel="All collections"
          className="mb-14 lg:mb-20"
        />

        {/* ------------------------------------------------- lead panel */}
        <article className="group/lead mb-16 grid gap-10 lg:mb-20 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <Link to={ROUTES.collection(lead.slug)} className="block">
              <ImageReveal
                src={lead.heroImage}
                alt={lead.name}
                ratio="aspect-[4/3] lg:aspect-[16/11]"
                imgClassName="transition-transform duration-1200 ease-luxe group-hover/lead:scale-[1.03]"
              />
            </Link>
          </div>

          <div className="lg:col-span-5">
            <Reveal direction="left">
              <p className="mj-eyebrow mb-5">{lead.kicker}</p>
              <h3 className="mj-display text-display-md">{lead.name}</h3>
              <p className="mt-3 font-serif text-[1.25rem] italic text-bronze">{lead.meaning}</p>
              <p className="mt-7 max-w-md text-body leading-[1.9] text-charcoal-200">
                {lead.intro}
              </p>
              <p className="mt-6 font-sans text-body-xs uppercase tracking-wide2 text-charcoal-50">
                {lead.pieces}
              </p>

              <Link
                to={ROUTES.collection(lead.slug)}
                className="group/link mt-9 inline-flex items-center gap-3 font-sans text-label uppercase tracking-wider2 text-charcoal transition-colors duration-300 hover:text-bronze"
              >
                <span className="mj-underline">Explore {lead.name}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/link:translate-x-1"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
        </article>

        {/* ------------------------------------------------ supporting row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {rest.slice(0, 3).map((collection, index) => (
            <CollectionCard key={collection.slug} collection={collection} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
