import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@constants/routes'
import ImageReveal from '@components/motion/ImageReveal'
import Reveal from '@components/motion/Reveal'
import RevealHeading from '@components/motion/RevealHeading'

/**
 * An asymmetrical two-image bridal feature — a tall portrait offset against a
 * smaller still life, with the copy set into the whitespace between them.
 */
export default function BridalFeature() {
  return (
    <section className="mj-section bg-ivory" aria-labelledby="bridal-feature">
      <div className="mj-container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ------------------------------------------------ tall portrait */}
          <div className="lg:col-span-5">
            <ImageReveal
              src="/images/editorial/bride-telugu.jpg"
              alt="A bride wearing a layered temple gold necklace and jhumkas"
              ratio="aspect-[3/4]"
            />
          </div>

          {/* -------------------------------------------------------- copy */}
          <div className="flex flex-col justify-center lg:col-span-4 lg:px-6 xl:px-10">
            <Reveal>
              <p className="mj-eyebrow mb-6">The bridal atelier</p>
            </Reveal>

            <RevealHeading
              as="h2"
              id="bridal-feature"
              text="Four months, three fittings, one suite."
              className="mj-display text-display-md"
            />

            <Reveal delay={0.15}>
              <p className="mt-7 text-body leading-[1.9] text-charcoal-200">
                A wedding is not one outfit — it is seven days of them, and the set that works for
                the muhurtham is often unwearable at the sangeet. We plan bridal orders as a whole:
                the heavy piece for the ceremony, the lighter ones for the days around it, and the
                one thing she will still be wearing at fifty.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <ul className="mt-9 space-y-3.5 border-t border-charcoal/10 pt-8">
                {[
                  'Silver sample before any gold is cut',
                  'Weights agreed in writing before the deposit',
                  'Three fittings, the last with the blouse',
                  'Hand-delivered in Mumbai on the morning',
                ].map((item) => (
                  <li key={item} className="flex gap-3.5 text-body-sm text-charcoal-200">
                    <span
                      className="mt-[0.55rem] h-1 w-1 shrink-0 rotate-45 bg-gold"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.3}>
              <Link
                to={ROUTES.collection('bridal-collection')}
                className="group/bridal mt-10 inline-flex items-center gap-3 font-sans text-label uppercase tracking-wider2 text-charcoal transition-colors duration-300 hover:text-bronze"
              >
                <span className="mj-underline">See the bridal collection</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-500 ease-luxe group-hover/bridal:translate-x-1"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>

          {/* --------------------------------------------- offset still life */}
          <div className="lg:col-span-3 lg:pt-24">
            <ImageReveal
              src="/images/editorial/bridal-ruby-haram.jpg"
              alt="A ruby and emerald bridal haram"
              ratio="aspect-[3/4]"
              delay={0.15}
            />
            <Reveal delay={0.3}>
              <p className="mt-5 font-serif text-body-sm italic leading-relaxed text-charcoal-100">
                Anantara Ruby Haram — 186 natural Burmese rubies, fourteen weeks in the workshop.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
