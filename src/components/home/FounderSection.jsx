import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import { OWNER, BRAND } from '@constants/site'
import SmartImage from '@components/common/SmartImage'
import Reveal from '@components/motion/Reveal'

/**
 * Founder's note — a quiet editorial block near the foot of the homepage.
 *
 * IMAGE PLACEHOLDER: `FOUNDER_IMAGE` below currently points at an editorial
 * photograph from the existing library. Replace it with the actual founder
 * portrait supplied by the client — drop the file at
 * /public/images/brand/founder.jpg and update the constant. Nothing else
 * needs to change.
 */
const FOUNDER_IMAGE = '/images/editorial/heritage-mother-daughter.jpg' // TODO(client): replace with founder portrait

export default function FounderSection() {
  return (
    <section className="border-y border-charcoal/[0.07] bg-ivory-300" aria-labelledby="founder-note">
      <div className="mj-container py-section-sm">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-arch-sm bg-champagne-100 lg:mx-0">
              <SmartImage
                src={FOUNDER_IMAGE}
                alt={`${OWNER.name}, ${OWNER.role} of ${BRAND.name}`}
                ratio="aspect-[4/5]"
                rounded="rounded-arch-sm"
              />
              <span
                className="pointer-events-none absolute inset-0 rounded-arch-sm ring-1 ring-inset ring-gold/25"
                aria-hidden="true"
              />
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-7">
            <p className="mj-eyebrow mb-5">From the proprietor</p>
            <h2 id="founder-note" className="mj-display text-display-md text-charcoal">
              A note from {OWNER.name}
            </h2>

            <blockquote className="mt-8 border-l-2 border-gold/60 pl-6 font-serif text-[1.25rem] italic leading-[1.85] text-charcoal-300 sm:text-[1.375rem]">
              “{OWNER.message}”
            </blockquote>

            <p className="mt-8 font-sans text-body font-medium text-charcoal">{OWNER.name}</p>
            <p className="mt-1 font-sans text-eyebrow uppercase tracking-luxe text-bronze">
              {OWNER.role} · {BRAND.name}
            </p>

            <Link
              to={ROUTES.legacy}
              className="mj-link mt-9 inline-flex items-center gap-2.5 font-sans text-label uppercase tracking-wider2 text-charcoal"
            >
              Read the Mayura story
              <ArrowRight className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
